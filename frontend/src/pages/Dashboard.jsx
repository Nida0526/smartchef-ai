import { useRef, useEffect, useState } from 'react';
import { Send, Save, Copy, Trash2, CheckCheck, ChefHat, Mic, MicOff, Salad, Flame, Coffee, Soup } from 'lucide-react';
import { savedApi } from '../lib/api';
import { useToast } from '../context/ToastContext';
import useChat from '../hooks/useChat';
import Markdown from '../components/ui/Markdown';
import Skeleton from '../components/ui/Skeleton';
import { FryingPan } from '../components/ui/KitchenArt';

const SUGGESTIONS = [
  { icon: <Salad size={15} />, label: 'Quick & healthy', prompt: 'Suggest a healthy dinner I can make in under 20 minutes' },
  { icon: <Flame size={15} />, label: 'Use up leftovers', prompt: 'What can I cook with leftover chicken and mixed veggies?' },
  { icon: <Coffee size={15} />, label: 'Breakfast ideas', prompt: 'Give me 3 quick breakfast recipes using eggs and bread' },
  { icon: <Soup size={15} />, label: 'One-pot comfort', prompt: 'Easy one-pot dinner ideas with pantry staples' },
];

function VoiceButton({ onResult, disabled }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const toggle = () => {
    if (!supported) return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      if (transcript) onResult(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <button
      type="button"
      className={`mic-btn ${listening ? 'mic-listening' : ''}`}
      onClick={toggle}
      disabled={disabled}
      title={supported ? 'Speak your ingredients or request' : 'Voice input not supported in this browser'}
      aria-label="Voice input"
    >
      {listening ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  );
}

function UserMessage({ text }) {
  return (
    <div className="message user">
      <span className="message-text">{text}</span>
    </div>
  );
}

function AiMessage({ text, streaming }) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      notify('Copied to clipboard', 'success', 2000);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify('Failed to copy', 'error');
    }
  };

  const handleSave = async () => {
    try {
      const lines = text.split('\n');
      const title = lines.find(l => l.includes('###'))?.replace(/#{1,3}\s/g, '').trim() || 'Saved Recipe';
      await savedApi.create({ title, ingredients: ['See recipe text'], instructions: [text] });
      notify('Recipe saved!', 'success');
    } catch {
      notify('Failed to save recipe', 'error');
    }
  };

  return (
    <div className="message ai">
      <div className="message-content">
        <Markdown text={text} />
        {streaming && <span className="typing-cursor">|</span>}
      </div>
      {!streaming && text && (
        <div className="message-actions">
          <button className="action-btn" onClick={handleCopy} title="Copy response">
            {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
          </button>
          <button className="action-btn" onClick={handleSave} title="Save recipe">
            <Save size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { messages, loading, historyLoading, send, clear } = useChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;
    send(input);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      <div className="glass-panel chat-panel">
        <div className="chat-header">
          <div className="chat-header-left">
            <ChefHat size={18} className="chat-header-icon" />
            <h2>Chef's Corner</h2>
          </div>
          {messages.length > 1 && !historyLoading && (
            <button className="btn-clear" onClick={clear} disabled={loading}>
              <Trash2 size={13} /> Clear
            </button>
          )}
        </div>

        <div className="chat-history" ref={scrollRef}>
          {historyLoading ? (
            <div className="chat-skeleton">
              <Skeleton height="48px" width="60%" radius="16px" />
              <Skeleton height="64px" width="45%" radius="16px" style={{ marginLeft: 'auto' }} />
              <Skeleton height="80px" width="55%" radius="16px" />
            </div>
          ) : messages.length === 1 && !loading ? (
            <div className="chat-welcome">
              <div className="chat-hero">
                <FryingPan className="chat-hero-art" />
                <h3>What are we cooking today?</h3>
                <p>Ask SmartChef for a recipe, scan your fridge, or get inspired — hands-free.</p>
              </div>
              <div className="chat-suggestions">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s.label}
                    className="suggestion-chip"
                    onClick={() => send(s.prompt)}
                    title={s.prompt}
                  >
                    {s.icon}
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              m.role === 'user'
                ? <UserMessage key={i} text={m.text} />
                : <AiMessage key={i} text={m.text} streaming={m.streaming} />
            ))
          )}
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <div className="chat-input-wrap">
            <VoiceButton onResult={setInput} disabled={loading} />
            <textarea
              ref={textareaRef}
              className="form-control chat-textarea"
              placeholder="Describe what you want to cook, or what ingredients you have..."
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(); }}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn-send"
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
          <span className="chat-hint">Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line</span>
        </form>
      </div>
    </div>
  );
}