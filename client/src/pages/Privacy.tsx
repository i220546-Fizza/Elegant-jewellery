import { useEffect } from 'react';
import { EyeIcon } from '../components/Icons';

const Privacy = () => {
  useEffect(() => {
    document.title = 'Privacy Policy | Elegant Jewellery';
  }, []);

  return (
    <div className="container-luxe py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-champagne/15 text-champagne-dark">
          <EyeIcon width={24} height={24} />
        </span>
        <p className="section-kicker mt-6">Trust &amp; Transparency</p>
        <h1 className="section-heading mt-3">Privacy Policy</h1>
      </div>

      <div className="mx-auto mt-12 max-w-2xl space-y-8 text-sm leading-relaxed text-brown-light">
        <div>
          <h2 className="font-display text-xl text-brown-dark">Information We Collect</h2>
          <p className="mt-2">
            When you create an account, place an order, or contact us, we collect the information you provide -
            your name, email, phone number and shipping address - solely to process orders and improve your
            experience with Elegant Jewellery.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-brown-dark">How We Use Your Information</h2>
          <p className="mt-2">
            Your details are used to fulfil orders, send order updates, and, if you opt in, share news about new
            collections. We never sell your personal information to third parties.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-brown-dark">Data Security</h2>
          <p className="mt-2">
            Passwords are encrypted before storage, and access to customer data is restricted to authorised
            personnel only. Payment is currently handled via Cash on Delivery, so no card details are ever
            collected or stored by us.
          </p>
        </div>
        <div>
          <h2 className="font-display text-xl text-brown-dark">Your Rights</h2>
          <p className="mt-2">
            You may access, update or request deletion of your account information at any time from{' '}
            <span className="text-brown-dark">My Account &rarr; Account Settings</span>, or by contacting our
            support team directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
