'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

interface SocketContextType {
  socket: Socket | null
  connected: boolean
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnected(false)
      }
      return
    }

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('accessToken')
      }
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setConnected(true)
      newSocket.emit('join-room', user._id)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    newSocket.on('partner-progress', (data) => {
      toast.success(`${data.partnerName} submitted their progress!`)
    })

    newSocket.on('notification', (notification) => {
      toast(notification.message, {
        icon: notification.type === 'progress_update' ? '📊' : '🔔'
      })
    })

    newSocket.on('connection-request', (data) => {
      toast.success(`${data.requesterName} wants to be your accountability partner!`)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user])

  const value: SocketContextType = {
    socket,
    connected
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}







