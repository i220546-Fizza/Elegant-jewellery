import { useState } from 'react';
import toast from 'react-hot-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('Thank you for subscribing to Elegant Jewellery!');
    setEmail('');
  };

  return (
    <section className="bg-brown-dark py-20 text-ivory">
      <div className="container-luxe flex flex-col items-center text-center">
        <p className="section-kicker text-champagne">Stay In Touch</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">Join Our Inner Circle</h2>
        <p className="mt-4 max-w-md text-sm text-ivory/70">
          Be the first to know about new arrivals, exclusive offers and styling inspiration.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full flex-1 rounded-full border border-ivory/20 bg-ivory/5 px-5 py-3 text-sm text-ivory placeholder:text-ivory/50 outline-none focus:border-champagne"
          />
          <button type="submit" className="btn-gold">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
