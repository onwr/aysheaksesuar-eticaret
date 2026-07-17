import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getHeaderAppearanceSettings } from "@/lib/headerAppearanceSettings"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const appearance = await getHeaderAppearanceSettings(prisma)
  return NextResponse.json(appearance)
}
