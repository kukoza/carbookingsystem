"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Users, Car, Calendar, Home, Menu, X, LogOut, RotateCcw, History, Settings } from "lucide-react"

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // ใช้ router.push แทน window.location.href เพื่อให้ Next.js จัดการการนำทาง
        router.push("/login")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="bg-white shadow-md">
      {/* Mobile menu button */}
      <div className="md:hidden flex items-center justify-between p-4 border-b">
        <Link href="/admin/dashboard" className="flex items-center">
          <Car className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-lg font-bold">Nozomi Admin</span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar for desktop */}
      <div
        className={`${isOpen ? "block" : "hidden"} md:block md:w-64 md:min-h-screen bg-white border-r border-gray-200`}
      >
        <div className="p-4 border-b hidden md:block">
          <Link href="/admin/dashboard" className="flex items-center">
            <Car className="h-6 w-6 text-blue-600 mr-2" />
            <span className="text-lg font-bold">Nozomi Admin</span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          <Link
            href="/admin/dashboard"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive("/admin/dashboard") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Home className="h-5 w-5 mr-2" />
            หน้าหลัก
          </Link>
          <Link
            href="/admin/bookings"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive("/admin/bookings") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Calendar className="h-5 w-5 mr-2" />
            การจองรถ
          </Link>
          <Link
            href="/admin/cars"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive("/admin/cars") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Car className="h-5 w-5 mr-2" />
            จัดการรถ
          </Link>
          <Link
            href="/admin/car-types"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive("/admin/car-types") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Settings className="h-5 w-5 mr-2" />
            ประเภทรถ
          </Link>
          <Link
            href="/admin/users"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive("/admin/users") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Users className="h-5 w-5 mr-2" />
            จัดการผู้ใช้
          </Link>
          <Link
            href="/admin/return-car"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive("/admin/return-car") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <RotateCcw className="h-5 w-5 mr-2" />
            คืนรถ
          </Link>
          <Link
            href="/admin/booking-history"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              isActive("/admin/booking-history") ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <History className="h-5 w-5 mr-2" />
            ประวัติการจอง
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-2" />
            ออกจากระบบ
          </button>
        </nav>
      </div>
    </div>
  )
}
