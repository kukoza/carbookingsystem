-- ตรวจสอบโครงสร้างตาราง BusinessCards
DESCRIBE BusinessCards;

-- ตรวจสอบข้อมูลในตาราง BusinessCards
SELECT * FROM BusinessCards;

-- ตรวจสอบค่า default ของคอลัมน์ companyAddress
SHOW COLUMNS FROM BusinessCards WHERE Field = 'companyAddress';

-- ตรวจสอบข้อมูลที่อยู่สำนักงานใหญ่ของผู้ใช้ทั้งหมด
SELECT userId, companyAddress FROM BusinessCards;
