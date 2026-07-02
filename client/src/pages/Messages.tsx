import { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import type { Thread, Message, User } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { Avatar, Spinner, VerifiedTick } from '../components/ui';

export default function Messages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [chat, setChat] = useState<{ messages: Message[]; user: User } | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  function loadThreads() {
    return api.get<{ threads: Thread[] }>('/messages/threads').then((r) => setThreads(r.threads));
  }

  useEffect(() => {
    loadThreads().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (active == null) return;
    api.get<{ messages: Message[]; user: User }>(`/messages/with/${active}`).then(setChat);
  }, [active]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  // Auto-open first thread
  useEffect(() => {
    if (active == null && threads.length) setActive(threads[0].other.id);
  }, [threads]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || active == null) return;
    const body = text;
    setText('');
    const r = await api.post<{ message: Message }>('/messages', { to_id: active, body });
    setChat((c) => (c ? { ...c, messages: [...c.messages, r.message] } : c));
    loadThreads();
  }

  if (loading) return <Spinner label="Cargando mensajes..." />;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <h1 className="mb-6 text-3xl font-bold text-white">Centro de <span className="gradient-text">Mensajes</span></h1>

      <div className="grid h-[70vh] overflow-hidden rounded-2xl ring-1 ring-white/[0.06] md:grid-cols-[300px_1fr]">
        {/* Thread list */}
        <div className="overflow-y-auto border-r border-white/[0.06] bg-ink-850/60">
          {threads.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No tienes conversaciones aún. Escribe a un arrendador desde la página de un equipo.</p>
          ) : (
            threads.map((t) => (
              <button
                key={t.other.id}
                onClick={() => setActive(t.other.id)}
                className={`flex w-full items-center gap-3 border-b border-white/[0.04] p-4 text-left transition ${
                  active === t.other.id ? 'bg-brand-500/10' : 'hover:bg-white/[0.03]'
                }`}
              >
                <Avatar src={t.other.avatar} alt={t.other.name} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate font-semibold text-white">{t.other.name}</span>
                    {t.other.verified && <VerifiedTick />}
                  </div>
                  <p className="truncate text-xs text-slate-400">{t.last_message}</p>
                </div>
                {t.unread > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                    {t.unread}
                  </span>
                )}
              </button>
            ))
          )}
        </div>

        {/* Chat */}
        <div className="flex flex-col bg-ink-900/40">
          {chat ? (
            <>
              <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
                <Avatar src={chat.user.avatar} alt={chat.user.name} size={38} />
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-white">{chat.user.name}</span>
                  {chat.user.verified && <VerifiedTick />}
                </div>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {chat.messages.map((m) => {
                  const mine = m.from_id === user?.id;
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                        mine ? 'bg-brand-gradient text-white' : 'bg-ink-800 text-slate-200 ring-1 ring-white/10'
                      }`}>
                        {m.body}
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <form onSubmit={send} className="flex gap-2 border-t border-white/[0.06] p-4">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="input flex-1"
                />
                <button className="btn-primary" disabled={!text.trim()}>Enviar</button>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-slate-500">
              Selecciona una conversación
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
