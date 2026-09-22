import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Camera, ThumbsUp, Check } from 'lucide-react';
import Reveal from '../components/Reveal';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', message: '' });
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 md:px-8 md:pt-36">
      <Reveal>
        <p className="layers-eyebrow">Get In Touch</p>
        <h1 className="mt-3 font-display text-4xl text-layers-ink sm:text-5xl">Contact Us</h1>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-14 lg:grid-cols-2">
        <Reveal direction="left">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-layers-accent-soft text-layers-primary">
                <Phone size={18} />
              </span>
              <div>
                <h3 className="font-medium text-layers-ink">Phone</h3>
                <p className="text-sm text-layers-muted">+92 300 1234567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-layers-accent-soft text-layers-primary">
                <Mail size={18} />
              </span>
              <div>
                <h3 className="font-medium text-layers-ink">Email</h3>
                <p className="text-sm text-layers-muted">hello@layersbakeshop.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-layers-accent-soft text-layers-primary">
                <MapPin size={18} />
              </span>
              <div>
                <h3 className="font-medium text-layers-ink">Address</h3>
                <p className="text-sm text-layers-muted">MM Alam Road, Gulberg III, Lahore, Pakistan</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-layers-accent-soft text-layers-primary">
                <Clock size={18} />
              </span>
              <div>
                <h3 className="font-medium text-layers-ink">Opening Hours</h3>
                <p className="text-sm text-layers-muted">Daily, 10:00 AM – 11:00 PM</p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="rounded-full border border-layers-border p-2.5 text-layers-ink hover:border-layers-primary hover:text-layers-primary">
                <Camera size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="rounded-full border border-layers-border p-2.5 text-layers-ink hover:border-layers-primary hover:text-layers-primary">
                <ThumbsUp size={18} />
              </a>
            </div>
            <div className="mt-4 flex h-48 items-center justify-center rounded-2xl bg-layers-surface-alt text-xs uppercase tracking-widest text-layers-muted">
              Map Placeholder
            </div>
          </div>
        </Reveal>

        <Reveal direction="right">
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex h-full flex-col items-center justify-center rounded-2xl border border-layers-border bg-layers-surface p-10 text-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-layers-success/15 text-layers-success">
                <Check size={26} />
              </span>
              <h3 className="mt-4 font-display text-2xl text-layers-ink">Message Sent</h3>
              <p className="mt-2 text-sm text-layers-muted">Thank you for reaching out — we'll get back to you soon.</p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-6 text-sm font-medium text-layers-primary underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-layers-border bg-layers-surface p-8">
              <div>
                <label htmlFor="name" className="text-sm font-medium text-layers-ink">Name</label>
                <input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-layers-ink">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-medium text-layers-ink">Message</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-layers-border px-4 py-3 text-sm focus:border-layers-primary focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-layers-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-layers-primary-hover"
              >
                Send Message
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}
