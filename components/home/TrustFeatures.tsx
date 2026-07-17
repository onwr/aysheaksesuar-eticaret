import { FaShieldAlt, FaGem, FaTruck } from "react-icons/fa"

const ITEMS = [
  {
    icon: FaShieldAlt,
    title: "Güvenli Ödeme",
    description: "256-bit SSL ile korunan ödeme altyapısı",
  },
  {
    icon: FaGem,
    title: "Özenli Paketleme",
    description: "Her parça özel hediye ambalajıyla gönderilir",
  },
  {
    icon: FaTruck,
    title: "Hızlı Kargo",
    description: "Stoktaki ürünlerde aynı gün kargo",
  },
] as const

export function TrustFeatures() {
  return (
    <section className="py-5 md:py-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        {ITEMS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex flex-col items-start gap-3 rounded-lg border border-brand-border bg-brand-card p-4 sm:flex-row sm:items-start sm:gap-4 sm:p-5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-blush-soft text-brand-gold">
              <Icon className="h-4.5 w-4.5" aria-hidden />
            </div>
            <div>
              <h3 className="text-sm font-bold text-brand-text">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-brand-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
