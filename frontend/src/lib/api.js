import axios from 'axios';
import { API_BASE } from '../config';

const client = axios.create({ baseURL: `${API_BASE}/api` });

client.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) {
    cfg.headers['x-auth-token'] = token;
  }
  return cfg;
});

client.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: data => client.post('/auth/register', data),
  login: data => client.post('/auth/login', data)
};

export const chatApi = {
  send: message => client.post('/ai/chat', { message }),
  getHistory: () => client.get('/ai/chat/history'),
  clearHistory: () => client.delete('/ai/chat/history'),
  stream: (message, { onToken, onDone, onError }) => streamChat(message, onToken, onDone, onError)
};

export const preferencesApi = {
  get: () => client.get('/ai/preferences'),
  update: data => client.post('/ai/preferences', data)
};

export const savedApi = {
  list: () => client.get('/ai/saved'),
  create: data => client.post('/ai/saved', data),
  remove: id => client.delete(`/ai/saved/${id}`)
};

export const recipeApi = {
  vision: (imageBase64, mimeType) => client.post('/ai/vision', { imageBase64, mimeType }),
  generate: (payload) => client.post('/ai/generate-recipe', payload)
};

async function streamChat(message, onToken, onDone, onError) {
  const token = localStorage.getItem('token');
  let res;
  try {
    res = await fetch(`${API_BASE}/api/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': token || ''
      },
      body: JSON.stringify({ message })
    });
  } catch (err) {
    onError(err);
    return;
  }

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    onError(new Error(`Request failed: ${res.status}`));
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const handleChunk = (chunk) => {
    buffer += chunk;
    let boundary;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const dataLine = rawEvent.split('\n').find(l => l.startsWith('data: '));
      if (!dataLine) continue;
      try {
        const payload = JSON.parse(dataLine.slice(6));
        if (payload.token) onToken(payload.token);
        if (payload.error) onError(new Error('Stream error'));
        if (payload.done) onDone();
      } catch {
        // ignore malformed frames
      }
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      handleChunk(decoder.decode(value, { stream: true }));
    }
    handleChunk(decoder.decode());
  } catch (err) {
    onError(err);
  }
}