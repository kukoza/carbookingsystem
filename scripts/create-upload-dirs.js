const fs = require("fs")
const path = require("path")

// กำหนดโฟลเดอร์ที่ต้องการสร้าง
const uploadDirs = [path.join(process.cwd(), "public/uploads"), path.join(process.cwd(), "public/uploads/cars")]

// สร้างโฟลเดอร์ถ้ายังไม่มี
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`Created directory: ${dir}`)
  } else {
    console.log(`Directory already exists: ${dir}`)
  }
})

console.log("Upload directories setup completed.")

