import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { executeQuerySingle } from "@/lib/db"
import QRCode from "qrcode"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "your-secret-key") as {
      id: number
    }

    // ดึงข้อมูลผู้ใช้
    const user = await executeQuerySingle("SELECT * FROM Users WHERE id = ?", [decoded.id])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // สร้าง URL สำหรับแชร์นามบัตร
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000"
    const shareUrl = `${baseUrl}/share/business-card/${user.id}`

    // สร้าง QR code
    const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 300,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    // แปลง data URL เป็น base64 string
    const base64Data = qrCodeDataUrl.split(",")[1]

    return NextResponse.json({ vCardData: base64Data, shareUrl })
  } catch (error) {
    console.error("Error generating QR code:", error)
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 })
  }
}
