import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDownIcon, FacebookIcon, InstagramIcon, TwitterIcon } from '../components/Icons';

const FAQS = [
  {
    q: 'How long does delivery take?',
    a: 'Orders are typically delivered within 3-5 business days across Pakistan. You will receive updates as your order progresses through each stage.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We currently accept Cash on Delivery (COD) for all orders, with more payment options coming soon.',
  },
  {
    q: 'Can I return or exchange a product?',
    a: 'Yes, unworn items in original packaging can be returned or exchanged within 7 days of delivery. Please contact us to initiate a return.',
  },
  {
    q: 'Are your materials hypoallergenic?',
    a: 'Most of our pieces are crafted in 18k gold vermeil or sterling silver, which are gentle on sensitive skin. Material details are listed on every product page.',
  },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-brown-dark/10 py-4">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between text-left">
        <span className="font-display text-lg text-brown-dark">{q}</span>
        <ChevronDownIcon className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="mt-3 text-sm leading-relaxed text-brown-light">{a}</p>}
    </div>
  );
};

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us | Elegant Jewellery';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success("Thank you! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', message: '' });
      setSending(false);
    }, 600);
  };

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="section-kicker">We'd Love to Hear From You</p>
        <h1 className="section-heading mt-3">Get in Touch</h1>
        <p className="mt-4 text-brown-light">
          Have a question about an order, a custom request, or just want to say hello? Reach out below.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="card-luxe space-y-4 p-6 sm:p-8">
          <input
            required
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-luxe"
          />
          <input
            required
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="input-luxe"
          />
          <textarea
            required
            placeholder="Your Message"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="input-luxe min-h-[140px]"
          />
          <button type="submit" disabled={sending} className="btn-primary w-full">
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div className="space-y-8">
          <div>
            <h3 className="font-display text-xl text-brown-dark">Contact Information</h3>
            <ul className="mt-4 space-y-2 text-sm text-brown-light">
              <li>Email: elegantjewellery84@gmail.com</li>
              <li>Location: Gulberg III, Lahore, Pakistan</li>
              <li>Hours: Mon - Sat, 10am - 8pm</li>
            </ul>
            <div className="mt-4 flex gap-4 text-brown-dark">
              <a href="#" aria-label="Instagram" className="hover:text-champagne-dark"><InstagramIcon /></a>
              <a href="#" aria-label="Facebook" className="hover:text-champagne-dark"><FacebookIcon /></a>
              <a href="#" aria-label="Twitter" className="hover:text-champagne-dark"><TwitterIcon /></a>
            </div>
          </div>

          <div id="faq" className="scroll-mt-28">
            <h3 className="font-display text-xl text-brown-dark">Frequently Asked Questions</h3>
            <div className="mt-2">
              {FAQS.map((f) => (
                <FaqItem key={f.q} {...f} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
