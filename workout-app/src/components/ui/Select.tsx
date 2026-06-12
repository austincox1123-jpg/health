import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, options, placeholder, className = '', ...rest }: SelectProps) {
  const select = (
    <select
      className={`w-full bg-surface-alt border border-border rounded-sm px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent appearance-none ${className}`}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
  if (!label) return select;
  return (
    <label className="block">
      <span className="section-label block mb-1.5">{label}</span>
      {select}
    </label>
  );
}
