const fs = require("fs")
const path = require("path")
const mysql = require("mysql2/promise")
require("dotenv").config()

// กำหนดค่าการเชื่อมต่อ
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "carbookingsystem",
}

// กำหนดโฟลเดอร์สำหรับเก็บรูปภาพ
const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/cars")

async function cleanupOrphanedImages() {
  let connection

  try {
    // ตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่
    if (!fs.existsSync(UPLOAD_DIR)) {
      console.log(`Directory does not exist: ${UPLOAD_DIR}`)
      return
    }

    // อ่านรายชื่อไฟล์ในโฟลเดอร์
    const files = fs
      .readdirSync(UPLOAD_DIR)
      .filter((file) => file !== ".gitkeep" && file !== "placeholder-logo.png" && !file.startsWith("."))

    console.log(`Found ${files.length} files in ${UPLOAD_DIR}`)

    // เชื่อมต่อกับฐานข้อมูล
    connection = await mysql.createConnection(dbConfig)

    // ดึงรายชื่อไฟล์ที่ใช้งานอยู่จากฐานข้อมูล
    const [rows] = await connection.execute("SELECT fileName FROM Cars WHERE fileName IS NOT NULL")
    const usedFiles = rows.map((row) => row.fileName).filter(Boolean)

    console.log(`Found ${usedFiles.length} files referenced in database`)

    // หาไฟล์ที่ไม่ได้ใช้งานแล้ว
    const orphanedFiles = files.filter((file) => !usedFiles.includes(file))

    console.log(`Found ${orphanedFiles.length} orphaned files`)

    // ลบไฟล์ที่ไม่ได้ใช้งานแล้ว
    for (const file of orphanedFiles) {
      const filePath = path.join(UPLOAD_DIR, file)
      try {
        fs.unlinkSync(filePath)
        console.log(`Deleted orphaned file: ${file}`)
      } catch (error) {
        console.error(`Error deleting file ${file}:`, error)
      }
    }

    console.log("Cleanup completed successfully")
  } catch (error) {
    console.error("Error during cleanup:", error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// รันฟังก์ชัน
cleanupOrphanedImages()

