import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/authSession"
import {
  HEADER_BG_COLOR_KEY,
  HEADER_TEXT_COLOR_KEY,
  HEADER_ACCENT_COLOR_KEY,
  HEADER_LAYOUT_STYLE_KEY,
  HEADER_LAYOUT_STYLE_VALUES,
  parseRegistryUpdate,
} from "@/lib/admin/storeSettingsRegistry"
import { getHeaderAppearanceSettings, type HeaderAppearance } from "@/lib/headerAppearanceSettings"
import { AdminActivityAction, logAdminActivity } from "@/lib/adminActivityLog"

const hexColor = z.string().regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/)

const putSchema = z.object({
  bgColor: hexColor.optional(),
  textColor: hexColor.optional(),
  accentColor: hexColor.optional(),
  layoutStyle: z.enum(HEADER_LAYOUT_STYLE_VALUES).optional(),
})

const FIELD_TO_KEY: Record<keyof HeaderAppearance, string> = {
  bgColor: HEADER_BG_COLOR_KEY,
  textColor: HEADER_TEXT_COLOR_KEY,
  accentColor: HEADER_ACCENT_COLOR_KEY,
  layoutStyle: HEADER_LAYOUT_STYLE_KEY,
}

export async function GET() {
  try {
    const session = await getSessionFromCookies()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Yetkisiz." }, { status: 403 })
    }
    const appearance = await getHeaderAppearanceSettings(prisma)
    return NextResponse.json(appearance)
  } catch (e) {
    console.error("GET /api/admin/header-appearance:", e)
    return NextResponse.json({ message: "Yüklenemedi." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Yetkisiz." }, { status: 403 })
    }

    const json = await request.json()
    const parsed = putSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Geçersiz veri", issues: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const entries = Object.entries(data).filter(([, v]) => v !== undefined) as [
      keyof HeaderAppearance,
      string,
    ][]

    for (const [field, raw] of entries) {
      const key = FIELD_TO_KEY[field]
      const result = parseRegistryUpdate(key, raw)
      if ("error" in result) {
        return NextResponse.json({ message: result.error }, { status: 400 })
      }
      await prisma.setting.upsert({
        where: { key },
        update: { value: result.value, type: result.dbType },
        create: { key, value: result.value, type: result.dbType },
      })
    }

    const appearance = await getHeaderAppearanceSettings(prisma)
    await logAdminActivity(prisma, session, {
      action: AdminActivityAction.HEADER_APPEARANCE_SAVE,
      resourceType: "Settings",
      metadata: { fields: entries.map(([k]) => k) },
      request,
    })
    return NextResponse.json({ ok: true, ...appearance })
  } catch (e) {
    console.error("PUT /api/admin/header-appearance:", e)
    return NextResponse.json({ message: "Kaydedilemedi." }, { status: 500 })
  }
}
