import { type NextRequest, NextResponse } from "next/server"
import { executeQuerySingle } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // ดึงข้อมูลนามบัตรพร้อมข้อมูลผู้ใช้
    const query = `
      SELECT 
        bc.*,
        u.name,
        u.email,
        u.phone,
        u.avatar,
        u.nameEn,
        u.department
      FROM BusinessCards bc
      JOIN users u ON bc.userId = u.id
      WHERE bc.userId = ?
    `
    const businessCard = await executeQuerySingle(query, [userId])

    if (!businessCard) {
      // ถ้าไม่มีข้อมูลนามบัตร ให้ดึงข้อมูลผู้ใช้เพื่อตรวจสอบว่ามีผู้ใช้นี้หรือไม่
      const userQuery = `SELECT id FROM users WHERE id = ?`
      const user = await executeQuerySingle(userQuery, [userId])

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      // ส่งข้อมูลว่ายังไม่ได้ลงทะเบียนนามบัตร
      return NextResponse.json({
        isRegistered: false,
        userId: userId,
      })
    }

    // แปลงข้อมูลให้เป็นรูปแบบที่ต้องการ
    return NextResponse.json({
      isRegistered: true,
      id: businessCard.id,
      userId: businessCard.userId,
      companyName: businessCard.companyName,
      companyWebsite: businessCard.companyWebsite,
      companyAddress: businessCard.companyAddress,
      companyPhone: businessCard.companyPhone,
      companyFax: businessCard.companyFax,
      branchAddress: businessCard.branchAddress,
      customEmail: businessCard.customEmail,
      customPhone: businessCard.customPhone,
      customAddress: businessCard.customAddress,
      jobTitle: businessCard.jobTitle || "ผู้จัดการฝ่ายเทคโนโลยีสารสนเทศ",
      name: businessCard.name,
      nameEn: businessCard.nameEn || "",
      email: businessCard.email,
      phone: businessCard.phone,
      avatar: businessCard.avatar,
      department: businessCard.department,
    })
  } catch (error) {
    console.error("Error fetching business card:", error)
    return NextResponse.json({ error: "Failed to fetch business card" }, { status: 500 })
  }
}
