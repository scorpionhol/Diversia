import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X, Plus } from 'lucide-react';

const STORAGE_KEY = 'diversia_chat_session_id';

const ChatWidget = ({ language, t }) => {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem(STORAGE_KEY) || '';
    }
    return '';
  });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const fetchMessages = async (session) => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(session)}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Impossible de charger les messages.');
      }
      const json = await res.json();
      setMessages(json.data || []);
    } catch (err) {
      setError(err.message || 'Erreur de récupération.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchMessages(sessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const saveSession = (session) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, session);
    setSessionId(session);
  };

  const handleSend = async () => {
    if (!input.trim()) {
      setError(language === 'fr' ? 'Veuillez saisir un message.' : 'Please enter a message.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId || undefined, name: name || undefined, email: email || undefined, text: input.trim() })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Impossible d envoyer votre message.');
      }
      const json = await res.json();
      if (json.data?.sessionId) {
        saveSession(json.data.sessionId);
      }
      setMessages((prev) => [...prev, json.data]);
      setInput('');
    } catch (err) {
      setError(err.message || 'Erreur lors de l’envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[340px] max-w-[92vw] bg-slate-950 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between bg-slate-900 px-4 py-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 text-slate-950 p-2 rounded-xl">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{t.chat_widget_title}</p>
                <p className="text-[11px] text-slate-400">{t.chat_widget_subtitle}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto min-h-[240px] max-h-[320px]" ref={scrollRef}>
            {loading && <p className="text-xs text-slate-400 mb-3">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>}
            {messages.length === 0 && !loading ? (
              <div className="text-slate-500 text-sm leading-relaxed">
                {t.chat_widget_no_messages}
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`rounded-3xl p-3 text-sm leading-relaxed ${message.author === 'admin' ? 'bg-amber-500 text-slate-950 self-end ml-auto' : 'bg-slate-800 text-slate-100 self-start'} max-w-[90%]`}> 
                    <div className="font-semibold text-[11px] uppercase tracking-[0.14em] mb-1">
                      {message.author === 'admin' ? (language === 'fr' ? 'Diversia' : 'Diversia') : t.chat_widget_you}
                    </div>
                    <p>{message.text}</p>
                    <div className="mt-2 text-[10px] text-slate-400 text-right">
                      {new Date(message.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 p-4 bg-slate-950">
            <div className="space-y-3">
              <input
                type="text"
                placeholder={t.chat_widget_name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="email"
                placeholder={t.chat_widget_email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <textarea
                rows={3}
                placeholder={t.chat_widget_placeholder}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              {error && <p className="text-xs text-rose-400">{error}</p>}
              <button
                onClick={handleSend}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-950 hover:bg-emerald-400 transition-colors disabled:opacity-60"
              >
                <Send className="h-4 w-4" />
                {t.chat_widget_send}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center gap-2 rounded-full bg-emerald-500 text-slate-950 px-5 py-4 shadow-2xl hover:bg-emerald-400 transition-all duration-200"
      >
        {open ? <X className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
        <span className="text-xs font-bold uppercase tracking-[0.18em]">{open ? t.chat_widget_close : t.chat_widget_button}</span>
      </button>
    </div>
  );
};

export default ChatWidget;
