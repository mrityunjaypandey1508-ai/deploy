import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { SocketProvider } from '@/contexts/SocketContext'
import NotificationToast from '@/components/NotificationToast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CivicSync – Civic Issue Reporting & Resolution',
  description: 'Report civic issues, track resolutions, and build smarter communities with CivicSync',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <NotificationToast />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  )
}







