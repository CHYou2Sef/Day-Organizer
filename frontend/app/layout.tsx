import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'Day Organizer - Modern Productivity',
    description: 'A premium task management application',
}

// Comments: Root layout component that wraps every page in the application
export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            {/* Comments: Apply Inter font and standard layout structure */}
            <body className={inter.className}>{children}</body>
        </html>
    )
}
