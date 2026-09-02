'use client';

import { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

import { AnimatePresence, motion } from 'framer-motion';

import { FiltersSidebar } from './filters-sidebar';

export function MobileFilters() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      {/* Filter trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex h-12
          w-full
          items-center
          justify-center
          gap-2
          rounded-[var(--radius-md)]
          border
          border-[var(--line)]
          bg-white
          font-medium
          text-[var(--navy)]
          shadow-[var(--shadow-xs)]
          transition-all
          duration-200

          hover:border-[var(--green-300)]
          hover:bg-[var(--green-50)]
        "
      >
        <SlidersHorizontal
          className="
            h-5 w-5
            text-[var(--green-600)]
          "
          strokeWidth={1.8}
        />
        فیلترها
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="
              fixed inset-0
              z-50
              bg-[rgba(6,31,44,0.58)]
              backdrop-blur-[2px]
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="
                absolute
                inset-y-0
                right-0
                flex
                w-[92%]
                max-w-[420px]
                flex-col
                overflow-hidden
                bg-[var(--background)]
                shadow-[-20px_0_60px_rgba(6,31,44,0.16)]
              "
              initial={{
                x: '100%',
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: '100%',
              }}
              transition={{
                type: 'tween',
                duration: 0.28,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* Mobile header */}
              <div
                className="
                  sticky top-0
                  z-10
                  flex
                  min-h-[70px]
                  items-center
                  justify-between
                  border-b
                  border-[var(--line)]
                  bg-white/95
                  px-5
                  backdrop-blur-xl
                "
              >
                <div className="flex items-center gap-3">
                  <span
                    className="
                      flex h-9 w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-[var(--green-soft)]
                      text-[var(--green-700)]
                    "
                  >
                    <SlidersHorizontal className="h-[18px] w-[18px]" strokeWidth={1.8} />
                  </span>

                  <div>
                    <h2
                      className="
                        text-[17px]
                        font-bold
                        text-[var(--navy)]
                      "
                    >
                      فیلترها
                    </h2>

                    <p
                      className="
                        text-xs
                        text-[var(--text-muted)]
                      "
                    >
                      نتایج را دقیق‌تر کنید
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="بستن فیلترها"
                  className="
                    flex h-10 w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[var(--line)]
                    bg-white
                    text-[var(--text-secondary)]
                    transition-colors

                    hover:bg-[var(--background-soft)]
                    hover:text-[var(--navy)]
                  "
                >
                  <X className="h-5 w-5" strokeWidth={1.8} />
                </button>
              </div>

              {/* Scrollable content */}
              <div
                className="
                  flex-1
                  overflow-y-auto
                  px-4
                  py-4
                "
              >
                <FiltersSidebar />
              </div>

              {/* Sticky action */}
              <div
                className="
                  sticky
                  bottom-0
                  border-t
                  border-[var(--line)]
                  bg-white/95
                  p-4
                  backdrop-blur-xl
                "
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="
                    flex h-[52px]
                    w-full
                    items-center
                    justify-center
                    rounded-[var(--radius-md)]
                    bg-[var(--navy)]
                    font-semibold
                    text-white
                    shadow-[0_10px_25px_rgba(8,47,66,0.18)]
                    transition-all
                    duration-200

                    hover:bg-[var(--navy-alt)]
                    active:translate-y-px
                  "
                >
                  نمایش نتایج
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
