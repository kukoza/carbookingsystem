"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, User, Car, Calendar, Home } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-mobile"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function UserNavbar() {
  const router = useRouter()
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ดึงข้อมูลผู้ใช้
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch("/api/auth/me")
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }
        const userData = await response.json()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user data:", error)
        // หากไม่สามารถดึงข้อมูลผู้ใช้ได้ ให้นำทางกลับไปยังหน้าเข้าสู่ระบบ
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handleLogout = () => {
    // ใช้ window.location.href เพื่อนำทางไปยังหน้าเข้าสู่ระบบโดยตรง
    window.location.href = "/login"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/user/dashboard" className="mr-6 flex items-center space-x-2">
            <Car className="h-6 w-6" />
            <span className="font-bold">ระบบจองรถ</span>
          </Link>
          {!isMobile && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/user/dashboard" className="transition-colors hover:text-foreground/80">
                หน้าหลัก
              </Link>
              <Link href="/user/book" className="transition-colors hover:text-foreground/80">
                จองรถ
              </Link>
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end">
          {isMobile ? (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">เมนู</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="grid gap-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-secondary">
                      <img
                        src={user?.avatar || "/placeholder.svg?height=40&width=40"}
                        alt={user?.name || "User"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder.svg?height=40&width=40"
                        }}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{user?.name || "ผู้ใช้"}</div>
                      <div className="text-xs text-muted-foreground">{user?.department || "แผนก"}</div>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Link
                      href="/user/dashboard"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <Home className="h-4 w-4" />
                      หน้าหลัก
                    </Link>
                    <Link
                      href="/user/book"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <Calendar className="h-4 w-4" />
                      จองรถ
                    </Link>
                    <Link
                      href="/user/profile"
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      โปรไฟล์
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Link href="/user/profile" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-secondary">
                    <img
                      src={user?.avatar || "/placeholder.svg?height=32&width=32"}
                      alt={user?.name || "User"}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=32&width=32"
                      }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user?.name || "ผู้ใช้"}</div>
                    <div className="text-xs text-muted-foreground">{user?.department || "แผนก"}</div>
                  </div>
                </Link>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">ออกจากระบบ</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

