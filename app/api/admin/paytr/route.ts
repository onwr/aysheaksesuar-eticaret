import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/authSession"
import {
  getPaytrConfigForAdmin,
  persistPaytrSettings,
  type PersistPaytrInput,
} from "@/lib/paytrSettings"
import { AdminActivityAction, logAdminActivity } from "@/lib/adminActivityLog"

const putSchema = z
  .object({
    merchantId: z.string().trim().max(64),
    testMode: z.boolean(),
    cardPaymentEnabled: z.boolean(),
    merchantKey: z.string().max(256).optional(),
    merchantSalt: z.string().max(256).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.cardPaymentEnabled && !data.merchantId.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Kart ödemesi açıkken Mağaza No zorunludur.",
        path: ["merchantId"],
      })
    }
  })

export async function GET() {
  try {
    const session = await getSessionFromCookies()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 })
    }
    const cfg = await getPaytrConfigForAdmin(prisma)
    return NextResponse.json(cfg)
  } catch (error) {
    console.error("GET /api/admin/paytr:", error)
    return NextResponse.json({ message: "Ayarlar yüklenemedi." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionFromCookies()
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 403 })
    }

    const parsed = putSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Geçersiz veri." },
        { status: 400 }
      )
    }

    const b = parsed.data
    const payload: PersistPaytrInput = {
      merchantId: b.merchantId,
      testMode: b.testMode,
      cardPaymentEnabled: b.cardPaymentEnabled,
    }
    if (b.merchantKey !== undefined && b.merchantKey.length > 0) {
      payload.merchantKey = b.merchantKey
    }
    if (b.merchantSalt !== undefined && b.merchantSalt.length > 0) {
      payload.merchantSalt = b.merchantSalt
    }

    await persistPaytrSettings(prisma, payload)
    const cfg = await getPaytrConfigForAdmin(prisma)

    await logAdminActivity(prisma, session, {
      action: AdminActivityAction.PAYTR_SAVE,
      resourceType: "Settings",
      metadata: { area: "paytr", testMode: b.testMode, cardPaymentEnabled: b.cardPaymentEnabled },
      request,
    })

    return NextResponse.json({ ok: true, ...cfg })
  } catch (error) {
    console.error("PUT /api/admin/paytr:", error)
    return NextResponse.json({ message: "Kaydedilemedi." }, { status: 500 })
  }
}
