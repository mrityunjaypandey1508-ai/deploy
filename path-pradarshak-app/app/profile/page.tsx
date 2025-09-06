'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { User, Settings, Award, Calendar } from 'lucide-react'

interface UserProfile {
  _id: string
  name: string
  email: string
  phone?: string
  location?: string
  bio?: string
  skills: string[]
  goals: string[]
  interests: string[]
  avatar?: string
  isAdmin: boolean
  isVerified: boolean
  role?: 'citizen' | 'official' | 'admin'
  department?: { name?: string, code?: string }
  stats?: { reportsCount?: number, actionsTaken?: number, communityLevel?: number, points?: number }
  badges?: Array<{ name: string, tier?: 'bronze' | 'silver' | 'gold' | 'platinum', description?: string, earnedAt?: string }>
  createdAt: string
}

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    document.title = 'Profile – CivicSync'
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      const userProfile: UserProfile = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        skills: user.skills || [],
        goals: user.goals || [],
        interests: user.interests || [],
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        role: user.role,
        department: user.department,
        stats: user.stats,
        badges: user.badges,
        createdAt: user.createdAt || new Date().toISOString()
      }
      setProfile(userProfile)
    }
  }, [user])

  // Derive safe values BEFORE any early return so hooks order stays consistent
  const safeName = profile?.name || ''
  const safeEmail = profile?.email || ''
  const handle = useMemo(() => {
    const base = safeEmail.includes('@')
      ? safeEmail.split('@')[0]
      : (safeName || 'user').replace(/\s+/g, '_').toLowerCase()
    return `@${base}`
  }, [safeEmail, safeName])

  const level = profile?.stats?.communityLevel || 1
  const reports = profile?.stats?.reportsCount || 0
  const actions = profile?.stats?.actionsTaken || 0
  const points = profile?.stats?.points || 0
  const progressPct = Math.min(100, points % 100)
  const joinedYear = profile ? new Date(profile.createdAt).getFullYear() : new Date().getFullYear()

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="sticky top-0 bg-white border-b">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Profile</h1>
          <a href="/settings" className="text-gray-600 hover:text-gray-900" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="h-28 w-28 md:h-32 md:w-32 rounded-full border-4 border-orange-300" />
          ) : (
            <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-orange-200 border-4 border-orange-300 flex items-center justify-center">
              <span className="text-4xl md:text-5xl font-bold text-orange-900">{profile.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">{profile.name}</h2>
          <p className="text-gray-500">{handle}</p>
          <p className="text-gray-500 flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined {joinedYear}</p>
          <a href="/settings" className="mt-4 inline-flex px-8 py-3 rounded-full bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 min-w-[240px] justify-center">Edit Profile</a>
        </div>

        {/* Progress */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress</h3>
          <div className="bg-white rounded-2xl shadow-sm border p-5">
            <div className="flex items-center justify-between text-gray-700 mb-2">
              <span className="font-medium">Community Engagement</span>
              <span className="text-green-700 font-semibold">Level {level}</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-green-600" style={{ width: `${progressPct}%` }}></div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="rounded-xl bg-gray-50 p-5 text-center">
                <div className="text-3xl font-extrabold text-indigo-700">{reports}</div>
                <div className="text-gray-600">Reports</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-5 text-center">
                <div className="text-3xl font-extrabold text-indigo-700">{actions}</div>
                <div className="text-gray-600">Actions Taken</div>
              </div>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Rewards</h3>
          {profile.badges && profile.badges.length > 0 ? (
            <div className="space-y-3">
              {profile.badges.map((b, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white rounded-2xl border shadow-sm p-5">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-green-700 font-semibold">{(b.tier || 'bronze')} badge</div>
                    <div className="text-lg font-semibold text-gray-900">{b.name}</div>
                    {b.description && <div className="text-gray-600">{b.description}</div>}
                  </div>
                  <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
                    <Award className="h-7 w-7 text-orange-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-white rounded-2xl border shadow-sm p-5">
              <div>
                <div className="text-xs uppercase tracking-wide text-green-700 font-semibold">bronze badge</div>
                <div className="text-lg font-semibold text-gray-900">Active Citizen</div>
                <div className="text-gray-600">Participated in 5+ community actions</div>
              </div>
              <div className="w-16 h-16 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
                <Award className="h-7 w-7 text-orange-600" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


