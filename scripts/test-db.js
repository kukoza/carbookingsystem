const mysql = require("mysql2/promise")
require("dotenv").config()

async function testDatabaseConnection() {
  let connection

  try {
    console.log("Testing database connection...")
    console.log("DB_HOST:", process.env.DB_HOST)
    console.log("DB_USER:", process.env.DB_USER)
    console.log("DB_NAME:", process.env.DB_NAME)

    // กำหนดค่าการเชื่อมต่อ
    const dbConfig = {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "carbookingsystem",
    }

    // ทดสอบการเชื่อมต่อ
    connection = await mysql.createConnection(dbConfig)
    console.log("Connection established")

    // ทดสอบการ query
    const [rows] = await connection.execute("SELECT 1 as test")
    console.log("Query executed successfully:", rows)

    // ทดสอบการ query ตาราง Users
    try {
      const [users] = await connection.execute("SELECT COUNT(*) as count FROM Users")
      console.log(`Number of users in the database: ${users[0].count}`)
    } catch (error) {
      console.error("Error querying Users table:", error)
      console.log("Table 'Users' might not exist. Try running 'npm run setup-db' to create it.")
    }

    console.log("Database connection test completed successfully")
  } catch (error) {
    console.error("Database connection test failed:", error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("Connection closed")
    }
  }
}

testDatabaseConnection()

