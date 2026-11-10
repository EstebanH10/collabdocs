import './globals.css'

export const metadata = {
  title: 'CollabDocs',
  description: 'A collaborative document editor',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  )
}