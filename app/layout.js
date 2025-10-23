import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "next-themes"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner"
import AuthProvider from "@/components/AuthProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "DannNime - Watch Anime Online",
  description: "Stream the latest anime episodes with subtitles. Your ultimate anime destination.",
  keywords: "anime, watch anime, anime online, anime streaming, anime sub indo",
  openGraph: {
    title: "DannNime - Watch Anime Online",
    description: "Stream the latest anime episodes with subtitles.",
    type: "website",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
