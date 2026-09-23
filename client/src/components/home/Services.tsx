import { GiftIcon, ShieldIcon, TruckIcon, DropIcon } from '../ui/Icons';
import { formatPrice } from '../../lib/format';

const ITEMS = [
  { Icon: TruckIcon, title: 'Complimentary delivery', text: `On orders above ${formatPrice(20000)}` },
  { Icon: GiftIcon, title: 'Signature gift wrapping', text: 'Ivory coffret and handwritten card' },
  { Icon: DropIcon, title: 'Complimentary samples', text: 'Two discovery vials with every order' },
  { Icon: ShieldIcon, title: 'Secure checkout', text: 'Cash on delivery, card or online payment' },
];

const Services = () => (
  <section className="border-t border-taupe/80">
    <div className="container-lux grid grid-cols-2 gap-y-10 py-14 lg:grid-cols-4">
      {ITEMS.map(({ Icon, title, text }) => (
        <div key={title} className="flex flex-col items-center px-3 text-center">
          <Icon size={26} className="text-gold" />
          <p className="mt-4 font-sans text-[10.5px] uppercase tracking-wide2">{title}</p>
          <p className="mt-2 text-xs text-stone">{text}</p>
        </div>
      ))}
    </div>
  </section>
);

export default Services;
