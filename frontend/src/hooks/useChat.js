import { useCallback, useEffect, useRef, useState } from 'react';
import { chatApi } from '../lib/api';

const WELCOME_MESSAGE = {
  role: 'ai',
  text: 'Hello! I am SmartChef. Tell me what ingredients you have, or what you feel like cooking today!'
};

export default function useChat() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const busyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const loadHistory = async () => {
      try {
        const res = await chatApi.getHistory();
        if (cancelled) return;
        const history = res.data || [];
        if (history.length) {
          const mapped = [];
          history.forEach(h => {
            mapped.push({ role: 'user', text: h.message });
            mapped.push({ role: 'ai', text: h.response });
          });
          setMessages(mapped);
        }
      } catch {
        // 401 handled globally; ignore other failures
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };
    loadHistory();
    return () => { cancelled = true; };
  }, []);

  const send = useCallback(async (text) => {
    const content = typeof text === 'string' ? text.trim() : '';
    if (!content || busyRef.current) return;

    busyRef.current = true;
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', text: content }]);
    const aiIdx = { current: null };

    setMessages(prev => {
      const next = [...prev, { role: 'ai', text: '', streaming: true }];
      aiIdx.current = next.length - 1;
      return next;
    });

    const updateToken = (token) => {
      if (aiIdx.current === null) return;
      setMessages(prev => {
        const copy = [...prev];
        const last = copy[aiIdx.current];
        copy[aiIdx.current] = { ...last, text: last.text + token };
        return copy;
      });
    };

    const finishError = () => {
      if (aiIdx.current === null) return;
      setMessages(prev => {
        const copy = [...prev];
        const last = copy[aiIdx.current];
        copy[aiIdx.current] = {
          ...last,
          text: last.text || 'Sorry, I encountered an error. Please try again.',
          streaming: false
        };
        return copy;
      });
    };

    try {
      await chatApi.stream(content, {
        onToken: updateToken,
        onDone: () => {
          setMessages(prev => {
            const copy = [...prev];
            if (aiIdx.current !== null && copy[aiIdx.current]) {
              copy[aiIdx.current] = { ...copy[aiIdx.current], streaming: false };
            }
            return copy;
          });
        },
        onError: finishError
      });
    } catch {
      finishError();
    } finally {
      busyRef.current = false;
      setLoading(false);
    }
  }, []);

  const clear = useCallback(async () => {
    try {
      await chatApi.clearHistory();
    } catch {
      // ignore
    }
    setMessages([WELCOME_MESSAGE]);
  }, []);

  return { messages, loading, historyLoading, send, clear };
}