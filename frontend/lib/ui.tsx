'use client';

import { forwardRef } from 'react';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { Check, Loader2 } from 'lucide-react';
import { cn } from './cn';

export function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center bg-stone-50 p-6 dark:bg-stone-950">{children}</div>;
}

export function PageContainer({ children, className, wide }: { children: React.ReactNode; className?: string; wide?: boolean }) {
  return <div className={cn('mx-auto w-full px-6 py-8', wide ? 'max-w-5xl' : 'max-w-2xl', className)}>{children}</div>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-xl border border-stone-200 bg-white p-6 shadow-card dark:border-stone-800 dark:bg-stone-900', className)}>
      {children}
    </div>
  );
}

export const inputClass =
  'block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm transition-colors placeholder:text-stone-400 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 disabled:bg-stone-100 disabled:text-stone-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:placeholder:text-stone-500 dark:disabled:bg-stone-800 dark:disabled:text-stone-500';

export const fileInputClass = cn(
  inputClass,
  'file:mr-3 file:rounded-md file:border-0 file:bg-accent-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-accent-700 hover:file:bg-accent-100 dark:file:bg-accent-900/40 dark:file:text-accent-300 dark:hover:file:bg-accent-900/60',
);

export const labelClass = 'text-sm font-medium text-stone-700 dark:text-stone-300';

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="mb-4 block">
      <span className={labelClass}>{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="mt-1 block text-xs text-stone-400 dark:text-stone-500">{hint}</span>}
    </label>
  );
}

export function Select({
  value,
  onChange,
  choices,
  required,
  emptyLabel = '—',
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  choices: string[][];
  required?: boolean;
  emptyLabel?: string;
  className?: string;
}) {
  return (
    <select className={cn(inputClass, className)} value={value} onChange={(e) => onChange(e.target.value)} required={required}>
      <option value="">{emptyLabel}</option>
      {choices.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <RadixCheckbox.Root
      checked={checked}
      onCheckedChange={(v) => onChange(v === true)}
      className="flex h-5 w-5 items-center justify-center rounded-md border border-stone-300 bg-white transition-colors data-[state=checked]:border-accent-600 data-[state=checked]:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500/30 dark:border-stone-700 dark:bg-stone-900"
    >
      <RadixCheckbox.Indicator>
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

export function ErrorText({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
      {children}
    </p>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{children}</p>;
}

export function Row({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return <div className={cn('grid grid-cols-1 gap-x-4', cols === 2 && 'sm:grid-cols-2')}>{children}</div>;
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-accent-600 text-white hover:bg-accent-700 focus:ring-accent-500/40',
  secondary:
    'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50 focus:ring-stone-400/30 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:bg-stone-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/40',
  ghost: 'bg-transparent text-stone-600 hover:bg-stone-100 focus:ring-stone-400/30 dark:text-stone-400 dark:hover:bg-stone-800',
};

// Usado tanto pelo <Button> quanto por <Link>/outros elementos que precisam
// da mesma aparência sem poder ser um <button> de verdade (navegação).
export function buttonClass(variant: ButtonVariant = 'primary', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
    buttonVariants[variant],
    className,
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(({ className, variant = 'primary', ...props }, ref) => (
  <button ref={ref} className={buttonClass(variant, className)} {...props} />
));
Button.displayName = 'Button';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}

type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300',
  accent: 'bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: BadgeTone }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', badgeTones[tone])}>
      {children}
    </span>
  );
}
