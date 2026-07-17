"use client"

import Image from "next/image"
import Link from "next/link"
import { FaArrowRight, FaChevronRight } from "react-icons/fa"
import { motion } from "framer-motion"
import type { HomeCategoryItem } from "@/lib/homepageCategories"

const FALLBACK_IMAGES: Record<string, string> = {
  kolye: "/urunler/urun1.jpg",
  bileklik: "/urunler/urun3.jpg",
  kupe: "/urunler/urun4.jpg",
  yuzuk: "/urunler/urun5.jpg",
}

function pickFeatured(categories: HomeCategoryItem[]): HomeCategoryItem[] {
  const priority = ["kolye", "bileklik", "kupe", "yuzuk"]
  const picked: HomeCategoryItem[] = []
  for (const slug of priority) {
    const found = categories.find((c) => c.slug === slug)
    if (found) picked.push(found)
  }
  if (picked.length >= 4) return picked.slice(0, 4)
  for (const c of categories) {
    if (!picked.some((p) => p.id === c.id)) picked.push(c)
    if (picked.length >= 4) break
  }
  return picked.slice(0, 4)
}

export function PopularCategories({ categories }: { categories: HomeCategoryItem[] }) {
  if (categories.length === 0) return null

  const featured = pickFeatured(categories)

  return (
    <section className="py-5 md:py-7">
      <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
        <div>
          <h2 className="font-display text-xl font-semibold text-brand-navy md:text-2xl">
            Kategorileri Keşfet
          </h2>
          <p className="mt-1 text-sm text-brand-muted">
            Kolye, bileklik, küpe ve yüzük koleksiyonları
          </p>
        </div>
        <Link
          href="/categories"
          className="hidden items-center gap-1 text-sm font-medium text-brand-gold transition-colors hover:text-brand-gold-hover sm:flex"
        >
          Tümünü Gör <FaChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {featured.map((cat, idx) => {
          const href = cat.parentSlug
            ? `/categories/${cat.parentSlug}/${cat.slug}`
            : `/categories/${cat.slug}`
          const image = cat.imageUrl ?? FALLBACK_IMAGES[cat.slug] ?? "/logo.png"
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.06 }}
            >
              <Link
                href={href}
                className="group block overflow-hidden rounded-lg border border-brand-border bg-white transition-colors duration-300 hover:border-brand-gold"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-page">
                  <Image
                    src={image}
                    alt={`${cat.name} koleksiyonu`}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 px-4 py-3.5">
                  <h3 className="font-display text-[15px] font-semibold text-brand-navy md:text-base">
                    {cat.name}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-brand-gold transition-transform duration-300 group-hover:translate-x-0.5">
                    Keşfet <FaArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
