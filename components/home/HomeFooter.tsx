"use client"

import Image from "next/image"
import Link from "next/link"
import { openCookiePreferences } from "@/components/consent/CookieConsent"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { WhatsAppButton } from "@/components/WhatsAppButton"
import { FaChevronUp } from "react-icons/fa"
import { LOGO_ALT } from "@/lib/brandColors"
import { BRAND_NAME, BRAND_DESCRIPTION, BRAND_PHONE, BRAND_ADDRESS } from "@/lib/brand"
import type { HomeCategoryItem } from "@/lib/homepageCategories"

const corporateLinks = [
  { label: "Hakkımızda", href: "/sayfa/hakkimizda" },
  { label: "Gizlilik Politikası", href: "/sayfa/gizlilik-ve-guvenlik" },
  { label: "Mesafeli Satış Sözleşmesi", href: "/sayfa/mesafeli-satis-sozlesmesi" },
  { label: "İade ve Değişim", href: "/sayfa/iade-proseduru" },
  { label: "KVKK", href: "/sayfa/gizlilik-ve-guvenlik" },
  { label: "Çerez Politikası", href: "/sayfa/gizlilik-ve-guvenlik" },
  { label: "Çerez Tercihleri", href: "#", action: "cookie-preferences" as const },
]

const supportLinks = [
  { label: "Sipariş Takibi", href: "/siparislerim" },
  { label: "Kargo ve Teslimat", href: "/sikca-sorulan-sorular" },
  { label: "İade ve Değişim", href: "/sayfa/iade-proseduru" },
  { label: "Sıkça Sorulan Sorular", href: "/sikca-sorulan-sorular" },
  { label: "İletişim", href: "/sikca-sorulan-sorular" },
]

function FooterColumn({
  title,
  children,
  collapsible = false,
}: {
  title: string
  children: ReactNode
  collapsible?: boolean
}) {
  const [open, setOpen] = useState(!collapsible)

  if (!collapsible) {
    return (
      <div className="min-w-0">
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/90">{title}</h3>
        <ul className="space-y-2.5 text-sm text-white/65">{children}</ul>
      </div>
    )
  }

  return (
    <div className="min-w-0 border-b border-white/10 pb-4 lg:border-0 lg:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-2 text-left lg:pointer-events-none"
        aria-expanded={open}
      >
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">{title}</h3>
        <FaChevronUp
          className={`h-3 w-3 text-white/50 transition-transform lg:hidden ${open ? "" : "rotate-180"}`}
        />
      </button>
      {open && <ul className="mt-2 space-y-2.5 text-sm text-white/65 lg:mt-4">{children}</ul>}
    </div>
  )
}

const EMPTY_CATEGORY_LINKS: HomeCategoryItem[] = []

let footerCategoriesCache: HomeCategoryItem[] | null = null

export function HomeFooter({ categoryLinks = EMPTY_CATEGORY_LINKS }: { categoryLinks?: HomeCategoryItem[] }) {
  const [fetchedCategories, setFetchedCategories] = useState<HomeCategoryItem[]>(
    footerCategoriesCache ?? []
  )

  // categoryLinks prop geldiyse doğrudan kullan; aksi hâlde API'den çek
  const displayCategories = categoryLinks.length > 0 ? categoryLinks : fetchedCategories

  useEffect(() => {
    if (categoryLinks.length > 0 || footerCategoriesCache) return

    let cancelled = false
    fetch("/api/categories")
      .then((r) => r.json())
      .then((d: { items?: Array<{ id: number; name: string; slug: string; imageUrl: string | null; parentId: number | null }> }) => {
        if (cancelled || !Array.isArray(d?.items)) return
        const roots = d.items
          .filter((c) => c.parentId === null)
          .slice(0, 6)
          .map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            imageUrl: c.imageUrl,
            parentSlug: null,
          }))
        footerCategoriesCache = roots
        setFetchedCategories(roots)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [categoryLinks])

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" })

  return (
    <footer className="mt-auto w-full bg-brand-navy-dark text-white">
      <div className="mx-auto max-w-[1440px] px-4 pt-12 pb-8 md:px-8 md:pt-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt={LOGO_ALT}
                width={220}
                height={72}
                className="h-auto w-[160px] object-contain brightness-0 invert md:w-[180px]"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              {BRAND_DESCRIPTION}
            </p>
          </div>

          <FooterColumn title="Kurumsal" collapsible>
            {corporateLinks.map((item) => (
              <li key={item.href + item.label}>
                {"action" in item && item.action === "cookie-preferences" ? (
                  <button
                    type="button"
                    onClick={() => openCookiePreferences()}
                    className="transition hover:text-white focus:outline-none focus:text-brand-gold"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link href={item.href} className="transition hover:text-white focus:outline-none focus:text-brand-gold">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Yardım" collapsible>
            {supportLinks.map((item) => (
              <li key={item.href + item.label}>
                <Link href={item.href} className="transition hover:text-white focus:outline-none focus:text-brand-gold">
                  {item.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title="Alışveriş" collapsible>
            {displayCategories.map((item) => (
              <li key={item.id}>
                <Link
                  href={
                    item.parentSlug
                      ? `/categories/${item.parentSlug}/${item.slug}`
                      : `/categories/${item.slug}`
                  }
                  className="transition hover:text-white focus:outline-none focus:text-brand-gold"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <div className="min-w-0">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-white/90">İletişim</h3>
            <address className="not-italic text-sm leading-relaxed text-white/65">
              <p>Sorularınız için bize ulaşabilirsiniz.</p>
              <p className="mt-4 space-y-3">
                <span className="block">
                  <span className="font-medium text-white/50">Telefon:</span>{" "}
                  <a
                    href={`tel:${BRAND_PHONE.replace(/\s/g, "")}`}
                    className="text-white/80 underline-offset-2 hover:text-white hover:underline"
                  >
                    {BRAND_PHONE}
                  </a>
                </span>
                <span className="block">
                  <span className="font-medium text-white/50">Adres:</span>{" "}
                  <span className="text-white/80">{BRAND_ADDRESS}</span>
                </span>
              </p>
            </address>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
            <p className="order-2 text-center text-xs text-white/50 md:order-1 md:text-left">
              © {new Date().getFullYear()} {BRAND_NAME}. Tüm hakları saklıdır.
            </p>

            <div className="order-1 flex items-center justify-center gap-2.5 md:order-2 md:gap-3">
              <Image
                src="/odemekanal1.png"
                alt="Kabul edilen ödeme yöntemleri"
                width={420}
                height={48}
                className="h-6 w-auto max-w-[165px] object-contain brightness-0 invert opacity-80 sm:h-7 sm:max-w-[195px]"
              />
              <Image
                src="/odemekanal2.png"
                alt="Visa ve Mastercard"
                width={280}
                height={48}
                className="h-6 w-auto max-w-[80px] object-contain opacity-95 sm:h-7 sm:max-w-[92px]"
              />
            </div>

            <div className="order-3 flex items-center justify-center gap-3 md:justify-end">
              <Image
                src="/klogo.png"
                alt="Kürkaya Medya"
                width={160}
                height={48}
                className="h-10 w-auto shrink-0 object-contain sm:h-11"
              />
              <button
                type="button"
                onClick={scrollTop}
                aria-label="Yukarı çık"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 text-white/70 transition hover:border-brand-gold hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              >
                <FaChevronUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <WhatsAppButton />
    </footer>
  )
}

/** @deprecated alias */
export const MainFooter = HomeFooter
