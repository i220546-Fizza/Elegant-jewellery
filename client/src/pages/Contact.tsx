import { useState } from 'react';
import toast from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';
import { contactApi } from '../services';
import { getErrorMessage } from '../lib/api';
import { CONTACT_EMAIL, CONTACT_PHONE } from '../lib/site';
import { useTitle } from '../lib/useTitle';

const Contact = () => {
  useTitle('Contact', 'Contact NB Classic Scents client care.');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      setSent(await contactApi.send(form));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Client care" title="Contact" crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}>
        Our advisors are here to help you choose a fragrance, follow an order or arrange a gift.
      </PageHeader>
      <section className="container-lux grid gap-16 py-20 lg:grid-cols-12 lg:py-28">
        <div className="space-y-10 lg:col-span-4">
          <div>
            <p className="eyebrow">Email</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 block font-serif text-2xl hover:text-stone">
              {CONTACT_EMAIL}
            </a>
          </div>
          {CONTACT_PHONE && (
            <div>
              <p className="eyebrow">Telephone</p>
              <a href={`tel:${CONTACT_PHONE}`} className="mt-3 block font-serif text-2xl">
                {CONTACT_PHONE}
              </a>
            </div>
          )}
          <div>
            <p className="eyebrow">Hours</p>
            <p className="mt-3 text-sm text-stone">Monday – Saturday, 10:00 – 19:00 (PKT)</p>
          </div>
          <div>
            <p className="eyebrow">Response time</p>
            <p className="mt-3 text-sm text-stone">We reply to every enquiry within one working day.</p>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          {sent ? (
            <div className="border-l-2 border-gold py-4 pl-8">
              <p className="font-serif text-4xl">Thank you.</p>
              <p className="mt-4 text-stone">{sent}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-8 sm:grid-cols-2">
              <label className="block">
                <span className="label">Name</span>
                <input className="field" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </label>
              <label className="block">
                <span className="label">Email</span>
                <input className="field" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="label">Subject</span>
                <input className="field" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              </label>
              <label className="block sm:col-span-2">
                <span className="label">Message</span>
                <textarea className="field min-h-[160px] resize-y" required maxLength={3000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              </label>
              <div>
                <button type="submit" disabled={busy} className="btn-dark">
                  {busy ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default Contact;
