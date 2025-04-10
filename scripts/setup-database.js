const mysql = require("mysql2/promise")
const crypto = require("crypto")
require("dotenv").config()

// ฟังก์ชันสำหรับเข้ารหัสรหัสผ่านด้วย SHA-256
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex")
}

async function setupDatabase() {
  let connection

  try {
    console.log("Setting up database...")

    // เชื่อมต่อกับ MySQL โดยไม่ระบุฐานข้อมูล
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    })

    console.log("Connected to MySQL server")

    // สร้างฐานข้อมูลถ้ายังไม่มี
    const dbName = process.env.DB_NAME || "carbookingsystem"
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    console.log(`Database '${dbName}' created or already exists`)

    // เลือกใช้ฐานข้อมูล
    await connection.query(`USE ${dbName}`)
    console.log(`Using database '${dbName}'`)

    // สร้างตาราง Users ถ้ายังไม่มี
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Users (
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log("Table 'Users' created or already exists")

    // ตรวจสอบว่ามีผู้ดูแลระบบหรือไม่
    const [adminRows] = await connection.query(`SELECT COUNT(*) as count FROM Users WHERE role = 'ผู้ดูแลระบบ'`)
    const adminCount = adminRows[0].count

    if (adminCount === 0) {
      // เข้ารหัสรหัสผ่านด้วย SHA-256
      const hashedPassword = hashPassword("admin123")

      // เพิ่มผู้ดูแลระบบเริ่มต้น (รหัสผ่าน: admin123)
      await connection.query(
        `
        INSERT INTO Users (name, email, department, role, password, employeeId) 
        VALUES ('ผู้ดูแลระบบ', 'admin@nozomi.com', 'ฝ่ายไอที', 'ผู้ดูแลระบบ', ?, 'NZ-ADMIN')
      `,
        [hashedPassword],
      )
      console.log("Default admin user created")
    } else {
      console.log(`${adminCount} admin users already exist`)
    }

    // สร้างตาราง CarTypes ถ้ายังไม่มี
    await connection.query(`
      CREATE TABLE IF NOT EXISTS CarTypes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        capacity INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log("Table 'CarTypes' created or already exists")

    // สร้างตาราง Cars ถ้ายังไม่มี
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Cars (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        licensePlate VARCHAR(20) NOT NULL UNIQUE,
        status VARCHAR(20) DEFAULT 'ว่าง',
        initialMileage INT DEFAULT 0,
        currentMileage INT DEFAULT 0,
        lastService DATE,
        nextService DATE,
        image VARCHAR(255),
        fileName VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log("Table 'Cars' created or already exists")

    // สร้างตาราง Bookings ถ้ายังไม่มี
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        carId INT NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        startTime VARCHAR(5) NOT NULL,
        endTime VARCHAR(5) NOT NULL,
        purpose VARCHAR(500) NOT NULL,
        destination VARCHAR(255),
        status VARCHAR(20) DEFAULT 'รออนุมัติ',
        startMileage INT,
        endMileage INT,
        mileageDiff INT,
        fuelLevel VARCHAR(20),
        fuelCost DECIMAL(10,2),
        notes VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approvedAt TIMESTAMP NULL,
        approvedBy INT,
        FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE,
        FOREIGN KEY (carId) REFERENCES Cars(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log("Table 'Bookings' created or already exists")

    // สร้างตาราง Maintenance ถ้ายังไม่มี
    await connection.query(`
      CREATE TABLE IF NOT EXISTS Maintenance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        carId INT NOT NULL,
        serviceDate DATE NOT NULL,
        serviceType VARCHAR(100) NOT NULL,
        description TEXT,
        cost DECIMAL(10,2),
        mileage INT,
        nextServiceDate DATE,
        nextServiceMileage INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        createdBy INT,
        FOREIGN KEY (carId) REFERENCES Cars(id) ON DELETE CASCADE,
        FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)
    console.log("Table 'Maintenance' created or already exists")

    // สร้าง Indexes โดยตรวจสอบก่อนว่ามีอยู่แล้วหรือไม่
    // ใช้ SHOW INDEX แทน IF NOT EXISTS เนื่องจาก MariaDB ไม่รองรับ IF NOT EXISTS สำหรับ CREATE INDEX

    // สร้าง index สำหรับตาราง Users
    await createIndexIfNotExists(connection, "Users", "idx_users_email", "email")

    // สร้าง index สำหรับตาราง Cars
    await createIndexIfNotExists(connection, "Cars", "idx_cars_status", "status")

    // สร้าง index สำหรับตาราง Bookings
    await createIndexIfNotExists(connection, "Bookings", "idx_bookings_dates", "startDate, endDate")
    await createIndexIfNotExists(connection, "Bookings", "idx_bookings_status", "status")
    await createIndexIfNotExists(connection, "Bookings", "idx_bookings_user", "userId")
    await createIndexIfNotExists(connection, "Bookings", "idx_bookings_car", "carId")

    // สร้าง index สำหรับตาราง Maintenance
    await createIndexIfNotExists(connection, "Maintenance", "idx_maintenance_car", "carId")

    console.log("Indexes created or already exist")
    console.log("Database setup completed successfully")
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("Connection closed")
    }
  }
}

// ฟังก์ชันสำหรับสร้าง index ถ้ายังไม่มี
async function createIndexIfNotExists(connection, tableName, indexName, columns) {
  try {
    // ตรวจสอบว่า index มีอยู่แล้วหรือไม่
    const [indexes] = await connection.query(`SHOW INDEX FROM ${tableName} WHERE Key_name = ?`, [indexName])

    // ถ้าไม่มี index ให้สร้างใหม่
    if (indexes.length === 0) {
      await connection.query(`CREATE INDEX ${indexName} ON ${tableName}(${columns})`)
      console.log(`Index ${indexName} created on ${tableName}(${columns})`)
    } else {
      console.log(`Index ${indexName} already exists on ${tableName}`)
    }
  } catch (error) {
    console.error(`Error creating index ${indexName} on ${tableName}:`, error)
    // ไม่ throw error เพื่อให้สคริปต์ทำงานต่อไปได้
  }
}

setupDatabase()

