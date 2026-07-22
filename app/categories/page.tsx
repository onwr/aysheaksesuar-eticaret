import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { FaChevronRight } from "react-icons/fa"
import { HomeFooter } from "@/components/home/HomeFooter"
import { HomeHeader } from "@/components/home/HomeHeader"
import { prisma } from "@/lib/prisma"
import { getFooterCategories } from "@/lib/homepageCategories"
import { BRAND_NAME } from "@/lib/brand"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: `Tüm Kategoriler | ${BRAND_NAME}`,
  description: "Takı ve aksesuar kategorilerimizi keşfedin.",
}

export default async function AllCategoriesPage() {
  const [roots, footerCategories] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        children: {
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        },
      },
    }),
    getFooterCategories(prisma),
  ])

  return (
    <>
      <HomeHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 md:py-10">
        <nav className="mb-6 flex items-center gap-2 text-[13px] text-brand-muted">
          <Link href="/" className="hover:text-brand-gold">
            Anasayfa
          </Link>
          <span>&gt;</span>
          <span className="font-semibold text-brand-navy">Kategoriler</span>
        </nav>

        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-brand-navy md:text-3xl">
            Tüm Kategoriler
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Koleksiyonlarımıza göz atın ve size en uygun ürünleri bulun.
          </p>
        </div>

        {roots.length === 0 ? (
          <p className="rounded-xl border border-brand-border bg-white p-8 text-center text-sm text-brand-muted">
            Henüz kategori eklenmemiş.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roots.map((root) => (
              <article
                key={root.id}
                className="overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm"
              >
                <Link
                  href={`/categories/${root.slug}`}
                  className="group flex items-center gap-4 border-b border-brand-border p-4 transition hover:bg-brand-page"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-brand-page">
                    {root.imageUrl ? (
                      <Image
                        src={root.imageUrl}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-brand-gold">
                        {root.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg font-semibold text-brand-navy group-hover:text-brand-gold">
                      {root.name}
                    </h2>
                    {root.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-brand-muted">{root.description}</p>
                    ) : null}
                  </div>
                  <FaChevronRight className="h-3 w-3 shrink-0 text-brand-gold" />
                </Link>

                {root.children.length > 0 ? (
                  <ul className="divide-y divide-brand-border/80 p-2">
                    {root.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/categories/${root.slug}/${child.slug}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-brand-text transition hover:bg-brand-page hover:text-brand-gold"
                        >
                          <span>{child.name}</span>
                          <FaChevronRight className="h-2.5 w-2.5 text-brand-muted" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </main>

      <HomeFooter categoryLinks={footerCategories} />
    </>
  )
}
