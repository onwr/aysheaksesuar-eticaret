import type { Metadata } from "next"
import { Suspense } from "react"
import { LoginForm } from "@/components/auth/LoginForm"
import { HomeFooter } from "@/components/home/HomeFooter"
import { HomeHeader } from "@/components/home/HomeHeader"
import Image from "next/image"

import { privatePageMetadata } from "@/lib/seo"
import { BRAND_NAME } from "@/lib/brand"

export const metadata: Metadata = privatePageMetadata({
  title: "Üye girişi",
  description: `${BRAND_NAME} hesabınıza giriş yapın.`,
  path: "/login",
})

export default function LoginPage() {
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
              alt="AYŞE COŞKUN takı koleksiyonu"
              fill
              className="object-cover"
              style={{ objectPosition: "78% 35%" }}
            />
          </div>
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-brand-navy-dark/90 via-brand-navy-dark/55 to-brand-navy-dark/10" />

          <div className="relative z-10">
            <h2 className="text-4xl font-black uppercase leading-tight tracking-tight">
              Tekrar Hoş Geldin <br /> <span className="text-brand-gold-soft">seni özledik</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm font-medium text-white/80">
              Hesabına giriş yaparak siparişlerini takip edebilir ve avantajlardan yararlanabilirsin.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center bg-brand-page px-6 py-12">
          <Suspense fallback={
            <div className="flex justify-center py-12">
               <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-border border-t-brand-teal" />
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <HomeFooter />
    </div>
  )
}
