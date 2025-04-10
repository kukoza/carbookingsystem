const sql = require("mssql")
const fs = require("fs")
const path = require("path")

// ดึงค่า environment variables
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
}

async function addAvatarColumn() {
  try {
    console.log("Connecting to database...")
    await sql.connect(config)
    console.log("Connected to database")

    // ตรวจสอบว่าคอลัมน์ avatar_url มีอยู่แล้วหรือไม่
    const checkColumnResult = await sql.query`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Users'
      AND COLUMN_NAME = 'avatar_url'
    `

    const columnExists = checkColumnResult.recordset[0].count > 0

    if (columnExists) {
      console.log("Column avatar_url already exists in Users table")
    } else {
      // เพิ่มคอลัมน์ avatar_url
      console.log("Adding avatar_url column to Users table...")
      await sql.query`
        ALTER TABLE Users ADD avatar_url NVARCHAR(255) NULL
      `
      console.log("Column avatar_url added successfully")
    }

    // ปิดการเชื่อมต่อ
    await sql.close()
    console.log("Database connection closed")
  } catch (error) {
    console.error("Error:", error)
    process.exit(1)
  }
}

addAvatarColumn()

