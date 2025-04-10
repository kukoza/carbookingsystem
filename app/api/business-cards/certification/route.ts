import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { executeQuery, executeQuerySingle } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    let userIdToFetch: string | number

    if (!userId) {
      // ถ้าไม่มี userId ให้ตรวจสอบจาก token
      const cookieStore = cookies()
      const token = cookieStore.get("auth_token")

      if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const decoded = verify(token.value, process.env.JWT_SECRET || "your-secret-key") as {
        id: number
      }
      userIdToFetch = decoded.id
    } else {
      userIdToFetch = userId
    }

    // ดึงข้อมูลใบรับรองจากฐานข้อมูล
    const query = `
      SELECT certificationImage
      FROM BusinessCards
      WHERE userId = ?
    `
    const result = await executeQuerySingle(query, [userIdToFetch])

    if (!result || !result.certificationImage) {
      return NextResponse.json({ certificationImage: "/images/urs-certification.png" })
    }

    return NextResponse.json({ certificationImage: result.certificationImage })
  } catch (error) {
    console.error("Error fetching certification image:", error)
    return NextResponse.json({ error: "Failed to fetch certification image" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("auth_token")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verify(token.value, process.env.JWT_SECRET || "your-secret-key") as {
      id: number
    }

    const { certificationImage } = await request.json()

    // ตรวจสอบว่ามีข้อมูลนามบัตรของผู้ใช้นี้อยู่แล้วหรือไม่
    const existingCard = await executeQuerySingle("SELECT id FROM BusinessCards WHERE userId = ?", [decoded.id])

    // ตรวจสอบว่าคอลัมน์ certificationImage มีอยู่ในฐานข้อมูลหรือไม่
    try {
      // ลองตรวจสอบโครงสร้างตาราง
      await executeQuery("SHOW COLUMNS FROM BusinessCards LIKE 'certificationImage'", [])

      // ถ้าไม่มี error แสดงว่าคอลัมน์มีอยู่แล้ว
      if (existingCard) {
        // ถ้ามีข้อมูลอยู่แล้ว ให้อัปเดต
        await executeQuery("UPDATE BusinessCards SET certificationImage = ?, updatedAt = NOW() WHERE userId = ?", [
          certificationImage,
          decoded.id,
        ])
      } else {
        // ถ้ายังไม่มีข้อมูล ให้เพิ่มใหม่
        await executeQuery(
          "INSERT INTO BusinessCards (userId, certificationImage, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())",
          [decoded.id, certificationImage],
        )
      }
    } catch (columnError) {
      console.error("Column check error:", columnError)

      // ถ้าเกิด error แสดงว่าคอลัมน์ยังไม่มี ให้เพิ่มคอลัมน์
      try {
        await executeQuery("ALTER TABLE BusinessCards ADD COLUMN certificationImage VARCHAR(255)", [])
        console.log("Added certificationImage column to BusinessCards table")

        // หลังจากเพิ่มคอลัมน์แล้ว ให้อัปเดตข้อมูล
        if (existingCard) {
          await executeQuery("UPDATE BusinessCards SET certificationImage = ?, updatedAt = NOW() WHERE userId = ?", [
            certificationImage,
            decoded.id,
          ])
        } else {
          await executeQuery(
            "INSERT INTO BusinessCards (userId, certificationImage, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())",
            [decoded.id, certificationImage],
          )
        }
      } catch (alterError) {
        console.error("Error altering table:", alterError)
        return NextResponse.json({ error: "Failed to update database schema" }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Certification image updated successfully",
      certificationImage,
    })
  } catch (error) {
    console.error("Error saving certification image:", error)
    return NextResponse.json({ error: "Failed to save certification image" }, { status: 500 })
  }
}
