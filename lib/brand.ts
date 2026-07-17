/**
 * AYŞE COŞKUN Jewelry & Accessories — merkezi marka yapılandırması.
 * Yalnızca public değerler; gizli anahtarları buraya ekleme.
 * Hem server hem client tarafında güvenle kullanılabilir.
 */

export const BRAND_NAME = "AYŞE COŞKUN"
export const BRAND_SHORT = "AC"
export const BRAND_TAGLINE = "JEWELRY & ACCESSORIES"
export const BRAND_DESCRIPTION =
  "Zarafeti ve zamansız şıklığı bir araya getiren takı ve aksesuar koleksiyonları."
export const BRAND_DESCRIPTION_LONG =
  "AYŞE COŞKUN Jewelry & Accessories; kolye, bileklik, küpe ve yüzük koleksiyonlarıyla zarafeti stilinize taşır. Premium malzemeler, modern tasarım."

/**
 * Site URL — NEXT_PUBLIC_SITE_URL env üzerinden; geliştirme için localhost fallback.
 * Alan adı henüz netleşmediğinden kod içine hard-code edilmez.
 */
export const BRAND_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000"

/** Destek e-postası — env ile override edilebilir. Gerçek adres netleşene kadar geçici. */
export const BRAND_SUPPORT_EMAIL =
  process.env.BRAND_SUPPORT_EMAIL ?? "destek@aysecoskun.com"

export const BRAND_PHONE = process.env.BRAND_PHONE ?? "+90 531 218 14 64"
export const BRAND_WHATSAPP = process.env.BRAND_WHATSAPP ?? "905312181464"

export const BRAND_ADDRESS =
  process.env.BRAND_ADDRESS ??
  "Pazar Mah. Recep Tayyip Erdoğan Cad. 350. Sokak No: A11, Gölhisar / Burdur"

// Sosyal medya
export const BRAND_INSTAGRAM = "https://www.instagram.com/aysheaccesoriess/"
export const BRAND_TIKTOK = "https://tiktok.com/@aysecoskun"

// Logo dosyaları — /public/brand/ altında yönetilir
export const BRAND_LOGO_PATH = "/brand/logo.png"
export const BRAND_LOGO_HORIZONTAL_PATH = "/brand/logo-horizontal.png"
export const BRAND_LOGO_MARK_PATH = "/brand/logo-mark.png"
export const BRAND_FAVICON_PATH = "/brand/favicon.ico"
export const BRAND_OG_IMAGE_PATH = "/brand/og-image.jpg"

/**
 * Geçici uyumluluk: mevcut /public/logo.png henüz varken bu yolu kullan.
 * /public/brand/logo.png hazır olunca BRAND_LOGO_PATH'e geç.
 */
export const BRAND_LOGO_ACTIVE_PATH = "/logo.png"

// SEO
export const BRAND_SEO_TITLE = `${BRAND_NAME} | Jewelry & Accessories`
export const BRAND_SEO_TITLE_TEMPLATE = `%s | ${BRAND_NAME}`
export const BRAND_SEO_DESCRIPTION =
  "AYŞE COŞKUN Jewelry & Accessories — kolye, bileklik, küpe ve yüzük koleksiyonlarını keşfedin."
export const BRAND_SEO_KEYWORDS =
  "takı, kolye, bileklik, küpe, yüzük, bijuteri, kadın aksesuar, AYŞE COŞKUN, jewelry, accessories"

// Para birimi ve konum
export const BRAND_CURRENCY = "TRY"
export const BRAND_CURRENCY_SYMBOL = "₺"
export const BRAND_COUNTRY = "TR"
export const BRAND_LOCALE = "tr_TR"

/**
 * Renk değerleri — Tailwind'e erişilemeyen yerler için (e-posta şablonları vb.)
 * CSS değişkenleri globals.css'te tanımlıdır.
 */
export const COLOR_PRIMARY = "#B99754"       // şampanya altını
export const COLOR_PRIMARY_DARK = "#27231F"  // koyu metin
export const COLOR_BLUSH = "#EDE0C8"         // açık şampanya
export const COLOR_BLUSH_SOFT = "#F6F1E6"    // açık ivory
export const COLOR_GOLD = "#B99754"
export const COLOR_GOLD_SOFT = "#D9BF89"
export const COLOR_GOLD_HOVER = "#9E7B3E"
export const COLOR_PAGE_BG = "#FBF8F2"
export const COLOR_TEXT = "#27231F"
export const COLOR_TEXT_MUTED = "#756E65"
export const COLOR_SUCCESS = "#16A36A"
export const COLOR_DANGER = "#F04438"
