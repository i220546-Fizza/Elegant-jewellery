import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { contactApi, type ContactMessage } from '../../services';
import { AdminHeader } from '../components/ui';
import { EmptyState, Spinner } from '../../components/ui/Feedback';
import { formatDate } from '../../lib/format';
import { getErrorMessage } from '../../lib/api';

const Messages = () => {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const load = useCallback(() => {
    contactApi.list().then(setMessages).catch((e) => toast.error(getErrorMessage(e)));
  }, []);
  useEffect(load, [load]);

  const markRead = async (m: ContactMessage) => {
    await contactApi.markRead(m._id, !m.isRead).catch(() => {});
    load();
  };
  const remove = async (m: ContactMessage) => {
    if (!window.confirm('Delete this message?')) return;
    await contactApi.remove(m._id).catch(() => {});
    load();
  };

  return (
    <>
      <AdminHeader eyebrow="Client care" title="Messages" />
      {!messages ? (
        <Spinner />
      ) : messages.length === 0 ? (
        <EmptyState title="No messages" text="Enquiries sent through the contact page appear here." />
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => (
            <li key={m._id} className={`card-panel p-5 ${m.isRead ? 'opacity-70' : '!border-ink/40'}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p>
                  {!m.isRead && <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle" />}
                  {m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || 'Your enquiry'}`)}`} className="text-stone underline-offset-4 hover:underline">{m.email}</a>
                </p>
                <p className="text-xs text-stone">{formatDate(m.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {m.subject && <p className="mt-2 font-serif text-xl">{m.subject}</p>}
              <p className="mt-2 whitespace-pre-line text-sm text-ink/80">{m.message}</p>
              <div className="mt-4 flex gap-5 font-sans text-[10px] uppercase tracking-wide2 text-stone">
                <button type="button" onClick={() => markRead(m)} className="hover:text-ink">
                  Mark as {m.isRead ? 'unread' : 'read'}
                </button>
                <button type="button" onClick={() => remove(m)} className="hover:text-ink">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default Messages;
