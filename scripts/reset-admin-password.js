const mysql = require("mysql2/promise")
const crypto = require("crypto")
require("dotenv").config()

// ฟังก์ชันสำหรับเข้ารหัสรหัสผ่านด้วย SHA-256
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function resetAdminPassword() {
  let connection

  try {
    console.log("Resetting admin password...")

    // เชื่อมต่อกับ MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "carbookingsystem",
    })

    console.log("Connected to MySQL server")

    // รหัสผ่านใหม่: admin123
    const newPassword = "admin123"
    const hashedPassword = hashPassword(newPassword)

    // อัปเดตรหัสผ่านของผู้ดูแลระบบ
    const [result] = await connection.execute(`UPDATE Users SET password = ? WHERE email = 'admin@nozomi.com'`, [
      hashedPassword,
    ])

    if (result.affectedRows > 0) {
      console.log("Admin password has been reset successfully")
      console.log("Email: admin@nozomi.com")
      console.log("Password: admin123")
    } else {
      console.log("No admin user found with email admin@nozomi.com")

      // ถ้าไม่พบผู้ดูแลระบบ ให้สร้างใหม่
      console.log("Creating new admin user...")
      await connection.execute(
        `INSERT INTO Users (name, email, department, role, password, employeeId) 
         VALUES ('ผู้ดูแลระบบ', 'admin@nozomi.com', 'ฝ่ายไอที', 'ผู้ดูแลระบบ', ?, 'NZ-ADMIN')`,
        [hashedPassword],
      )
      console.log("New admin user created successfully")
      console.log("Email: admin@nozomi.com")
      console.log("Password: admin123")
    }
  } catch (error) {
    console.error("Error resetting admin password:", error)
  } finally {
    if (connection) {
      await connection.end()
      console.log("Connection closed")
    }
  }
}

resetAdminPassword()

