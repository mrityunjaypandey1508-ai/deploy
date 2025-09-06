'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import { 
  AlertTriangle, 
  ClipboardList, 
  Users
} from 'lucide-react'

export default function DashboardPage() {
	const { user, loading } = useAuth()
	const router = useRouter()

	// Set page title
	useEffect(() => {
		document.title = 'Dashboard – CivicSync'
	}, [])

	useEffect(() => {
		if (!loading && !user) {
			router.push('/auth/login')
		}
	}, [user, loading, router])



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="h-16"></div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}! Ready to improve your city?</span>
              <Link href="/profile" className="btn btn-secondary">
                Profile
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome Message */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            What would you like to do today?
          </h2>
          <p className="text-lg text-gray-600">
            Choose an action below to report, track, or manage civic issues.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/issues/report" className="card hover:shadow-md transition-shadow">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report an Issue</h3>
              <p className="text-gray-600">Submit a civic issue with photo and location.</p>
            </div>
          </Link>

          <Link href="/issues" className="card hover:shadow-md transition-shadow">
            <div className="text-center">
              <ClipboardList className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">My Issues</h3>
              <p className="text-gray-600">View and track the status of your submitted issues.</p>
            </div>
          </Link>

          <Link href="/community-issues" className="card hover:shadow-md transition-shadow">
            <div className="text-center">
              <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Issues</h3>
              <p className="text-gray-600">Browse issues reported by other citizens.</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  )
}