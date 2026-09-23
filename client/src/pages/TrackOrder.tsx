import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';
import { orderApi } from '../services';
import { getErrorMessage } from '../lib/api';
import { useTitle } from '../lib/useTitle';

const TrackOrder = () => {
  useTitle('Track an order');
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const order = await orderApi.lookup(orderNumber, email);
      navigate(`/order/${order._id}?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader eyebrow="Client care" title="Track an order" crumbs={[{ label: 'Home', to: '/' }, { label: 'Track an order' }]}>
        Enter your order number (it begins with NB-) and the email address used at checkout. Account holders can also see every order in their account.
      </PageHeader>
      <section className="container-lux max-w-xl py-20">
        <form onSubmit={submit} className="space-y-8">
          <label className="block">
            <span className="label">Order number</span>
            <input className="field uppercase" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="NB-XXXXXXX" required />
          </label>
          <label className="block">
            <span className="label">Email</span>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <button type="submit" disabled={busy} className="btn-dark">
            {busy ? 'Searching…' : 'Find my order'}
          </button>
        </form>
      </section>
    </>
  );
};

export default TrackOrder;
