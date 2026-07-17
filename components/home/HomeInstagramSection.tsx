import Image from "next/image"
import Link from "next/link"
import { FaInstagram } from "react-icons/fa"
import { BRAND_INSTAGRAM } from "@/lib/brand"

export type InstagramPost = {
  id: number
  imageUrl: string
  href: string
  alt: string
}

export function HomeInstagramSection({ posts = [] }: { posts?: InstagramPost[] }) {
  return (
    <section className="py-6 md:py-8">
      <div className="mb-6 text-center md:mb-8">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-navy text-white">
          <FaInstagram className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-brand-navy md:text-2xl">
          Bizi Instagram&apos;da Takip Edin
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">
          Yeni koleksiyonları ve stil önerilerini keşfedin.
        </p>
      </div>

      {posts.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-6">
          {posts.slice(0, 6).map((post) => (
            <a
              key={post.id}
              href={BRAND_INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square overflow-hidden rounded-lg border border-brand-border bg-brand-page"
            >
              <Image
                src={post.imageUrl}
                alt={post.alt}
                fill
                sizes="(max-width: 768px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/0 opacity-0 transition-all duration-300 group-hover:bg-brand-navy/30 group-hover:opacity-100">
                <FaInstagram className="h-5 w-5 text-white" aria-hidden />
              </div>
            </a>
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href={BRAND_INSTAGRAM}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-gold"
        >
          Instagram&apos;da Takip Et
        </Link>
      </div>
    </section>
  )
}
