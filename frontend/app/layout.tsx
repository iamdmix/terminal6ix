import type React from "react"
import type { Metadata } from "next"
import { Chakra_Petch, IBM_Plex_Mono } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/components/auth-provider"
import "./globals.css"

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-chakra",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
})

export const metadata: Metadata = {
  title: "TerminalSix — CTF platform",
  description:
    "Host and compete in Capture The Flag events. Live leaderboards, real challenges, zero fluff.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${chakra.variable} ${plexMono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(33 19% 8%)",
              border: "1px solid hsl(35 18% 14%)",
              color: "hsl(40 36% 89%)",
              fontFamily: "var(--font-plex-mono)",
              fontSize: "13px",
              borderRadius: "2px",
            },
          }}
        />
      </body>
    </html>
  )
}
