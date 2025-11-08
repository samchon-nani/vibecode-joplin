import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BillHarmony - Bringing Clarity to Care Costs',
  description: 'Compare hospital prices, check charity eligibility, and find financial assistance programs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div id="modal-root"></div>
        {children}
      </body>
    </html>
  )
}

