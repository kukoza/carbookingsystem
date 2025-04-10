-- สร้างฐานข้อมูล
CREATE DATABASE IF NOT EXISTS carbookingsystem
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ใช้ฐานข้อมูล
USE carbookingsystem;

-- ลบตารางเดิมถ้ามี (ลบตามลำดับความสัมพันธ์)
DROP TABLE IF EXISTS Maintenance;
DROP TABLE IF EXISTS Bookings;
DROP TABLE IF EXISTS Cars;
DROP TABLE IF EXISTS CarTypes;
DROP TABLE IF EXISTS Users;

-- สร้างตาราง Users
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

-- สร้างตาราง CarTypes
CREATE TABLE CarTypes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  capacity INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สร้างตาราง Cars
CREATE TABLE Cars (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สร้างตาราง Bookings
CREATE TABLE Bookings (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สร้างตาราง Maintenance
CREATE TABLE Maintenance (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- สร้าง Indexes เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_cars_status ON Cars(status);
CREATE INDEX idx_bookings_dates ON Bookings(startDate, endDate);
CREATE INDEX idx_bookings_status ON Bookings(status);
CREATE INDEX idx_bookings_user ON Bookings(userId);
CREATE INDEX idx_bookings_car ON Bookings(carId);
CREATE INDEX idx_maintenance_car ON Maintenance(carId);

-- เพิ่มข้อมูลเริ่มต้น
-- เพิ่มผู้ดูแลระบบเริ่มต้น (รหัสผ่าน: admin123 เข้ารหัสด้วย SHA-256)
INSERT INTO Users (name, email, department, role, password, employeeId) 
VALUES ('ผู้ดูแลระบบ', 'admin@nozomi.com', 'ฝ่ายไอที', 'ผู้ดูแลระบบ', '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c', 'NZ-ADMIN');

-- เพิ่มประเภทรถเริ่มต้น
INSERT INTO CarTypes (name, description, capacity) VALUES
('รถเก๋ง', 'รถยนต์ 4 ประตูที่มีห้องเก็บสัมภาระแยกต่างหาก', 5),
('รถอเนกประสงค์', 'รถยนต์อเนกประสงค์ที่มีระยะห่างจากพื้นสูง', 7),
('รถตู้', 'รถขนาดใหญ่สำหรับขนส่งกลุ่มคน', 12),
('รถกระบะ', 'รถบรรทุกเบาที่มีพื้นที่บรรทุกเปิดโล่ง', 5);

-- เพิ่มรถเริ่มต้น
INSERT INTO Cars (name, type, licensePlate, initialMileage, currentMileage, status) VALUES
('โตโยต้า คัมรี่', 'รถเก๋ง', 'NZ-1234', 45678, 45678, 'ว่าง'),
('ฮอนด้า ซีอาร์-วี', 'รถอเนกประสงค์', 'NZ-5678', 32456, 32456, 'ว่าง'),
('โตโยต้า ไฮเอซ', 'รถตู้', 'NZ-9012', 78901, 78901, 'ว่าง');

-- คำสั่ง SQL สำหรับการบำรุงรักษาระบบ

-- คำสั่งสำหรับรีเซ็ตรหัสผ่านผู้ดูแลระบบ (รหัสผ่าน: admin123)
-- UPDATE Users SET password = '0ffe1abd1a08215353c233d6e009613e95eec4253832a761af28ff37ac5a150c' WHERE email = 'admin@nozomi.com';

-- คำสั่งสำหรับแก้ไขสถานะรถที่ผิดปกติ
-- UPDATE Cars c SET c.status = 'ว่าง' WHERE c.id NOT IN (SELECT b.carId FROM Bookings b WHERE b.status = 'อนุมัติ');
-- UPDATE Cars c SET c.status = 'ไม่ว่าง' WHERE c.id IN (SELECT b.carId FROM Bookings b WHERE b.status = 'อนุมัติ');

-- คำสั่งสำหรับตรวจสอบการจองที่ซ้ำซ้อน
-- SELECT c.licensePlate, COUNT(b.id) as booking_count
-- FROM Cars c
-- JOIN Bookings b ON c.id = b.carId
-- WHERE b.status = 'อนุมัติ'
-- GROUP BY c.id
-- HAVING booking_count > 1;

