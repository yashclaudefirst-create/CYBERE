'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [glitch, setGlitch] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true)
      setTimeout(() => setGlitch(false), 200)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="cyber-page flex min-h-screen flex-col items-center justify-center p-4">
      <div className="grid-bg" />
      <div className="relative z-10 text-center">
        <div className="mb-8 font-mono text-sm tracking-widest text-red-500">
          ERROR_CODE: 404 // RESOURCE_NOT_FOUND
        </div>
        <h1 className={`mb-4 font-display text-6xl font-bold tracking-tighter sm:text-8xl ${glitch ? 'skew-x-12 opacity-50' : ''}`}>
          LOST IN <span className="text-cyan-400">CYBERSPACE</span>
        </h1>
        <p className="mx-auto mb-12 max-w-md text-gray-400">
          The packet you're looking for was dropped by the firewall or never existed.
          The perimeter has been logged.
        </p>
        <Link
          href="/"
          className="inline-block border border-cyan-400 bg-transparent px-8 py-3 font-mono text-sm text-cyan-400 transition-colors hover:bg-cyan-400 hover:text-black"
        >
          {'>'} RETURN TO BASE
        </Link>
      </div>

      <style jsx>{`
        .font-display {
          font-family: var(--font-space-grotesk), sans-serif;
        }
      `}</style>
    </div>
  )
}
