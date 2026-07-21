"use client"

import { useRef } from "react"
import Link from "next/link"
import {
  FaBarcode,
  FaCheckCircle,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaPlus,
  FaSave,
  FaTag,
  FaTimes,
} from "react-icons/fa"
import type { CategoryTreeNode } from "@/types/category"

const INPUT_CLS =
  "h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/10 placeholder:text-zinc-300"
const SELECT_CLS = INPUT_CLS + " cursor-pointer appearance-none"
const TEXTAREA_CLS =
  "w-full rounded-xl border border-zinc-200 bg-white p-4 text-[15px] text-zinc-800 outline-none transition-all focus:border-[#38BDF8] focus:ring-4 focus:ring-[#38BDF8]/10 resize-none placeholder:text-zinc-300"

const STEPS = [
  { id: "info", label: "Bilgi", hint: "Ürün adı ve kategori" },
  { id: "image", label: "Görsel", hint: "Fotoğraf ekle" },
  { id: "price", label: "Fiyat", hint: "Fiyat ve stok" },
  { id: "code", label: "Kod", hint: "SKU ve barkod" },
  { id: "publish", label: "Kaydet", hint: "Yayınla" },
] as const

type StepId = (typeof STEPS)[number]["id"]

interface SubCategory {
  id: number
  name: string
  categoryId: number
}

interface MobileForm {
  name: string
  shortDescription: string
  categoryId: string
  subCategoryId: string
  basePrice: string
  compareAtPrice: string
  sku: string
  barcode: string
  isActive: boolean
  isFeatured: boolean
}

interface MobileNewProductWizardProps {
  step: number
  onStepChange: (step: number) => void
  form: MobileForm
  set: (name: string, value: unknown) => void
  categories: CategoryTreeNode[]
  subCategories: SubCategory[]
  images: string[]
  stock: string
  onStockChange: (value: string) => void
  isUploading: boolean
  onPickImages: (files: FileList | null) => void
  onRemoveImage: (index: number) => void
  generateBarcode: () => void
  loading: boolean
  onSave: () => void
  onValidationError: (message: string) => void
}

function validateStep(stepId: StepId, form: MobileForm, images: string[], stock: string): string | null {
  switch (stepId) {
    case "info":
      if (!form.name.trim()) return "Ürün adı zorunludur."
      return null
    case "image":
      if (images.length === 0) return "En az bir ürün görseli ekleyin."
      return null
    case "price":
      if (!form.basePrice || Number(form.basePrice) <= 0) return "Geçerli bir satış fiyatı girin."
      if (stock === "" || Number(stock) < 0) return "Stok adedi girin."
      return null
    case "code":
      return null
    case "publish":
      if (!form.name.trim() || !form.basePrice) return "Eksik bilgiler var. Önceki adımları kontrol edin."
      return null
    default:
      return null
  }
}

