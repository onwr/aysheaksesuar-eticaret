import type { PrismaClient } from "@/generated/prisma/client"
import {
  HEADER_APPEARANCE_SETTING_KEYS,
  HEADER_BG_COLOR_KEY,
  HEADER_TEXT_COLOR_KEY,
  HEADER_ACCENT_COLOR_KEY,
  HEADER_LAYOUT_STYLE_KEY,
  HEADER_LAYOUT_STYLE_VALUES,
  getRegistryEntry,
  type HeaderLayoutStyle,
} from "@/lib/admin/storeSettingsRegistry"

export const HEADER_APPEARANCE_UPDATED_EVENT = "header-appearance-updated"

export type { HeaderLayoutStyle }

export type HeaderAppearance = {
  bgColor: string
  textColor: string
  accentColor: string
  layoutStyle: HeaderLayoutStyle
}

function defaultOf(key: string): string {
  const entry = getRegistryEntry(key)
  return entry ? String(entry.defaultValue) : ""
}

function isHeaderLayoutStyle(v: string): v is HeaderLayoutStyle {
  return (HEADER_LAYOUT_STYLE_VALUES as readonly string[]).includes(v)
}

/** Panel veya DB yokken header için kullanılan varsayılan renkler ve düzen. */
export const HEADER_APPEARANCE_FALLBACK: HeaderAppearance = {
  bgColor: defaultOf(HEADER_BG_COLOR_KEY),
  textColor: defaultOf(HEADER_TEXT_COLOR_KEY),
  accentColor: defaultOf(HEADER_ACCENT_COLOR_KEY),
  layoutStyle: (() => {
    const d = defaultOf(HEADER_LAYOUT_STYLE_KEY)
    return isHeaderLayoutStyle(d) ? d : "centered"
  })(),
}

const KEY_TO_FIELD: Record<(typeof HEADER_APPEARANCE_SETTING_KEYS)[number], keyof HeaderAppearance> = {
  [HEADER_BG_COLOR_KEY]: "bgColor",
  [HEADER_TEXT_COLOR_KEY]: "textColor",
  [HEADER_ACCENT_COLOR_KEY]: "accentColor",
  [HEADER_LAYOUT_STYLE_KEY]: "layoutStyle",
}

/** Ayar satırı yoksa `HEADER_APPEARANCE_FALLBACK`; varsa DB değeri kullanılır. */
export async function getHeaderAppearanceSettings(
  db: PrismaClient
): Promise<HeaderAppearance> {
  const out: HeaderAppearance = { ...HEADER_APPEARANCE_FALLBACK }

  try {
    const rows = await db.setting.findMany({
      where: { key: { in: [...HEADER_APPEARANCE_SETTING_KEYS] } },
      select: { key: true, value: true },
    })
    const map = new Map(rows.map((r) => [r.key, r.value.trim()]))

    for (const key of HEADER_APPEARANCE_SETTING_KEYS) {
      const field = KEY_TO_FIELD[key]
      const value = map.get(key)
      if (!value) continue
      if (field === "layoutStyle") {
        if (isHeaderLayoutStyle(value)) out.layoutStyle = value
      } else {
        out[field] = value
      }
    }
  } catch {
    return { ...HEADER_APPEARANCE_FALLBACK }
  }

  return out
}
