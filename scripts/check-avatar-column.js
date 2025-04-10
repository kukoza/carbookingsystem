const mysql = require("mysql2/promise")
require("dotenv").config()

async function checkAndAddAvatarColumn() {
  console.log("Checking avatar column in Users table...")

  // สร้างการเชื่อมต่อกับฐานข้อมูล
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })

  try {
    // ตรวจสอบว่ามีคอลัมน์ avatar หรือไม่
    const [columns] = await connection.execute(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'Users' AND COLUMN_NAME = 'avatar'
    `,
      [process.env.DB_NAME],
    )

    if (columns.length === 0) {
      console.log("Avatar column does not exist. Adding it...")
      await connection.execute(`
        ALTER TABLE Users 
        ADD COLUMN avatar VARCHAR(255) NULL
      `)
      console.log("Avatar column added successfully.")
    } else {
      console.log("Avatar column already exists.")
    }

    console.log("Database check completed successfully.")
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await connection.end()
  }
}

checkAndAddAvatarColumn()

