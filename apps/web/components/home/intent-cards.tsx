'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  House,
  KeyRound,
  Search,
  ShoppingCart,
  Tag,
  type LucideIcon,
} from 'lucide-react';

type IntentIconProps = {
  BaseIcon: LucideIcon;
  ActionIcon: LucideIcon;
};

function IntentIcon({ BaseIcon, ActionIcon }: IntentIconProps) {
  return (
    <span
      className="
        relative flex h-16 w-16 items-center justify-center
        rounded-full
        bg-[var(--green-soft)]
        text-[var(--navy)]
        transition-all duration-300
        group-hover:bg-[var(--green-100)]
        lg:h-20 lg:w-20
      "
    >
      {/* Main property icon */}
      <BaseIcon
        aria-hidden
        strokeWidth={1.65}
        className="
          h-8 w-8
          transition-transform duration-300
          group-hover:scale-105
          lg:h-10 lg:w-10
        "
      />

      {/* Small branded action icon */}
      <span
        className="
          absolute -bottom-0.5 -left-0.5
          flex h-6 w-6 items-center justify-center
          rounded-full
          border-2 border-white
          bg-white
          text-[var(--green-600)]
          shadow-sm
          transition-all duration-300
          group-hover:bg-[var(--green)]
          group-hover:text-white
          lg:h-7 lg:w-7
        "
      >
        <ActionIcon aria-hidden strokeWidth={2} className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
      </span>
    </span>
  );
}

/**
 * The four primary user intents.
 *
 * The visitor chooses what they want to do before being asked
 * for city, neighborhood or other property filters.
 */
const INTENTS = [
  {
    href: '/submit-property?transaction=rent',
    title: 'ملکم را اجاره می‌دهم',
    BaseIcon: House,
    ActionIcon: KeyRound,
  },
  {
    href: '/properties?transaction=rent',
    title: 'می‌خواهم اجاره کنم',
    BaseIcon: Building2,
    ActionIcon: Search,
  },
  {
    href: '/submit-property?transaction=sale',
    title: 'ملکم را می‌فروشم',
    BaseIcon: House,
    ActionIcon: Tag,
  },
  {
    href: '/properties?transaction=sale',
    title: 'می‌خواهم بخرم',
    BaseIcon: House,
    ActionIcon: ShoppingCart,
  },
] satisfies Array<{
  href: string;
  title: string;
  BaseIcon: LucideIcon;
  ActionIcon: LucideIcon;
}>;

export function IntentCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
      {INTENTS.map((intent, index) => (
        <motion.div
          key={intent.href}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.42,
            delay: index * 0.07,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          className="relative z-20"
        >
          <Link
            href={intent.href}
            className="
              surface group
              flex h-full min-h-[190px]
              flex-col items-center justify-center
              gap-4
              px-4 py-7
              text-center
              transition-all duration-300
              hover:-translate-y-1
              hover:border-[var(--green-200)]
              hover:shadow-card-hover
              lg:min-h-[230px]
              lg:px-6 lg:py-9
            "
          >
            <IntentIcon BaseIcon={intent.BaseIcon} ActionIcon={intent.ActionIcon} />

            <span
              className="
                mt-1 text-[15px] font-bold
                text-[var(--navy)]
                lg:text-[17px]
              "
            >
              {intent.title}
            </span>

            {/* Brand accent line */}
            <span
              aria-hidden
              className="
                mt-1 h-[3px] w-9
                rounded-full
                bg-[var(--green)]
                transition-all duration-300
                group-hover:w-14
              "
            />
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
