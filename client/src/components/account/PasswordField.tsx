import { useState } from 'react';

const PasswordField = ({ label, value, onChange, autoComplete, showRules = false }: { label: string; value: string; onChange: (v: string) => void; autoComplete: string; showRules?: boolean }) => {
  const [show, setShow] = useState(false);
  const rules = [
    { ok: value.length >= 8, text: '8+ characters' },
    { ok: /[A-Za-z]/.test(value), text: 'A letter' },
    { ok: /\d/.test(value), text: 'A number' },
  ];
  return (
    <label className="block">
      <span className="label">{label}</span>
      <span className="relative block">
        <input className="field pr-16" type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-0 top-1/2 -translate-y-1/2 font-sans text-[10px] uppercase tracking-wide2 text-stone hover:text-ink">
          {show ? 'Hide' : 'Show'}
        </button>
      </span>
      {showRules && (
        <span className="mt-2 flex gap-4 text-[11px]">
          {rules.map((r) => (
            <span key={r.text} className={r.ok ? 'text-ink' : 'text-stone/70'}>
              {r.ok ? '✓' : '·'} {r.text}
            </span>
          ))}
        </span>
      )}
    </label>
  );
};

export const strongPassword = (p: string) => p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);

export default PasswordField;
