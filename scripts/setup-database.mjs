import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// โหลด environment variables จากไฟล์ .env
dotenv.config();

// กำหนดค่าการเชื่อมต่อ (ไม่รวมชื่อฐานข้อมูล เพราะเราจะสร้างฐานข้อมูลใหม่)
const connectionConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
};

async function setupDatabase() {
  let connection;
  
  try {
    // เชื่อมต่อกับ MySQL (ไม่ระบุฐานข้อมูล)
    console.log('กำลังเชื่อมต่อกับ MySQL...');
    connection = await mysql.createConnection(connectionConfig);
    
    // สร้างฐานข้อมูล (ถ้ายังไม่มี)
    console.log('กำลังสร้างฐานข้อมูล...');
    await connection.execute(`
      CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'carbookingsystem'} 
      CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    
    // ปิดการเชื่อมต่อเดิม
    await connection.end();
    
    // เชื่อมต่อกับฐานข้อมูลที่สร้างขึ้น
    const dbConfig = {
      ...connectionConfig,
      database: process.env.DB_NAME || 'carbookingsystem',
    };
    
    console.log(`กำลังเชื่อมต่อกับฐานข้อมูล ${dbConfig.database}...`);
    connection = await mysql.createConnection(dbConfig);
    
    // สร้างตาราง Users
    console.log('กำลังสร้างตาราง Users...');
    await connection.execute(`
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
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // สร้างตาราง Cars
    console.log('กำลังสร้างตาราง Cars...');
    await connection.execute(`
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
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // สร้างตาราง Bookings
    console.log('กำลังสร้างตาราง Bookings...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Bookings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        userId INT NOT NULL,
        carId INT NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        startTime VARCHAR(5) NOT NULL,
        endTime VARCHAR(5) NOT NULL,
        purpose VARCHAR(500) NOT NULL,
        status VARCHAR(20) DEFAULT 'รออนุมัติ',
        startMileage INT,
        endMileage INT,
        notes VARCHAR(500),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approvedAt TIMESTAMP NULL,
        approvedBy INT,
        FOREIGN KEY (userId) REFERENCES Users(id),
        FOREIGN KEY (carId) REFERENCES Cars(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // ตรวจสอบว่ามีข้อมูลในตาราง Users หรือไม่
    const [userRows] = await connection.execute('SELECT COUNT(*) as count FROM Users');
    
    // ถ้าไม่มีข้อมูลในตาราง Users ให้เพิ่มข้อมูลตัวอย่าง
    if (userRows[0].count === 0) {
      console.log('กำลังเพิ่มข้อมูลตัวอย่างในตาราง Users...');
      await connection.execute(`
        INSERT INTO Users (name, email, department, role, password)
        VALUES 
        ('ทานากะ ฮิโรชิ', 'tanaka@nozomi.com', 'ฝ่ายขาย', 'ผู้ใช้งาน', 'password123'),
        ('นาคามูระ ยูกิ', 'nakamura@nozomi.com', 'ฝ่ายไอที', 'ผู้ดูแลระบบ', 'password123')
      `);
    }
    
    // ตรวจสอบว่ามีข้อมูลในตาราง Cars หรือไม่
    const [carRows] = await connection.execute('SELECT COUNT(*) as count FROM Cars');
    
    // ถ้าไม่มีข้อมูลในตาราง Cars ให้เพิ่มข้อมูลตัวอย่าง
    if (carRows[0].count === 0) {
      console.log('กำลังเพิ่มข้อมูลตัวอย่างในตาราง Cars...');
      await connection.execute(`
        INSERT INTO Cars (name, type, licensePlate, initialMileage, currentMileage)
        VALUES 
        ('โตโยต้า คัมรี่', 'รถเก๋ง', 'NZ-1234', 45678, 45678),
        ('ฮอนด้า ซีอาร์-วี', 'รถอเนกประสงค์', 'NZ-5678', 32456, 32456)
      `);
    }
    
    console.log('การตั้งค่าฐานข้อมูลเสร็จสมบูรณ์!');
    
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการตั้งค่าฐานข้อมูล:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// รันฟังก์ชันตั้งค่าฐานข้อมูล
setupDatabase();

