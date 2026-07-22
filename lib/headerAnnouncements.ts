export const HEADER_ANNOUNCEMENTS_KEY = "HEADER_ANNOUNCEMENTS"

export const ANNOUNCEMENTS_UPDATED_EVENT = "ydy-announcements-updated"

export const DEFAULT_HEADER_ANNOUNCEMENTS = [
  "Özenle Paketlenir",
  "Güvenli Ödeme",
  "Yeni Sezon Koleksiyonu",
]

export function normalizeAnnouncements(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .map((v) => String(v ?? "").trim())
    .filter((v) => v.length > 0)
}
