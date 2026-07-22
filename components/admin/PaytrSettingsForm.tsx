"use client"

import { useEffect, useState } from "react"

type FormState = {
  merchantId: string
  merchantKey: string
  merchantSalt: string
  testMode: boolean
  cardPaymentEnabled: boolean
}

type LoadState = FormState & {
  hasMerchantKey: boolean
  hasMerchantSalt: boolean
  usingEnvFallback: boolean
}

export function PaytrSettingsForm({ layout = "page" }: { layout?: "page" | "embedded" }) {
  const [meta, setMeta] = useState<Pick<LoadState, "hasMerchantKey" | "hasMerchantSalt" | "usingEnvFallback">>({
    hasMerchantKey: false,
    hasMerchantSalt: false,
    usingEnvFallback: false,
  })
  const [form, setForm] = useState<FormState>({
    merchantId: "",
    merchantKey: "",
    merchantSalt: "",
    testMode: true,
    cardPaymentEnabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [callbackUrl, setCallbackUrl] = useState("/api/payment/callback")

  useEffect(() => {
    setCallbackUrl(`${window.location.origin}/api/payment/callback`)
  }, [])

  useEffect(() => {
    fetch("/api/admin/paytr")
      .then((r) => r.json())
      .then((d) => {
        if (d.merchantId !== undefined) {
          setForm((f) => ({
            ...f,
            merchantId: d.merchantId ?? "",
            testMode: Boolean(d.testMode),
            cardPaymentEnabled: d.cardPaymentEnabled !== false,
            merchantKey: "",
            merchantSalt: "",
          }))
          setMeta({
            hasMerchantKey: Boolean(d.hasMerchantKey),
            hasMerchantSalt: Boolean(d.hasMerchantSalt),
            usingEnvFallback: Boolean(d.usingEnvFallback),
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const body: Record<string, unknown> = {
        merchantId: form.merchantId.trim(),
        testMode: form.testMode,
        cardPaymentEnabled: form.cardPaymentEnabled,
      }
      if (form.merchantKey.trim()) body.merchantKey = form.merchantKey.trim()
      if (form.merchantSalt.trim()) body.merchantSalt = form.merchantSalt.trim()

      const res = await fetch("/api/admin/paytr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? "Kaydedilemedi.")

      setMeta({
        hasMerchantKey: Boolean(data.hasMerchantKey),
        hasMerchantSalt: Boolean(data.hasMerchantSalt),
        usingEnvFallback: Boolean(data.usingEnvFallback),
      })
      setForm((f) => ({ ...f, merchantKey: "", merchantSalt: "" }))
      setMessage({ ok: true, text: "PayTR ayarları kaydedildi." })
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : "Kaydedilemedi." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Yükleniyor...</p>
  }

  return (
    <div className={layout === "page" ? "space-y-6" : ""}>
      {layout === "page" && (
        <div>
          <h1 className="text-[17px] font-medium text-zinc-800">PayTR (Kredi Kartı)</h1>
          <p className="mt-1 text-[12px] text-zinc-500">
            Mağaza panelinizdeki Mağaza No, Mağaza Parola ve Mağaza Gizli Anahtar bilgileri.
          </p>
        </div>
      )}

      {meta.usingEnvFallback && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-900">
          Şu an sunucu ortam değişkenlerindeki (<code className="text-[11px]">PAYTR_*</code>) değerler
          kullanılıyor. Buradan kaydettiğinizde ayarlar veritabanından okunur.
        </div>
      )}

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-[12px] ${message.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-zinc-100 bg-white p-5">
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-3">
          <input
            type="checkbox"
            checked={form.cardPaymentEnabled}
            onChange={(e) => setForm((f) => ({ ...f, cardPaymentEnabled: e.target.checked }))}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span>
            <span className="block text-[13px] font-medium text-zinc-800">Kredi kartı ile ödeme</span>
            <span className="text-[11px] text-zinc-500">
              Kapalıyken checkout’ta yalnızca Havale / EFT görünür.
            </span>
          </span>
        </label>

        <Field
          label="Mağaza No (merchant_id)"
          value={form.merchantId}
          onChange={(v) => setForm((f) => ({ ...f, merchantId: v }))}
          placeholder="Örn. 123456"
          mono
        />
        <SecretField
          label="Mağaza Parola (merchant_key)"
          value={form.merchantKey}
          onChange={(v) => setForm((f) => ({ ...f, merchantKey: v }))}
          configured={meta.hasMerchantKey}
        />
        <SecretField
          label="Mağaza Gizli Anahtar (merchant_salt)"
          value={form.merchantSalt}
          onChange={(v) => setForm((f) => ({ ...f, merchantSalt: v }))}
          configured={meta.hasMerchantSalt}
        />
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-3">
          <input
            type="checkbox"
            checked={form.testMode}
            onChange={(e) => setForm((f) => ({ ...f, testMode: e.target.checked }))}
            className="h-4 w-4 rounded border-zinc-300"
          />
          <span>
            <span className="block text-[13px] font-medium text-zinc-800">Test modu</span>
            <span className="text-[11px] text-zinc-500">
              Açıkken PayTR test işlemleri; canlıya geçmeden kapatın.
            </span>
          </span>
        </label>
        <button
          type="button"
          onClick={() => void save()}
          disabled={saving || (form.cardPaymentEnabled && !form.merchantId.trim())}
          className="rounded-lg bg-zinc-900 px-5 py-2.5 text-[12px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>
      </div>

      {layout === "page" && (
        <p className="text-[11px] text-zinc-400">
          Bildirim URL (callback):{" "}
          <span className="font-mono text-zinc-500">{callbackUrl}</span>
          — PayTR mağaza panelinde bu adresi tanımlayın.
        </p>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-10 w-full rounded-lg border border-zinc-200 px-3 text-[13px] outline-none focus:border-[#38BDF8] ${mono ? "font-mono" : ""}`}
      />
    </div>
  )
}

function SecretField({
  label,
  value,
  onChange,
  configured,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  configured: boolean
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-zinc-500">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={configured ? "Değiştirmek için yeni değer girin" : "PayTR panelinden kopyalayın"}
        autoComplete="off"
        className="h-10 w-full rounded-lg border border-zinc-200 px-3 font-mono text-[13px] outline-none focus:border-[#38BDF8]"
      />
      {configured && !value && (
        <p className="mt-1 text-[10px] text-emerald-700">Kayıtlı — boş bırakırsanız korunur.</p>
      )}
    </div>
  )
}
