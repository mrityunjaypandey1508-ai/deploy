'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface Notification {
  type: 'progress_update' | 'connection_request' | 'success' | 'error' | 'info'
  message: string
  data?: any
  timestamp: Date
}

export default function NotificationToast() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) return

    // Connect to Socket.io for real-time notifications
    const socket = (window as any).io?.() || null

    if (socket) {
      // Join user's room
      socket.emit('join-room', user._id)

      // Listen for notifications
      socket.on('notification', (notification: Notification) => {
        setNotifications(prev => [...prev, { ...notification, timestamp: new Date() }])
      })

      return () => {
        socket.off('notification')
        socket.disconnect()
      }
    }
  }, [user])

  const removeNotification = (index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'progress_update':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'connection_request':
        return <Info className="h-5 w-5 text-blue-600" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Info className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'progress_update':
        return 'bg-green-50 border-green-200'
      case 'connection_request':
        return 'bg-blue-50 border-blue-200'
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={index}
          className={`max-w-sm w-full ${getNotificationColor(notification.type)} border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {notification.message}
              </p>
              {notification.data && (
                <div className="mt-1 text-xs text-gray-600">
                  {notification.type === 'progress_update' && (
                    <span>
                      {notification.data.partnerName} submitted progress for {notification.data.status}
                    </span>
                  )}
                  {notification.type === 'connection_request' && (
                    <span>
                      {notification.data.name} wants to connect with you
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="ml-4 flex-shrink-0">
              <button
                onClick={() => removeNotification(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

