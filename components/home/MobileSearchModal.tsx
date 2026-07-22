"use client"

import { useEffect, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { FaTimes } from "react-icons/fa"
import { SearchBar } from "@/components/home/SearchBar"

export function MobileSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10002] bg-black/40 md:hidden"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label="Ürün ara"
            className="fixed inset-x-0 top-0 z-[10003] flex max-h-[min(92vh,100dvh)] flex-col overflow-hidden rounded-b-2xl border-b border-brand-border bg-white shadow-2xl md:hidden"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-brand-border px-4 pb-3 pt-1">
              <p className="font-display text-base font-semibold text-brand-navy">Ara</p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Aramayı kapat"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-brand-border text-brand-muted touch-manipulation"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-3">
              <SearchBar layout="stacked" autoFocus onNavigate={onClose} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
