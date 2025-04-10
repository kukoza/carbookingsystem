const mysql = require("mysql2/promise")
require("dotenv").config()

async function addMissingColumns() {
  let connection

  try {
    console.log("Adding missing columns to Bookings table...")

    // เชื่อมต่อกับ MySQL
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "carbookingsystem",
    })

    console.log("Connected to MySQL server")

    // เพิ่มคอลัมน์ที่จำเป็น
    await connection.query(`
      ALTER TABLE Bookings ADD COLUMN IF NOT EXISTS mileageDiff INT NULL;
      ALTER TABLE Bookings ADD COLUMN IF NOT EXISTS fuelLevel VARCHAR(20) NULL;
      ALTER TABLE Bookings ADD COLUMN IF NOT EXISTS fuelCost DECIMAL(10,2) NULL;
    `)

    console.log("Missing columns added successfully")
  } catch (error) {
    console.error("Error adding missing columns:", error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("Connection closed")
    }
  }
}

addMissingColumns()

