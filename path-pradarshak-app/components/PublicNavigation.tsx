'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Menu, 
  X
} from 'lucide-react'

export default function PublicNavigation() {
  const { user, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // If user is logged in or still loading auth, don't show public navigation
  if (user || loading) return null

  return (
    <nav
      className="fixed w-full z-[9999] shadow-lg"
      style={{ backgroundColor: "#111827" }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-white font-extrabold text-2xl hover:text-blue-400 transition"
            >
              CivicSync
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/"
              className="text-white font-bold hover:text-blue-400 transition"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-white font-bold hover:text-blue-400 transition"
            >
              About
            </Link>

            {/* Auth Buttons */}
            <Link href="/auth/login">
              <button className="bg-blue-900 hover:bg-blue-800 text-white font-semibold px-5 py-2 rounded-lg shadow-lg transition">
                Login
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="border border-white text-white hover:bg-white hover:text-[#111827] font-semibold px-5 py-2 rounded-lg transition">
                Sign Up
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-blue-400 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div
          className="md:hidden px-6 pt-4 pb-6 space-y-4 border-t border-blue-800 shadow-lg"
          style={{ backgroundColor: "#111827" }}
        >
          <Link
            href="/"
            className="block text-white font-bold hover:text-blue-400 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/about"
            className="block text-white font-bold hover:text-blue-400 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>

          <Link
            href="/auth/login"
            className="block bg-blue-900 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-800 transition font-semibold"
            onClick={() => setIsMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="block border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-[#111827] transition font-semibold"
            onClick={() => setIsMenuOpen(false)}
          >
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  )
}
