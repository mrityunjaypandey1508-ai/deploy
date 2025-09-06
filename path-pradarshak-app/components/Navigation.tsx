'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Menu, 
  X, 
  User, 
  Search, 
  Users, 
  Target, 
  Calendar, 
  AlertTriangle,
  ClipboardList,
  Settings,
  LogOut,
  UserCheck,
  Home,
  FileText,
  BarChart3
} from 'lucide-react'

export default function Navigation() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  if (!user) return null

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'About', href: '/about', icon: FileText },
    { name: 'Report an Issue', href: '/issues/report', icon: AlertTriangle },
    { name: 'My Issues', href: '/issues', icon: ClipboardList },
    { name: 'Community Issues', href: '/community-issues', icon: Users },
    // Removed Partners, Agreements, Progress for CivicSync
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 w-full z-[9999] shadow-lg"
      style={{ backgroundColor: "#111827" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/dashboard" className="text-white text-xl font-bold">
              CivicSync
            </Link>
          </div>

          {/* Desktop Navigation - positioned in center */}
          <div className="hidden md:flex items-center space-x-8 mx-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu - positioned on the right (hidden on mobile) */}
          <div className="relative group hidden md:block">
              <button className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-medium">{user.name}</span>
                <User className="h-4 w-4" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link
                  href="/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>

          {/* Mobile menu button - right aligned */}
          <div className="md:hidden ml-auto">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-800 rounded-md mt-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 px-3 py-2 text-white hover:text-gray-300 hover:bg-gray-700 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              <div className="border-t border-gray-700 pt-4 mt-4">
                <div className="flex items-center space-x-2 px-3 py-2">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="text-white font-medium">{user.name}</span>
                </div>
                
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 px-3 py-2 text-white hover:text-gray-300 hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                
                <Link
                  href="/settings"
                  className="flex items-center space-x-2 px-3 py-2 text-white hover:text-gray-300 hover:bg-gray-700 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </Link>
                
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded-md"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}







