import type { ReactNode } from 'react';
import PageHeader from '../../components/ui/PageHeader';
import { AccordionItem } from '../../components/ui/Accordion';
import { useTitle } from '../../lib/useTitle';
import { formatPrice } from '../../lib/format';
import { CONTACT_EMAIL } from '../../lib/site';

const Prose = ({ children }: { children: ReactNode }) => (
  <div className="max-w-3xl space-y-6 text-[15px] leading-relaxed text-stone [&_h2]:mt-12 [&_h2]:font-serif [&_h2]:text-3xl [&_h2]:text-ink [&_strong]:font-normal [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">{children}</div>
);

const Shell = ({ title, eyebrow, intro, children }: { title: string; eyebrow: string; intro?: string; children: ReactNode }) => {
  useTitle(title);
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} crumbs={[{ label: 'Home', to: '/' }, { label: title }]}>
        {intro}
      </PageHeader>
      <section className="container-lux py-20 lg:py-28">{children}</section>
    </>
  );
};

const FAQS: { q: string; a: string }[] = [
  { q: 'What concentration are NB fragrances?', a: 'Our fragrances are eaux de parfum, typically 18–22% perfume oil, composed for longevity of 7–12 hours depending on the scent and your skin.' },
  { q: 'How do I choose a fragrance online?', a: 'Each product page lists the top, heart and base notes, the fragrance family, longevity and sillage. Our Coffret Découverte lets you try six fragrances at home, and its value is redeemable against a full-size bottle.' },
  { q: 'Which payment methods do you accept?', a: 'Cash on delivery, credit and debit cards, and online payment by bank transfer, JazzCash or Easypaisa.' },
  { q: 'How long does delivery take?', a: 'Orders are dispatched within one working day and typically arrive in 2–4 working days within Pakistan.' },
  { q: 'Can I change or cancel my order?', a: 'You can cancel from your account while an order is Pending or Confirmed. Once it is being prepared, please contact us and we will do our best to help.' },
  { q: 'Do you offer gift wrapping?', a: 'Every order arrives in our ivory coffret. Add a gift message in the delivery notes at checkout and we will include a handwritten card.' },
  { q: 'How should I store my fragrance?', a: 'Keep bottles away from direct sunlight and heat, ideally in their box, to preserve the composition for years.' },
];

export const FAQ = () => (
  <Shell title="FAQ" eyebrow="Client care" intro="Answers to the questions we are asked most often.">
    <div className="max-w-3xl border-t border-taupe/80">
      {FAQS.map((f, i) => (
        <AccordionItem key={f.q} title={f.q} defaultOpen={i === 0}>
          {f.a}
        </AccordionItem>
      ))}
    </div>
  </Shell>
);

export const Shipping = () => (
  <Shell title="Shipping" eyebrow="Client care" intro="Every order is prepared by hand and dispatched in our signature coffret.">
    <Prose>
      <h2>Delivery within Pakistan</h2>
      <ul>
        <li>
          <strong>Complimentary</strong> on orders above {formatPrice(20000)}; otherwise {formatPrice(450)}.
        </li>
        <li>Dispatched within one working day; delivered in 2–4 working days.</li>
        <li>A tracking number is added to your order as soon as it ships.</li>
      </ul>
      <h2>International</h2>
      <p>We deliver to selected countries in the Gulf, the United Kingdom and North America. Duties and taxes may apply on arrival. Contact us for a quote before ordering.</p>
      <h2>Cash on delivery</h2>
      <p>Please have the exact amount ready. Our courier may call ahead to confirm your address.</p>
    </Prose>
  </Shell>
);

export const Returns = () => (
  <Shell title="Returns" eyebrow="Client care" intro="If something is not right, we will make it right.">
    <Prose>
      <h2>Our policy</h2>
      <p>Unopened fragrances in their original sealed packaging may be returned within 14 days of delivery for a refund or exchange.</p>
      <p>For hygiene reasons opened fragrances cannot be returned, unless they arrived damaged or faulty.</p>
      <h2>Damaged or incorrect items</h2>
      <p>Please contact us within 48 hours of delivery with your order number and a photograph. We will send a replacement at no cost.</p>
      <h2>How to return</h2>
      <p>Email {CONTACT_EMAIL} with your order number. Refunds are issued to the original payment method, or by bank transfer for cash on delivery orders, within 7 working days of receiving the return.</p>
    </Prose>
  </Shell>
);

export const Privacy = () => (
  <Shell title="Privacy Policy" eyebrow="Legal">
    <Prose>
      <p>NB Classic Scents respects your privacy. This policy explains what we collect and why.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email, phone and saved delivery addresses.</li>
        <li>Order details: items, delivery address and payment method. For card payments we keep only the card brand and last four digits — never the full card number or security code.</li>
        <li>Your bag and wishlist, so they are available on every device.</li>
      </ul>
      <h2>How we use it</h2>
      <p>To fulfil and support your orders, to secure your account, and — only if you opt in — to send occasional news of new creations. We never sell your data.</p>
      <h2>Security</h2>
      <p>Passwords are stored as salted bcrypt hashes. Sessions use secure, httpOnly cookies that page scripts cannot read.</p>
      <h2>Your rights</h2>
      <p>You may request a copy or deletion of your data at any time by emailing {CONTACT_EMAIL}.</p>
    </Prose>
  </Shell>
);

export const Terms = () => (
  <Shell title="Terms" eyebrow="Legal">
    <Prose>
      <h2>Orders</h2>
      <p>An order is a request to purchase. It is accepted once confirmed by us. We may decline or cancel orders in case of pricing errors or insufficient stock, with a full refund of any payment.</p>
      <h2>Prices</h2>
      <p>Prices are shown in Pakistani Rupees (PKR) and include applicable taxes. Discount codes cannot be combined unless stated.</p>
      <h2>Product information</h2>
      <p>Fragrance develops differently on every skin. Longevity and sillage are indicative. Product images are studio renders; bottles may vary slightly.</p>
      <h2>Liability</h2>
      <p>For external use only. Discontinue use if irritation occurs. Keep away from flame and out of reach of children.</p>
    </Prose>
  </Shell>
);
