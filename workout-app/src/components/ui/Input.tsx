import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  mono?: boolean;
}

export function Input({ label, mono = false, className = '', id, ...rest }: InputProps) {
  const inputId = id ?? (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const input = (
    <input
      id={inputId}
      className={`w-full bg-surface-alt border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent ${mono ? 'font-mono' : ''} ${className}`}
      {...rest}
    />
  );
  if (!label) return input;
  return (
    <label htmlFor={inputId} className="block">
      <span className="section-label block mb-1.5">{label}</span>
      {input}
    </label>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className = '', ...rest }: TextareaProps) {
  const area = (
    <textarea
      className={`w-full bg-surface-alt border border-border rounded-sm px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent ${className}`}
      rows={3}
      {...rest}
    />
  );
  if (!label) return area;
  return (
    <label className="block">
      <span className="section-label block mb-1.5">{label}</span>
      {area}
    </label>
  );
}
