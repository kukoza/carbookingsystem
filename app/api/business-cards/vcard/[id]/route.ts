import { type NextRequest, NextResponse } from "next/server"
import { executeQuerySingle } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // ดึงข้อมูลผู้ใช้
    const user = await executeQuerySingle("SELECT * FROM Users WHERE id = ?", [userId])

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ดึงข้อมูลนามบัตร
    const businessCard = await executeQuerySingle("SELECT * FROM BusinessCards WHERE userId = ?", [userId])

    // สร้าง vCard
    const vCardData = generateVCard(user, businessCard)

    return NextResponse.json({ vCardData })
  } catch (error) {
    console.error("Error generating vCard:", error)
    return NextResponse.json({ error: "Failed to generate vCard" }, { status: 500 })
  }
}

// ฟังก์ชันสำหรับสร้าง vCard
function generateVCard(user: any, businessCard: any) {
  // เริ่มต้น vCard
  let vCard = "BEGIN:VCARD\nVERSION:3.0\n"

  // เพิ่มชื่อ
  vCard += `FN:${user.name}\n`
  vCard += `N:${user.name};;;;\n`

  // เพิ่มตำแหน่ง
  const departmentMap: { [key: string]: string } = {
    PD: "ผู้จัดการฝ่ายผลิต",
    DL: "ผู้จัดการฝ่ายจัดส่ง",
    PU: "ผู้จัดการฝ่ายจัดซื้อ",
    MK: "ผู้จัดการฝ่ายการตลาด",
    SEC: "เลขานุการ",
    ACC: "ผู้จัดการฝ่ายบัญชี",
    QA: "เจ้าหน้าที่ควบคุมคุณภาพ",
    HR: "ผู้จัดการฝ่ายทรัพยากรบุคคล",
    ST: "ผู้จัดการฝ่ายคลังสินค้า",
    MT: "ผู้จัดการฝ่ายซ่อมบำรุง",
    IT: "ผู้จัดการฝ่ายเทคโนโลยีสารสนเทศ",
  }

  const position = businessCard?.jobTitle || departmentMap[user.department] || "เจ้าหน้าที่"
  vCard += `TITLE:${position}\n`

  // เพิ่มองค์กร
  const companyName = businessCard?.companyName || "NOZOMI ENTERPRISE (THAILAND) CO., LTD"
  vCard += `ORG:${companyName}\n`

  // เพิ่มอีเมล
  const email = businessCard?.customEmail || user.email
  vCard += `EMAIL:${email}\n`

  // เพิ่มเบอร์โทร
  const phone = businessCard?.customPhone || user.phone
  if (phone) {
    vCard += `TEL;TYPE=CELL:${phone}\n`
  }

  // เพิ่มเบอร์โทรบริษัท
  if (businessCard?.companyPhone) {
    vCard += `TEL;TYPE=WORK:${businessCard.companyPhone}\n`
  }

  // เพิ่มแฟกซ์
  if (businessCard?.companyFax) {
    vCard += `TEL;TYPE=FAX:${businessCard.companyFax}\n`
  }

  // เพิ่มที่อยู่
  const address = businessCard?.companyAddress || "382 หมู่ 4 บ้านกลางสวน, พระสมุทรเจดีย์, สมุทรปราการ 10290 ประเทศไทย"
  if (address) {
    vCard += `ADR;TYPE=WORK:;;${address};;;;\n`
  }

  // เพิ่มเว็บไซต์
  const website = businessCard?.companyWebsite || "www.nozomi-th.com"
  vCard += `URL:${website}\n`

  // จบ vCard
  vCard += "END:VCARD"

  return vCard
}
