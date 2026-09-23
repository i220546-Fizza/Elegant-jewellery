// Card handling helpers. Card numbers are validated and only the brand + last
// four digits are ever stored - never the full number or CVC.
//
// NOTE: there is no live payment gateway wired in. To accept real card payments,
// replace `authorizeCard` with a call to your processor (Stripe, PayFast, etc.)
// and pass a tokenised payment method from the client instead of raw digits.

const luhnValid = (digits) => {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
};

const detectBrand = (digits) => {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  if (/^62/.test(digits)) return 'UnionPay';
  return 'Card';
};

const authorizeCard = ({ number, expiry, cvc, name }) => {
  const digits = String(number || '').replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19 || !luhnValid(digits)) {
    throw new Error('Please enter a valid card number');
  }
  const match = String(expiry || '').match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!match) throw new Error('Card expiry must be in MM/YY format');
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) throw new Error('Card expiry month is invalid');
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  if (endOfMonth < new Date()) throw new Error('This card has expired');
  if (!/^\d{3,4}$/.test(String(cvc || ''))) throw new Error('Security code is invalid');
  if (!name || String(name).trim().length < 2) throw new Error('Please enter the name on the card');

  return {
    brand: detectBrand(digits),
    last4: digits.slice(-4),
    reference: `AUTH-${Date.now().toString(36).toUpperCase()}`,
  };
};

module.exports = { authorizeCard, luhnValid };
