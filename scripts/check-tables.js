const mysql = require("mysql2/promise")
require("dotenv").config()

async function checkTables() {
  try {
    // สร้างการเชื่อมต่อกับ MySQL
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "carbookingsystem",
      multipleStatements: true, // อนุญาตให้รันหลายคำสั่ง SQL พร้อมกัน
    })

    console.log("Connected to MySQL server")
    console.log("Database:", process.env.DB_NAME)

    // ตรวจสอบว่ามีตาราง Users หรือไม่
    const [tables] = await connection.query(
      `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name = 'Users'
    `,
      [process.env.DB_NAME || "carbookingsystem"],
    )

    if (tables.length === 0) {
      console.log("Table 'Users' does not exist. Creating it...")

      // สร้างตาราง Users
      await connection.query(`
        CREATE TABLE Users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL UNIQUE,
          department VARCHAR(100) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'ผู้ใช้งาน',
          password VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          employeeId VARCHAR(20),
          licenseNumber VARCHAR(50),
          licenseExpiry DATE,
          joinDate DATE,
          avatar VARCHAR(255),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)

      console.log("Table 'Users' created successfully")

      // เพิ่มผู้ดูแลระบบเริ่มต้น
      await connection.query(`
        INSERT INTO Users (name, email, department, role, password, employeeId) 
        VALUES ('ผู้ดูแลระบบ', 'admin@nozomi.com', 'ฝ่ายไอที', 'ผู้ดูแลระบบ', '$2b$10$8jfYkMQUG5JMsZxCVfpTXO9oGYaQNGQYS3LpvJLNGKrUORYGSyMdO', 'NZ-ADMIN');
      `)

      console.log("Default admin user created successfully")
    } else {
      console.log("Table 'Users' already exists")

      // ตรวจสอบจำนวนผู้ใช้ในตาราง
      const [users] = await connection.query(`SELECT COUNT(*) as count FROM Users`)
      console.log(`Number of users in the database: ${users[0].count}`)
    }

    // ปิดการเชื่อมต่อ
    await connection.end()
    console.log("Connection closed")
  } catch (error) {
    console.error("Error checking tables:", error)
    process.exit(1)
  }
}

checkTables()

