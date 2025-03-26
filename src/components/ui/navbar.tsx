"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

export const Navbar = () => {
  const pathname = usePathname()
  return (
    <nav className="w-[70%] mx-auto flex items-center pt-4">
      <div className="w-8 h-8">
        {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg> */}
      </div>
      <div className="w-full flex items-center justify-end gap-4 font-(family-name:--font-inter)">
        <Link href="/" className="relative group py-1">
          Chat
          <span className={`absolute bottom-0 left-0 h-0.5 bg-amber-800 transition-all duration-300 ${pathname === "/" ? "w-full" : "w-0 group-hover:w-full group-hover:bg-amber-400"}`} />
        </Link>
        <Link href="/infra" className="relative group py-1">
          Infra
          <span className={`absolute bottom-0 left-0 h-0.5 bg-amber-800 transition-all duration-300 ${pathname === "/infra" ? "w-full" : "w-0 group-hover:w-full group-hover:bg-amber-400"}`} />
        </Link>
        <Link href="/sobre" className="relative group py-1">
          Sobre
          <span className={`absolute bottom-0 left-0 h-0.5 bg-amber-800 transition-all duration-300 ${pathname === "/sobre" ? "w-full" : "w-0 group-hover:w-full group-hover:bg-amber-400"}`} />
        </Link>
      </div>
      <div className="w-8 h-8" />
    </nav>
  )
}

