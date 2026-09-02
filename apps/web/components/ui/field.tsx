'use client';

import {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from 'react';

import { Check, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/cn';

const CONTROL =
  'w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 ' +
  'text-[15px] text-[var(--ink)] placeholder:text-[var(--text-muted)] ' +
  'transition-all duration-200 ' +
  'hover:border-[var(--line-strong)] ' +
  'focus:border-[var(--green)] focus:outline-none ' +
  'focus:ring-4 focus:ring-[rgba(65,181,140,0.12)] ' +
  'disabled:cursor-not-allowed disabled:bg-[var(--background-soft)] disabled:text-[var(--text-muted)]';

export function Label({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="
        mb-2
        flex
        items-baseline
        gap-2
        text-sm
        font-medium
        text-[var(--navy)]
      "
    >
      <span>
        {children}

        {required && <span className="text-[var(--danger)]"> *</span>}
      </span>

      {hint && (
        <span
          className="
            text-xs
            font-normal
            text-[var(--text-muted)]
          "
        >
          {hint}
        </span>
      )}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="
        mt-1.5
        text-sm
        text-[var(--danger)]
      "
    >
      {message}
    </p>
  );
}

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & {
    invalid?: boolean;
  }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        'h-12',
        invalid &&
          `
            border-[var(--danger)]
            focus:border-[var(--danger)]
            focus:ring-[rgba(196,73,73,0.10)]
          `,
        className,
      )}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & {
    invalid?: boolean;
  }
>(function Select({ className, invalid, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          CONTROL,
          'h-12 appearance-none pl-10',
          invalid &&
            `
              border-[var(--danger)]
              focus:border-[var(--danger)]
              focus:ring-[rgba(196,73,73,0.10)]
            `,
          className,
        )}
        {...props}
      >
        {children}
      </select>

      <ChevronDown
        aria-hidden
        strokeWidth={1.8}
        className="
          pointer-events-none
          absolute
          left-3
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-[var(--text-muted)]
        "
      />
    </div>
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    invalid?: boolean;
  }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        CONTROL,
        'min-h-32 resize-y py-3 leading-8',
        invalid &&
          `
            border-[var(--danger)]
            focus:border-[var(--danger)]
            focus:ring-[rgba(196,73,73,0.10)]
          `,
        className,
      )}
      {...props}
    />
  );
});

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  id: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <label
          htmlFor={id}
          className="
            cursor-pointer
            text-[15px]
            font-medium
            text-[var(--ink)]
          "
        >
          {label}
        </label>

        {description && (
          <p
            className="
              mt-0.5
              text-sm
              leading-6
              text-[var(--text-secondary)]
            "
          >
            {description}
          </p>
        )}
      </div>

      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          `
            relative
            h-7
            w-12
            shrink-0
            rounded-full
            transition-all
            duration-200

            focus-visible:outline-none
            focus-visible:ring-4
            focus-visible:ring-[rgba(65,181,140,0.16)]
          `,
          checked
            ? `
              bg-[var(--green)]
              shadow-[0_3px_10px_rgba(65,181,140,0.20)]
            `
            : `
              bg-[var(--line-strong)]
            `,
        )}
      >
        <span
          className={cn(
            `
              absolute
              top-1
              h-5
              w-5
              rounded-full
              bg-white
              shadow-sm
              transition-all
              duration-200
            `,
            checked ? 'right-1' : 'right-6',
          )}
        />
      </button>
    </div>
  );
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className="
        group
        flex
        cursor-pointer
        items-center
        gap-2.5
        py-1.5
        text-[15px]
        text-[var(--ink)]
      "
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span
        aria-hidden
        className={cn(
          `
            flex
            h-5
            w-5
            shrink-0
            items-center
            justify-center
            rounded-[6px]
            border
            transition-all
            duration-200

            peer-focus-visible:ring-4
            peer-focus-visible:ring-[rgba(65,181,140,0.14)]

            group-hover:border-[var(--green-400)]
          `,
          checked
            ? `
              border-[var(--green)]
              bg-[var(--green)]
              text-white
              shadow-[0_2px_7px_rgba(65,181,140,0.18)]
            `
            : `
              border-[var(--line-strong)]
              bg-white
              text-transparent
            `,
        )}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      </span>

      <span
        className="
          transition-colors
          group-hover:text-[var(--navy)]
        "
      >
        {label}
      </span>
    </label>
  );
}
