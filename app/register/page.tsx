import type { Metadata } from "next"
import RegisterForm from "@/components/auth/RegisterForm"
import { HomeFooter } from "@/components/home/HomeFooter"
import { HomeHeader } from "@/components/home/HomeHeader"
import { sanitizePostAuthPath } from "@/lib/safeCallbackUrl"
import Image from "next/image"

import { privatePageMetadata } from "@/lib/seo"
import { BRAND_NAME } from "@/lib/brand"

export const metadata: Metadata = privatePageMetadata({
  title: "Üye ol",
  description: `${BRAND_NAME}'e ücretsiz üye olun.`,
  path: "/register",
})

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const sp = await searchParams
  const postAuthRedirect = sanitizePostAuthPath(sp.callbackUrl)

  return (
    <div className="flex flex-col min-h-screen">
      <HomeHeader />

      <main className="grid flex-1 md:grid-cols-2">

        {/* LEFT */}
        <div
          className="relative hidden flex-col justify-center overflow-hidden rounded-br-2xl p-12 text-white md:flex"
          style={{ background: "var(--brand-gradient)" }}
        >
          <div className="absolute inset-0 z-0">
            <Image
              src="/banner.png"
              alt="AYŞE COŞKUN takı ve aksesuar koleksiyonu"
              fill
              className="object-cover"
              style={{ objectPosition: "82% 70%" }}
            />
          </div>
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-brand-navy-dark/90 via-brand-navy-dark/55 to-brand-navy-dark/10" />

          <div className="relative z-10">
            <h2 className="text-4xl font-black uppercase leading-tight tracking-tight">
              Hesabını oluştur <br /> <span className="text-brand-gold-soft">alışverişe başla</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm font-medium text-white/80">
              {BRAND_NAME} ailesine katılın, size özel kampanya ve fırsatları kaçırmayın.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center bg-brand-page px-6 py-12">
          <RegisterForm postAuthRedirect={postAuthRedirect} />
        </div>

      </main>

      <HomeFooter />
    </div>
  )
}