export function MobileNewProductWizard({
  step,
  onStepChange,
  form,
  set,
  categories,
  subCategories,
  images,
  stock,
  onStockChange,
  isUploading,
  onPickImages,
  onRemoveImage,
  generateBarcode,
  loading,
  onSave,
  onValidationError,
}: MobileNewProductWizardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  const goNext = () => {
    const error = validateStep(current.id, form, images, stock)
    if (error) {
      onValidationError(error)
      return
    }
    onStepChange(Math.min(step + 1, STEPS.length - 1))
  }

  const goBack = () => onStepChange(Math.max(step - 1, 0))

  return (
    <div className="lg:hidden">
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/admin/products"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-500 shadow-sm"
        >
          <FaChevronLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#38BDF8]">
            Adım {step + 1} / {STEPS.length}
          </p>
          <h1 className="truncate text-lg font-black text-zinc-900">{current.label}</h1>
          <p className="text-[12px] text-zinc-400">{current.hint}</p>
        </div>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div
          className="h-full rounded-full bg-[#38BDF8] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-3 flex gap-1 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              if (i < step) onStepChange(i)
            }}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors touch-manipulation ${
              i === step
                ? "bg-zinc-900 text-white"
                : i < step
                  ? "bg-[#38BDF8]/15 text-[#0284C7]"
                  : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {i + 1}. {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm ring-1 ring-zinc-100">
        {current.id === "info" && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[13px] font-bold text-zinc-700">
                Ürün Adı <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Örn: Altın Kaplama Küpe"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-zinc-700">Kategori</label>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={SELECT_CLS}
              >
                <option value="">Seçiniz</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-zinc-700">Alt Kategori</label>
              <select
                value={form.subCategoryId}
                onChange={(e) => set("subCategoryId", e.target.value)}
                className={SELECT_CLS}
                disabled={!form.categoryId || subCategories.length === 0}
              >
                <option value="">
                  {form.categoryId
                    ? subCategories.length > 0
                      ? "Seçiniz"
                      : "Alt kategori yok"
                    : "Önce kategori seçin"}
                </option>
                {subCategories.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-zinc-700">Kısa Açıklama</label>
              <textarea
                rows={3}
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="Ürünü kısaca anlatın..."
                className={TEXTAREA_CLS}
                maxLength={250}
              />
            </div>
          </div>
        )}

        {current.id === "image" && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#38BDF8]/30 bg-[#38BDF8]/5 py-12 touch-manipulation disabled:opacity-60"
            >
              {isUploading ? (
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#38BDF8] border-t-transparent" />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#38BDF8] shadow-md">
                  <FaPlus className="h-6 w-6" />
                </div>
              )}
              <div className="text-center">
                <p className="text-[14px] font-bold text-[#38BDF8]">
                  {isUploading ? "Yükleniyor..." : "Fotoğraf Seç veya Çek"}
                </p>
                <p className="mt-1 text-[11px] text-zinc-400">PNG, JPG, WEBP</p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              onChange={(e) => {
                onPickImages(e.target.files)
                e.target.value = ""
              }}
            />
            {images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {images.map((url, i) => (
                  <div key={`${url}-${i}`} className="relative aspect-square overflow-hidden rounded-xl border border-zinc-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute left-1 top-1 rounded bg-[#38BDF8] px-1.5 py-0.5 text-[8px] font-bold text-white">
                        ANA
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => onRemoveImage(i)}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white touch-manipulation"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 text-zinc-500">
                <FaImage className="h-5 w-5 shrink-0" />
                <p className="text-[12px]">Henüz görsel eklenmedi.</p>
              </div>
            )}
          </div>
        )}

        {current.id === "price" && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[13px] font-bold text-zinc-700">
                Satış Fiyatı (₺) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-300">₺</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.basePrice}
                  onChange={(e) => set("basePrice", e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={INPUT_CLS + " pl-10 text-xl font-black"}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-zinc-700">İndirimli Fiyat (₺)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-zinc-300">₺</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={form.compareAtPrice}
                  onChange={(e) => set("compareAtPrice", e.target.value)}
                  placeholder="Opsiyonel"
                  step="0.01"
                  min="0"
                  className={INPUT_CLS + " pl-10"}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-zinc-700">
                Stok Adedi <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={stock}
                onChange={(e) => onStockChange(e.target.value)}
                placeholder="0"
                min="0"
                className={INPUT_CLS + " text-xl font-black"}
              />
            </div>
          </div>
        )}

        {current.id === "code" && (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-[13px] font-bold text-zinc-700">SKU (Stok Kodu)</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder="Örn: AA-102"
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="mb-2 block text-[13px] font-bold text-zinc-700">Barkod</label>
              <div className="relative mb-3">
                <FaBarcode className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-300" />
                <input
                  type="text"
                  value={form.barcode}
                  onChange={(e) => set("barcode", e.target.value)}
                  placeholder="8690000000000"
                  className={INPUT_CLS + " pl-11"}
                />
              </div>
              <button
                type="button"
                onClick={generateBarcode}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 text-[13px] font-bold text-zinc-700 touch-manipulation"
              >
                <FaBarcode className="h-4 w-4" />
                Otomatik Barkod Üret
              </button>
            </div>
          </div>
        )}

        {current.id === "publish" && (
          <div className="space-y-5">
            <div className="rounded-xl bg-zinc-50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <FaCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-zinc-800">{form.name || "Ürün adı girilmedi"}</p>
                  <p className="text-[12px] text-zinc-500">
                    {categories.find((c) => String(c.id) === form.categoryId)?.name || "Kategori seçilmedi"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 text-zinc-500">
                  <FaTag className="h-3.5 w-3.5" /> Fiyat
                </span>
                <span className="font-black text-[#38BDF8]">
                  ₺{Number(form.basePrice || 0).toLocaleString("tr-TR")}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-zinc-500">Stok</span>
                <span className="font-bold text-zinc-800">{stock} adet</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-zinc-500">Görsel</span>
                <span className="font-bold text-zinc-800">{images.length} adet</span>
              </div>
            </div>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-white p-4">
              <div>
                <p className="text-[13px] font-bold text-zinc-800">Satışa Aç</p>
                <p className="text-[11px] text-zinc-400">Ürün mağazada görünsün</p>
              </div>
              <button
                type="button"
                onClick={() => set("isActive", !form.isActive)}
                className={`relative h-7 w-11 shrink-0 rounded-full transition-all touch-manipulation ${
                  form.isActive ? "bg-[#38BDF8]" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    form.isActive ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl border border-zinc-100 bg-white p-4">
              <div>
                <p className="text-[13px] font-bold text-zinc-800">Öne Çıkan</p>
                <p className="text-[11px] text-zinc-400">Ana sayfada göster</p>
              </div>
              <button
                type="button"
                onClick={() => set("isFeatured", !form.isFeatured)}
                className={`relative h-7 w-11 shrink-0 rounded-full transition-all touch-manipulation ${
                  form.isFeatured ? "bg-[#38BDF8]" : "bg-zinc-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    form.isFeatured ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </label>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto flex max-w-lg gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white text-[14px] font-bold text-zinc-600 touch-manipulation"
            >
              <FaChevronLeft className="h-3.5 w-3.5" />
              Geri
            </button>
          ) : null}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-[#38BDF8] text-[14px] font-black text-white shadow-lg touch-manipulation"
            >
              İleri
              <FaChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const error = validateStep("publish", form, images, stock)
                if (error) {
                  onValidationError(error)
                  return
                }
                onSave()
              }}
              disabled={loading}
              className="flex h-12 flex-[1.4] items-center justify-center gap-2 rounded-xl bg-zinc-900 text-[14px] font-black text-white shadow-lg touch-manipulation disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <FaSave className="h-4 w-4" />
              )}
              Ürünü Kaydet
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
