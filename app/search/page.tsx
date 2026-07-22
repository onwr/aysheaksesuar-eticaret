import type { Metadata } from "next"
import type { Prisma } from "@/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { HomeHeader } from "@/components/home/HomeHeader"
import { HomeFooter } from "@/components/home/HomeFooter"
import { CategoryListingClient } from "@/components/category/CategoryListingClient"
import Link from "next/link"
import { serializePrisma } from "@/lib/serialize"
import { privatePageMetadata } from "@/lib/seo"
import { BRAND_NAME } from "@/lib/brand"

type Props = {
  searchParams: Promise<{
    q?: string
    sort?: string
    indirim?: string
  }>
}

const LIST_LIMIT = 120

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
  variants: { where: { isActive: true }, take: 1 },
}

function listingTitle(params: { q?: string; sort?: string; indirim?: string }): string {
  if (params.q?.trim()) return `"${params.q.trim()}" arama sonuçları`
  if (params.indirim === "true") return "İndirimdeki Ürünler"
  if (params.sort === "popular") return "Çok Satanlar"
  if (params.sort === "newest") return "Yeni Gelenler"
  return "Ürünler"
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  return privatePageMetadata({
    title: listingTitle(params),
    description: `${BRAND_NAME} ürün listesi ve arama.`,
    path: "/search",
  })
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams
  const q = params.q?.trim()
  const sort = params.sort
  const onSale = params.indirim === "true"

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = []
  let pageTitle = listingTitle(params)

  if (q) {
    products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q } },
          { description: { contains: q } },
          { slug: { contains: q } },
          { sku: { contains: q } },
        ],
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: LIST_LIMIT,
    })
  } else if (onSale) {
    const candidates = await prisma.product.findMany({
      where: {
        isActive: true,
        compareAtPrice: { not: null },
      },
      include: productInclude,
      orderBy: { updatedAt: "desc" },
      take: LIST_LIMIT * 2,
    })
    products = candidates
      .filter((p) => p.compareAtPrice != null && Number(p.compareAtPrice) < Number(p.basePrice))
      .slice(0, LIST_LIMIT)
  } else if (sort === "newest" || sort === "popular") {
    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      sort === "popular"
        ? [{ isFeatured: "desc" }, { updatedAt: "desc" }]
        : [{ createdAt: "desc" }]

    products = await prisma.product.findMany({
      where: { isActive: true },
      include: productInclude,
      orderBy,
      take: LIST_LIMIT,
    })
  }

  const hasListing = Boolean(q || onSale || sort === "newest" || sort === "popular")
  const emptyMessage = q
    ? "Aradığınız kriterlere uygun ürün bulunamadı."
    : hasListing
      ? "Bu listede henüz ürün bulunmuyor."
      : "Aramak için bir kelime yazın veya menüden bir koleksiyon seçin."

  return (
    <>
      <HomeHeader />

      <main className="mx-auto w-full max-w-screen-2xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <h1 className="font-display text-2xl font-semibold text-brand-navy md:text-4xl">{pageTitle}</h1>
          <p className="text-sm font-medium text-brand-muted">
            {products.length > 0 ? `${products.length} ürün listeleniyor.` : emptyMessage}
          </p>
          <div className="h-1 w-16 rounded-full bg-brand-gold" />
        </div>

        {products.length > 0 ? (
          <CategoryListingClient
            products={
              serializePrisma(products) as unknown as Parameters<
                typeof CategoryListingClient
              >[0]["products"]
            }
            view="grid4"
          />
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-border bg-brand-page/50 py-16">
            <span className="mb-4 text-5xl opacity-30" aria-hidden>
              🔍
            </span>
            <p className="text-sm font-bold uppercase tracking-widest text-brand-muted">Ürün bulunamadı</p>
            <Link href="/" className="mt-6 text-sm font-semibold text-brand-gold hover:text-brand-gold-hover">
              Anasayfaya dön
            </Link>
          </div>
        )}
      </main>

      <HomeFooter />
    </>
  )
}
