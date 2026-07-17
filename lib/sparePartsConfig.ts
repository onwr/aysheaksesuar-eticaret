/**
 * AYŞE COŞKUN — takı & aksesuar kategori ve navigasyon yapılandırması.
 * DB'de eşleşen kategori/menü kaydı yoksa bu değerler yedek (fallback) olarak kullanılır.
 */

export type PopularCategoryItem = {
  name: string
  slug: string
  icon: string
}

export const POPULAR_CATEGORIES: PopularCategoryItem[] = [
  { name: "Kolyeler", slug: "kolye", icon: "necklace" },
  { name: "Bileklikler", slug: "bileklik", icon: "bracelet" },
  { name: "Küpeler", slug: "kupe", icon: "earring" },
  { name: "Yüzükler", slug: "yuzuk", icon: "ring" },
]

export const BRAND_ITEMS = [
  { name: "Kolye", slug: "kolye", searchQuery: "Kolye" },
  { name: "Bileklik", slug: "bileklik", searchQuery: "Bileklik" },
  { name: "Küpe", slug: "kupe", searchQuery: "Küpe" },
  { name: "Yüzük", slug: "yuzuk", searchQuery: "Yüzük" },
] as const

export const DEVICE_BRANDS = BRAND_ITEMS.map((b) => b.name)

/** Ürün renk seçenekleri (varyant sistemi için) */
export const COLOR_OPTIONS = [
  "Altın",
  "Gümüş",
  "Rose Gold",
  "Siyah",
  "Beyaz",
  "Pembe",
  "Kırmızı",
  "Mavi",
  "Yeşil",
  "Bej",
] as const

/** Ürün beden/boyut seçenekleri (varyant sistemi için) */
export const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "Standart",
  "Tek Ebat",
] as const

export type FallbackNavItem = {
  label: string
  href: string
  labelUppercase?: boolean
  children?: Array<{ label: string; href: string }>
}

/** DB menüsü boş/hatalı olduğunda kullanılan yedek navigasyon */
export const FALLBACK_HEADER_NAV: FallbackNavItem[] = [
  { label: "Yeni Gelenler", href: "/search?sort=newest", labelUppercase: false },
  { label: "Kolyeler", href: "/categories/kolye", labelUppercase: false },
  { label: "Bileklikler", href: "/categories/bileklik", labelUppercase: false },
  { label: "Küpeler", href: "/categories/kupe", labelUppercase: false },
  { label: "Yüzükler", href: "/categories/yuzuk", labelUppercase: false },
  { label: "Çok Satanlar", href: "/search?sort=popular", labelUppercase: false },
]

/** @deprecated Use FALLBACK_HEADER_NAV */
export const FALLBACK_SPARE_PARTS_NAV = FALLBACK_HEADER_NAV
