import Link from "next/link"
import { FaInstagram } from "react-icons/fa"
import { BRAND_INSTAGRAM } from "@/lib/brand"

export function HomeInstagramSection() {
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
          Yeni koleksiyonlar, stil önerileri ve kampanyalar için bizi takip edin.
        </p>
      </div>

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
