'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HomepageNavigation() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav
      className="fixed w-full z-[9999] shadow-lg"
      style={{ backgroundColor: "#111827" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-white text-xl font-bold">
              CivicSync
            </Link>
          </div>

          {/* Spacer to push navigation items to the right */}
          <div className="flex-1"></div>

          {/* Desktop Navigation - positioned on the right */}
          <div className="hidden md:flex items-center space-x-8 mr-8">
            <Link href="/" className="text-white hover:text-gray-300 transition">
              Home
            </Link>
            <Link href="/about" className="text-white hover:text-gray-300 transition">
              About
            </Link>
            
            {user ? (
              <>
                <Link href="/dashboard" className="text-white hover:text-gray-300 transition">
                  Dashboard
                </Link>
                <Link href="/issues/report" className="text-white hover:text-gray-300 transition">
                  Report an Issue
                </Link>
                <Link href="/issues" className="text-white hover:text-gray-300 transition">
                  My Issues
                </Link>
                <Link href="/community-issues" className="text-white hover:text-gray-300 transition">
                  Community Issues
                </Link>
              </>
            ) : null}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition focus:outline-none"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span>{user.name}</span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login">
                  <button className="text-white hover:text-gray-300 transition px-4 py-2">
                    Login
                  </button>
                </Link>
                <Link href="/auth/signup">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300 transition"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 rounded-md mt-2">
              <Link
                href="/"
                className="block px-3 py-2 text-white hover:text-gray-300 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-white hover:text-gray-300 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-white hover:text-gray-300 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/issues/report"
                    className="block px-3 py-2 text-white hover:text-gray-300 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Report an Issue
                  </Link>
                  <Link
                    href="/issues"
                    className="block px-3 py-2 text-white hover:text-gray-300 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Issues
                  </Link>
                  <Link
                    href="/community-issues"
                    className="block px-3 py-2 text-white hover:text-gray-300 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Community Issues
                  </Link>
                  <div className="border-t border-gray-700 pt-2">
                    <Link
                      href="/profile"
                      className="block px-3 py-2 text-white hover:text-gray-300 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-3 py-2 text-white hover:text-gray-300 transition"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 transition"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-700 pt-2">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-white hover:text-gray-300 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="block px-3 py-2 text-white hover:text-gray-300 transition"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
