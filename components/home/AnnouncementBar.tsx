"use client"

import { useEffect, useState } from "react"
import { FaTruck, FaShieldAlt, FaUndo, FaStar } from "react-icons/fa"
import { ANNOUNCEMENTS_UPDATED_EVENT } from "@/lib/headerAnnouncements"

const ICONS = [FaTruck, FaShieldAlt, FaUndo, FaStar] as const

async function fetchAnnouncementItems(): Promise<string[]> {
  const res = await fetch("/api/navigation/announcements", {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  })
  if (!res.ok) throw new Error("fetch failed")
  const data = (await res.json()) as { items?: unknown }
  const raw = Array.isArray(data.items) ? data.items : []
  return raw.map((v) => String(v ?? "").trim()).filter(Boolean)
}

export function AnnouncementBar() {
  const [items, setItems] = useState<string[] | null>(null)
  const [mobileIndex, setMobileIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const next = await fetchAnnouncementItems()
        if (cancelled) return
        setItems(next)
        setMobileIndex(0)
      } catch {
        if (!cancelled) setItems([])
      }
    }
    void load()
    const onUpdate = () => void load()
    window.addEventListener(ANNOUNCEMENTS_UPDATED_EVENT, onUpdate)
    return () => {
      cancelled = true
      window.removeEventListener(ANNOUNCEMENTS_UPDATED_EVENT, onUpdate)
    }
  }, [])

  useEffect(() => {
    if (!items || items.length <= 1) return
    const timer = window.setInterval(() => {
      setMobileIndex((i) => (i + 1) % items.length)
    }, 4500)
    return () => window.clearInterval(timer)
  }, [items])

  if (items === null || items.length === 0) return null

  const mobileText = items[mobileIndex] ?? items[0]
  const MobileIcon = ICONS[mobileIndex % ICONS.length]

  return (
    <div className="bg-brand-navy text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-center px-4 py-2">
        <p className="flex items-center gap-2 text-[11px] font-medium tracking-wide md:hidden">
          <MobileIcon className="h-3 w-3 shrink-0 text-brand-gold-soft" aria-hidden />
          {mobileText}
        </p>

        <ul className="hidden w-full items-center justify-center gap-6 md:flex lg:gap-10">
          {items.map((text, idx) => {
            const Icon = ICONS[idx % ICONS.length]
            return (
              <li
                key={`${idx}-${text}`}
                className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-white/95"
              >
                <Icon className="h-3 w-3 shrink-0 text-brand-gold-soft" aria-hidden />
                {text}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
