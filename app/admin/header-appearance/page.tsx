"use client"

import { useState, useEffect } from "react"
import { FaCheckCircle, FaExclamationTriangle, FaPalette, FaUndo, FaBars, FaHeart, FaShoppingBag } from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import {
  HEADER_APPEARANCE_UPDATED_EVENT,
  type HeaderAppearance,
  type HeaderLayoutStyle,
} from "@/lib/headerAppearanceSettings"

const DEFAULTS: HeaderAppearance = {
  bgColor: "#FBF8F2",
  textColor: "#27231F",
  accentColor: "#B99754",
  layoutStyle: "centered",
}

const LAYOUT_OPTIONS: { value: HeaderLayoutStyle; label: string; hint: string }[] = [
  { value: "centered", label: "1. Stil — Logo ortada", hint: "Arama solda, logo tam ortada, hesap/favori/sepet sağda." },
  { value: "left", label: "2. Stil — Logo solda", hint: "Logo solda, arama çubuğu ortada geniş, hesap/favori/sepet sağda." },
]

function LayoutPreview({ style }: { style: HeaderLayoutStyle }) {
  const pill = <div className="h-3 flex-1 rounded-full bg-zinc-200" />
  const box = <div className="h-5 w-9 shrink-0 rounded bg-zinc-400" />
  const icons = (
    <div className="flex shrink-0 items-center gap-1.5 text-zinc-400">
      <FaHeart className="h-3 w-3" />
      <FaShoppingBag className="h-3 w-3" />
    </div>
  )
  const hamburger = <FaBars className="h-3 w-3 shrink-0 text-zinc-400" />

  if (style === "left") {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        {hamburger}
        {box}
        {pill}
        {icons}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      {hamburger}
      <div className="w-10 shrink-0">{pill}</div>
      <div className="flex flex-1 justify-center">{box}</div>
      {icons}
    </div>
  )
}

const emptyForm: HeaderAppearance = { ...DEFAULTS }

function isValidHex(v: string) {
  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test(v)
}

export default function AdminHeaderAppearancePage() {
  const [form, setForm] = useState<HeaderAppearance>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch("/api/admin/header-appearance")
      .then((r) => r.json())
      .then((d: Partial<HeaderAppearance> & { message?: string }) => {
        if (cancelled || d.message) return
        setForm({
          bgColor: d.bgColor ?? DEFAULTS.bgColor,
          textColor: d.textColor ?? DEFAULTS.textColor,
          accentColor: d.accentColor ?? DEFAULTS.accentColor,
          layoutStyle: d.layoutStyle ?? DEFAULTS.layoutStyle,
        })
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    for (const key of ["bgColor", "textColor", "accentColor"] as const) {
      if (!isValidHex(form[key])) {
        setToast({ msg: `Geçersiz renk: ${key} (#RRGGBB formatında olmalı)`, ok: false })
        return
      }
    }

    setSaving(true)
    setToast(null)
    try {
      const res = await fetch("/api/admin/header-appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setToast({ msg: "Kaydedildi.", ok: true })
        setForm({
          bgColor: data.bgColor ?? form.bgColor,
          textColor: data.textColor ?? form.textColor,
          accentColor: data.accentColor ?? form.accentColor,
          layoutStyle: data.layoutStyle ?? form.layoutStyle,
        })
        window.dispatchEvent(new Event(HEADER_APPEARANCE_UPDATED_EVENT))
        setTimeout(() => setToast(null), 3000)
      } else {
        setToast({ msg: data.message || "Kayıt başarısız.", ok: false })
      }
    } catch {
      setToast({ msg: "Bağlantı hatası.", ok: false })
    } finally {
      setSaving(false)
    }
  }

  const colorField = (
    label: string,
    hint: string,
    key: "bgColor" | "textColor" | "accentColor"
  ) => (
    <div>
      <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-zinc-400">
        {label}
      </label>
      <p className="mb-2 text-[11px] text-zinc-500">{hint}</p>
      <div className="flex items-center gap-3">
        <input
          type="color"
          className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-zinc-200 bg-white p-1"
          value={isValidHex(form[key]) ? form[key] : "#000000"}
          onChange={(e) => setForm({ ...form, [key]: e.target.value.toUpperCase() })}
        />
        <input
          type="text"
          className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-4 text-[13px] font-medium uppercase outline-none focus:border-zinc-900"
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          placeholder="#RRGGBB"
          maxLength={7}
        />
      </div>
    </div>
  )

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-[#fcfcfc] p-6">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 right-8 z-200 flex items-center gap-3 rounded-2xl border-l-4 px-6 py-4 shadow-2xl backdrop-blur-md
              ${toast.ok ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-rose-500 bg-rose-50 text-rose-800"}`}
          >
            {toast.ok ? (
              <FaCheckCircle className="text-emerald-500" />
            ) : (
              <FaExclamationTriangle className="text-rose-500" />
            )}
            <span className="text-sm font-bold">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-primary/10 text-primary shadow-sm">
          <FaPalette className="text-lg" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">Header Görünümü</h1>
          <p className="mt-1 text-[13px] font-medium text-zinc-500">
            Üst menünün (duyuru şeridi hariç) arka plan, metin ve vurgu renklerini buradan
            değiştirebilirsiniz. Değişiklikler kaydedildikten sonra sitede anında görünür.
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-400">Yükleniyor…</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm md:p-8"
        >
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-widest text-zinc-400">
              Header düzeni
            </label>
            <p className="mb-3 text-[11px] text-zinc-500">
              Logo ve arama çubuğunun masaüstündeki yerleşimini seçin.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {LAYOUT_OPTIONS.map((opt) => {
                const selected = form.layoutStyle === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm({ ...form, layoutStyle: opt.value })}
                    aria-pressed={selected}
                    className={`rounded-2xl border p-3 text-left transition ${
                      selected
                        ? "border-zinc-900 ring-2 ring-zinc-900/10"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <LayoutPreview style={opt.value} />
                    <p className="mt-2 text-[12px] font-bold text-zinc-800">{opt.label}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-500">{opt.hint}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {colorField("Arka plan rengi", "Header'ın zemin rengi.", "bgColor")}
          {colorField(
            "Metin rengi",
            "Menü, ikon ve başlık metinlerinin rengi.",
            "textColor"
          )}
          {colorField(
            "Vurgu rengi",
            "Hover ve aktif durumdaki ikon/link rengi.",
            "accentColor"
          )}

          <div
            className="flex items-center gap-4 rounded-2xl border p-4"
            style={{ background: form.bgColor, borderColor: form.accentColor, color: form.textColor }}
          >
            <span className="text-sm font-bold">Önizleme</span>
            <span className="text-sm" style={{ color: form.accentColor }}>
              Vurgu rengi metni
            </span>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...DEFAULTS })}
              className="flex h-12 items-center gap-2 rounded-2xl border border-zinc-200 px-5 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50"
            >
              <FaUndo className="h-3.5 w-3.5" />
              Varsayılana Dön
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-12 flex-1 rounded-2xl bg-zinc-900 text-sm font-black uppercase tracking-widest text-white shadow-xl transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
