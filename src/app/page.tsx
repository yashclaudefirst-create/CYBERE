'use client'

import { useEffect, useRef, useState } from 'react'

/* ============================================================
   CYBERSECURITY DOMAIN PRESENTATION
   Enhanced with 6 animated domain-related visualizations
   ============================================================ */

// ─── DNS Resolution Animation ───
function DnsAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => canvas.width / dpr
    const H = () => canvas.height / dpr

    const nodes = [
      { label: 'BROWSER', x: 0.1, y: 0.5, color: '#4FD8C4' },
      { label: 'DNS SERVER', x: 0.5, y: 0.5, color: '#E8A33D' },
      { label: 'WEB SERVER', x: 0.9, y: 0.5, color: '#4FD8C4' },
    ]

    type Packet = { progress: number; from: number; to: number; color: string; label: string; done: boolean }
    const packets: Packet[] = []
    let frame = 0
    const cycle = 300

    const addPacket = (from: number, to: number, color: string, label: string) => {
      packets.push({ progress: 0, from, to, color, label, done: false })
    }

    const drawNode = (n: typeof nodes[0]) => {
      const x = n.x * W()
      const y = n.y * H()
      const r = Math.max(1, Math.min(W(), H()) * 0.08)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(16,22,29,0.9)'
      ctx.fill()
      ctx.strokeStyle = n.color
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.fillStyle = n.color
      ctx.font = `600 ${Math.max(8, r * 0.38)}px "Space Grotesk", sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(n.label, x, y)
    }

    const drawLine = (n1: typeof nodes[0], n2: typeof nodes[0]) => {
      ctx.beginPath()
      ctx.moveTo(n1.x * W(), n1.y * H())
      ctx.lineTo(n2.x * W(), n2.y * H())
      ctx.strokeStyle = '#1A232C'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.stroke()
      ctx.setLineDash([])
    }

    const drawPacket = (p: Packet) => {
      const n1 = nodes[p.from]
      const n2 = nodes[p.to]
      const x = n1.x * W() + (n2.x * W() - n1.x * W()) * p.progress
      const y = n1.y * H() + (n2.y * H() - n1.y * H()) * p.progress - 18
      const r = Math.max(2, 4)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.fill()
      ctx.shadowColor = p.color
      ctx.shadowBlur = 12
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = p.color
      ctx.font = '500 10px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(p.label, x, y - 10)
    }

    const animate = () => {
      ctx.clearRect(0, 0, W(), H())
      frame = (frame + 1) % cycle

      drawLine(nodes[0], nodes[1])
      drawLine(nodes[1], nodes[2])

      if (frame === 10) addPacket(0, 1, '#4FD8C4', 'www.example.com')
      if (frame === 60) addPacket(1, 0, '#E8A33D', '93.184.216.34')
      if (frame === 110) addPacket(0, 2, '#4FD8C4', '→ connect')
      if (frame === 160) addPacket(2, 0, '#4FD8C4', '← 200 OK')

      for (const p of packets) {
        if (!p.done) {
          p.progress += 0.015
          if (p.progress >= 1) { p.done = true; p.progress = 1 }
        }
        if (p.progress > 0) drawPacket(p)
      }

      // Remove old packets
      if (frame === 0) packets.length = 0

      for (const n of nodes) drawNode(n)

      // Step labels
      const step = Math.floor(frame / 75)
      const labels = ['1. DNS Query', '2. DNS Response', '3. TCP Connect', '4. HTTP Response']
      ctx.fillStyle = '#7E8FA0'
      ctx.font = '500 11px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText(labels[Math.min(step, 3)] || '', W() / 2, H() - 16)

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="anim-box">
      <canvas ref={canvasRef} style={{ width: '100%', height: '180px', display: 'block' }} />
      <p className="anim-caption">Domain Name System resolves human-readable domains to IP addresses in milliseconds</p>
    </div>
  )
}

// ─── Phishing Domain Scanner ───
function PhishingScanner() {
  const [results, setResults] = useState<Array<{ domain: string; status: 'safe' | 'danger' | 'warn'; reason: string }>>([])
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  const domains = [
    { domain: 'google.com', status: 'safe' as const, reason: 'Valid SSL + known registrar' },
    { domain: 'g00gle-login.com', status: 'danger' as const, reason: 'Typosquatting + zero reputation' },
    { domain: 'github.com', status: 'safe' as const, reason: 'Valid SSL + long history' },
    { domain: 'amaz0n-secure.net', status: 'danger' as const, reason: 'Homoglyph attack detected' },
    { domain: 'microsoft.com', status: 'safe' as const, reason: 'EV certificate verified' },
    { domain: 'paypa1.com', status: 'danger' as const, reason: 'Character substitution (l→1)' },
    { domain: 'linkedin.com', status: 'safe' as const, reason: 'HSTS + DNSSEC enabled' },
    { domain: 'linked-in-security.com', status: 'warn' as const, reason: 'Lookalike domain, new registration' },
  ]

  useEffect(() => {
    let idx = 0
    const interval = setInterval(() => {
      if (idx < domains.length) {
        setResults(prev => [...prev, domains[idx]])
        idx++
      } else {
        idx = 0
        setResults([])
      }
    }, 1200)
    intervalRef.current = interval
    return () => { clearInterval(interval) }
  }, [])

  const statusIcon = (s: string) => {
    if (s === 'safe') return '✓'
    if (s === 'danger') return '✕'
    return '!'
  }
  const statusColor = (s: string) => {
    if (s === 'safe') return 'var(--cyan)'
    if (s === 'danger') return 'var(--red)'
    return 'var(--amber)'
  }

  return (
    <div className="anim-box">
      <div className="scanner-header">
        <span className="scanner-dot" style={{ background: 'var(--red)' }} />
        <span className="scanner-dot" style={{ background: 'var(--amber)' }} />
        <span className="scanner-dot" style={{ background: 'var(--cyan)' }} />
        <span style={{ marginLeft: '12px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted-2)' }}>domain-scanner v2.1</span>
      </div>
      <div className="scanner-list">
        {results.map((r, i) => (
          <div key={i} className="scanner-row" style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="scanner-status" style={{ color: statusColor(r.status) }}>{statusIcon(r.status)}</span>
            <span className="scanner-domain">{r.domain}</span>
            <span className="scanner-reason">{r.reason}</span>
          </div>
        ))}
        {results.length === 0 && (
          <div style={{ padding: '30px', textAlign: 'center', color: 'var(--muted-2)', fontFamily: 'var(--mono)', fontSize: '12px' }}>
            Scanning domains...
          </div>
        )}
      </div>
      <p className="anim-caption">Automated phishing detection flags typosquatted and lookalike domains in real-time</p>
    </div>
  )
}

// ─── Firewall Packet Filter ───
function FirewallFilter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => canvas.width / dpr
    const H = () => canvas.height / dpr

    type Dot = { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number; blocked: boolean; blockX: number }
    const dots: Dot[] = []
    let frame = 0

    const spawn = () => {
      const safe = Math.random() > 0.4
      dots.push({
        x: 0, y: Math.random() * H(),
        vx: 0.8 + Math.random() * 1.2, vy: (Math.random() - 0.5) * 0.5,
        r: 2 + Math.random() * 2,
        color: safe ? '#4FD8C4' : '#E5573D',
        alpha: 1,
        blocked: !safe,
        blockX: W() * 0.48 + (Math.random() - 0.5) * 10,
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, W(), H())
      frame++

      // Draw firewall wall
      const wallX = W() * 0.5
      ctx.beginPath()
      ctx.moveTo(wallX, 0)
      ctx.lineTo(wallX, H())
      ctx.strokeStyle = 'var(--amber)'
      ctx.lineWidth = 2
      ctx.setLineDash([8, 4])
      ctx.stroke()
      ctx.setLineDash([])

      // Firewall label
      ctx.fillStyle = '#E8A33D'
      ctx.font = '600 10px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('FIREWALL', wallX, 16)

      // Labels
      ctx.fillStyle = '#7E8FA0'
      ctx.font = '500 10px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('INCOMING', W() * 0.25, H() - 10)
      ctx.fillText('ALLOWED', W() * 0.75, H() - 10)

      if (frame % 12 === 0) spawn()
      if (frame % 18 === 0) spawn()

      for (let i = dots.length - 1; i >= 0; i--) {
        const d = dots[i]
        if (d.blocked && d.x >= d.blockX) {
          d.alpha -= 0.03
          if (d.alpha <= 0) { dots.splice(i, 1); continue }
          // Draw X
          ctx.beginPath()
          ctx.moveTo(d.blockX - 4, d.y - 4)
          ctx.lineTo(d.blockX + 4, d.y + 4)
          ctx.moveTo(d.blockX + 4, d.y - 4)
          ctx.lineTo(d.blockX - 4, d.y + 4)
          ctx.strokeStyle = `rgba(229,87,61,${d.alpha})`
          ctx.lineWidth = 1.5
          ctx.stroke()
        } else {
          d.x += d.vx
          d.y += d.vy
          if (d.x > W() + 10) { dots.splice(i, 1); continue }
        }

        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fillStyle = d.color.replace(')', `,${d.alpha})`).replace('rgb', 'rgba')
        if (d.color.startsWith('#')) {
          const r2 = parseInt(d.color.slice(1, 3), 16)
          const g = parseInt(d.color.slice(3, 5), 16)
          const b = parseInt(d.color.slice(5, 7), 16)
          ctx.fillStyle = `rgba(${r2},${g},${b},${d.alpha})`
        }
        ctx.fill()
      }

      // Counters
      const blocked = dots.filter(d => d.blocked).length
      const passed = dots.filter(d => !d.blocked).length
      ctx.fillStyle = '#E5573D'
      ctx.font = '500 10px "JetBrains Mono", monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`Blocked: ${blocked}`, 10, 16)
      ctx.fillStyle = '#4FD8C4'
      ctx.fillText(`Allowed: ${passed}`, 10, 30)

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="anim-box">
      <canvas ref={canvasRef} style={{ width: '100%', height: '180px', display: 'block' }} />
      <p className="anim-caption">Firewall inspects every packet — legitimate traffic passes, threats are dropped</p>
    </div>
  )
}

// ─── TLS Handshake Animation ───
function TlsHandshake() {
  const [step, setStep] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  const steps = [
    { from: 'CLIENT', to: 'SERVER', label: 'Client Hello', sub: 'Supported cipher suites & TLS version', color: 'var(--cyan)' },
    { from: 'SERVER', to: 'CLIENT', label: 'Server Hello', sub: 'Chosen cipher + server certificate', color: 'var(--amber)' },
    { from: 'CLIENT', to: 'SERVER', label: 'Certificate Verify', sub: 'Client validates server certificate chain', color: 'var(--cyan)' },
    { from: 'CLIENT', to: 'SERVER', label: 'Key Exchange', sub: 'Diffie-Hellman / ECDHE parameters sent', color: 'var(--cyan)' },
    { from: 'SERVER', to: 'CLIENT', label: 'Finished', sub: 'Session keys derived — encrypted tunnel ready', color: '#22C55E' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStep(s => (s + 1) % (steps.length + 2))
    }, 2000)
    intervalRef.current = interval
    return () => { clearInterval(interval) }
  }, [])

  return (
    <div className="anim-box">
      <div className="tls-visual">
        <div className="tls-node tls-client">
          <div className="tls-node-icon" style={{ borderColor: 'var(--cyan)' }}>C</div>
          <span>Client</span>
        </div>
        <div className="tls-middle">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`tls-step ${step > i ? 'tls-step-done' : ''} ${step === i ? 'tls-step-active' : ''}`}
              style={{ '--step-color': s.color } as React.CSSProperties}
            >
              <div className="tls-arrow">
                {s.from === 'CLIENT'
                  ? <span className="tls-arrow-right">→</span>
                  : <span className="tls-arrow-left">←</span>
                }
              </div>
              <div className="tls-step-label">{s.label}</div>
            </div>
          ))}
          {step >= steps.length && (
            <div className="tls-secure">
              <span className="tls-lock-icon">🔒</span>
              <span>Secure Connection Established</span>
            </div>
          )}
        </div>
        <div className="tls-node tls-server">
          <div className="tls-node-icon" style={{ borderColor: 'var(--amber)' }}>S</div>
          <span>Server</span>
        </div>
      </div>
      {step > 0 && step <= steps.length && (
        <div className="tls-detail">
          <span style={{ color: steps[step - 1]?.color || 'var(--muted)' }}>
            {steps[step - 1]?.label}
          </span>
          <span style={{ color: 'var(--muted)' }}>— {steps[step - 1]?.sub}</span>
        </div>
      )}
      <p className="anim-caption">TLS 1.3 handshake establishes an encrypted tunnel before any data is sent</p>
    </div>
  )
}

// ─── DDoS Attack Flood ───
function DdosFlood() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const W = () => canvas.width / dpr
    const H = () => canvas.height / dpr

    type Req = { x: number; y: number; vx: number; r: number; color: string; alpha: number }
    const reqs: Req[] = []
    let frame = 0
    let mitigating = false

    const spawn = (rate: number, danger: boolean) => {
      if (Math.random() > rate) return
      reqs.push({
        x: 0, y: 10 + Math.random() * (H() - 20),
        vx: 1 + Math.random() * 2,
        r: 1.5 + Math.random() * 1.5,
        color: danger ? '#E5573D' : '#4FD8C4',
        alpha: 1,
      })
    }

    const serverX = () => W() * 0.85

    const animate = () => {
      ctx.clearRect(0, 0, W(), H())
      frame++

      // Phases: normal (0-100), attack (100-250), mitigate (250-400), recovery (400-500), loop
      const phase = frame % 500
      mitigating = phase > 250 && phase < 450

      // Server box
      const sx = serverX()
      const sy = H() / 2
      const sw = Math.max(1, 40)
      const sh = Math.max(1, 60)
      ctx.fillStyle = mitigating ? 'rgba(34,197,94,0.15)' : (phase > 100 && phase < 250 ? 'rgba(229,87,61,0.15)' : 'rgba(79,216,196,0.1)')
      ctx.fillRect(sx - sw / 2, sy - sh / 2, sw, sh)
      ctx.strokeStyle = mitigating ? '#22C55E' : (phase > 100 && phase < 250 ? '#E5573D' : '#4FD8C4')
      ctx.lineWidth = 1
      ctx.strokeRect(sx - sw / 2, sy - sh / 2, sw, sh)
      ctx.fillStyle = ctx.strokeStyle
      ctx.font = '500 9px "JetBrains Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillText('SERVER', sx, sy + 3)

      // Mitigation shield
      if (mitigating) {
        const shieldX = W() * 0.55
        ctx.beginPath()
        ctx.moveTo(shieldX, 4)
        ctx.lineTo(shieldX, H() - 4)
        ctx.strokeStyle = 'rgba(34,197,94,0.4)'
        ctx.lineWidth = 3
        ctx.setLineDash([6, 4])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle = '#22C55E'
        ctx.font = '600 10px "JetBrains Mono", monospace'
        ctx.textAlign = 'center'
        ctx.fillText('DDoS MITIGATION', shieldX, 16)
      }

      // Spawn traffic
      if (phase < 100) {
        spawn(0.08, false)
      } else if (phase < 250) {
        spawn(0.5, true)
        spawn(0.1, false)
      } else if (phase < 450) {
        spawn(0.15, true)
        spawn(0.08, false)
      } else {
        spawn(0.06, false)
      }

      for (let i = reqs.length - 1; i >= 0; i--) {
        const r = reqs[i]
        r.x += r.vx

        // Check if blocked by mitigation
        if (mitigating && r.color === '#E5573D' && r.x > W() * 0.53 && r.x < W() * 0.57) {
          r.alpha -= 0.08
          if (r.alpha <= 0) { reqs.splice(i, 1); continue }
        } else if (r.x > W() + 5) {
          reqs.splice(i, 1); continue
        }

        const hex = r.color
        const rr = parseInt(hex.slice(1, 3), 16)
        const gg = parseInt(hex.slice(3, 5), 16)
        const bb = parseInt(hex.slice(5, 7), 16)
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rr},${gg},${bb},${r.alpha})`
        ctx.fill()
      }

      // Status label
      let status = 'Normal Traffic'
      let statusColor = '#4FD8C4'
      if (phase >= 100 && phase < 250) { status = '⚠ DDoS Attack Detected'; statusColor = '#E5573D' }
      else if (phase >= 250 && phase < 450) { status = 'Mitigation Active'; statusColor = '#22C55E' }
      else if (phase >= 450) { status = 'Recovery'; statusColor = '#E8A33D' }

      ctx.fillStyle = statusColor
      ctx.font = '600 11px "JetBrains Mono", monospace'
      ctx.textAlign = 'left'
      ctx.fillText(status, 10, 16)

      // Traffic counter
      ctx.fillStyle = '#7E8FA0'
      ctx.font = '500 10px "JetBrains Mono", monospace'
      ctx.fillText(`Active requests: ${reqs.length}`, 10, 30)

      animRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className="anim-box">
      <canvas ref={canvasRef} style={{ width: '100%', height: '180px', display: 'block' }} />
      <p className="anim-caption">DDoS mitigation detects attack patterns and scrubs malicious traffic before it reaches the server</p>
    </div>
  )
}

// ─── Typosquatting Detector ───
function Typosquatting() {
  const [activeIdx, setActiveIdx] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  const examples = [
    {
      real: 'google.com',
      fake: 'g00gle.com',
      attack: 'Zero substitution (o → 0)',
      desc: 'Attackers register domains with visually similar characters to trick users.',
    },
    {
      real: 'facebook.com',
      fake: 'faceb00k-login.com',
      attack: 'Homoglyph + keyword injection',
      desc: 'Adding "-login" creates urgency while homoglyphs mask the fake domain.',
    },
    {
      real: 'paypal.com',
      fake: 'paypa1.com',
      attack: 'Character substitution (l → 1)',
      desc: 'Lowercase "L" and "1" look nearly identical in many fonts and URLs.',
    },
    {
      real: 'amazon.com',
      fake: 'arnazon.com',
      attack: 'Adjacent key swap (m → rn)',
      desc: 'The letters "rn" together closely resemble "m" in domain names.',
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx(i => (i + 1) % examples.length)
    }, 3500)
    intervalRef.current = interval
    return () => { clearInterval(interval) }
  }, [])

  const ex = examples[activeIdx]
  const getDiff = (real: string, fake: string) => {
    const diffs: { char: string; isDiff: boolean; idx: number }[] = []
    for (let i = 0; i < Math.max(real.length, fake.length); i++) {
      const rc = real[i] || ''
      const fc = fake[i] || ''
      diffs.push({ char: fc, isDiff: rc !== fc, idx: i })
    }
    return diffs
  }
  const diffs = getDiff(ex.real, ex.fake)

  return (
    <div className="anim-box">
      <div className="typosquat-container">
        <div className="typosquat-row">
          <span className="typosquat-label">LEGITIMATE</span>
          <span className="typosquat-domain typosquat-safe">{ex.real}</span>
        </div>
        <div className="typosquat-row">
          <span className="typosquat-label">LOOKALIKE</span>
          <span className="typosquat-domain typosquat-fake">
            {diffs.map((d, i) => (
              <span key={i} className={d.isDiff ? 'typosquat-highlight' : ''}>{d.char}</span>
            ))}
          </span>
        </div>
        <div className="typosquat-attack">{ex.attack}</div>
        <p className="typosquat-desc">{ex.desc}</p>
      </div>
      <div className="typosquat-dots">
        {examples.map((_, i) => (
          <span
            key={i}
            className={`typosquat-dot ${i === activeIdx ? 'typosquat-dot-active' : ''}`}
          />
        ))}
      </div>
      <p className="anim-caption">Typosquatting exploits visual similarity between legitimate and malicious domain names</p>
    </div>
  )
}

// ─── Password Strength Cracker ───
function PasswordCracker() {
  const [running, setRunning] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [cracked, setCracked] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  const passwords = [
    { pass: '123456', strength: 'weak', time: 'Instant' },
    { pass: 'password1', strength: 'weak', time: '< 1 second' },
    { pass: 'Tr0ub4dor&3', strength: 'medium', time: '~5 minutes' },
    { pass: ' correct horse battery staple ', strength: 'strong', time: 'Centuries' },
  ]
  const [currentPw, setCurrentPw] = useState(0)

  const startCrack = () => {
    setRunning(true)
    setCracked(false)
    setAttempts(0)
    let count = 0
    const pw = passwords[currentPw]
    const maxAttempts = pw.strength === 'weak' ? 800 : pw.strength === 'medium' ? 5000 : 30000

    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 50) + 10
      setAttempts(count)
      if (count >= maxAttempts) {
        clearInterval(interval)
        setCracked(true)
        setRunning(false)
      }
    }, 50)
    intervalRef.current = interval
  }

  const nextPassword = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    setCracked(false)
    setAttempts(0)
    setCurrentPw(p => (p + 1) % passwords.length)
  }

  const pw = passwords[currentPw]
  const strengthColor = pw.strength === 'weak' ? 'var(--red)' : pw.strength === 'medium' ? 'var(--amber)' : 'var(--cyan)'

  return (
    <div className="anim-box">
      <div className="cracker-container">
        <div className="cracker-target">
          <span className="cracker-label">TARGET</span>
          <span className="cracker-password" style={{ letterSpacing: '2px' }}>{pw.pass}</span>
          <span className="cracker-strength" style={{ color: strengthColor }}>{pw.strength.toUpperCase()}</span>
        </div>
        <div className="cracker-progress">
          <div className="cracker-bar">
            <div
              className="cracker-bar-fill"
              style={{
                width: cracked ? '100%' : running ? `${Math.min(95, (attempts / 30000) * 100)}%` : '0%',
                background: cracked ? 'var(--red)' : strengthColor,
              }}
            />
          </div>
          <div className="cracker-stats">
            <span>Attempts: <b>{attempts.toLocaleString()}</b></span>
            <span>{cracked ? 'CRACKED' : running ? 'Cracking...' : 'Ready'}</span>
          </div>
        </div>
        <div className="cracker-actions">
          <button className="cracker-btn" onClick={startCrack} disabled={running}>
            {running ? 'Cracking...' : cracked ? 'Crack Again' : 'Start Brute Force'}
          </button>
          <button className="cracker-btn cracker-btn-secondary" onClick={nextPassword}>
            Next Password
          </button>
        </div>
        <div className="cracker-note">Estimated real-world time: <b>{pw.time}</b></div>
      </div>
      <p className="anim-caption">Weak passwords fall in seconds — length and entropy are the only real defenses</p>
    </div>
  )
}

// ─── Main Page ───
export default function Home() {
  useEffect(() => {
    // Scroll reveal
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible')
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el))

    // Active nav on scroll
    const sectionIds = ['software', 'network', 'cyber', 'framework']
    const sectionEls = sectionIds.map((id) => document.getElementById(id))
    const navLinks = document.querySelectorAll('.rail-nav a')

    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((l) => l.classList.remove('active'))
            const match = document.querySelector(`.rail-nav a[href="#${entry.target.id}"]`)
            if (match) match.classList.add('active')
          }
        })
      },
      { rootMargin: '-40% 0px -50% 0px' }
    )
    sectionEls.forEach((s) => { if (s) navObserver.observe(s) })

    // Rings interaction
    const ringInfo = document.getElementById('ringInfo')
    const ringData: Record<string, { title: string; text: string }> = {
      r1: { title: 'Network Perimeter', text: 'Firewalls, IDS/IPS, segmentation and TLS decide what ever reaches the application in the first place.' },
      r2: { title: 'Application Layer', text: 'Secure coding, input validation and dependency hygiene stop what gets through the perimeter from becoming an exploit.' },
      r3: { title: 'Governance & Response', text: 'Risk management, awareness and incident response are what limit the damage once both outer layers are beaten.' },
    }
    ;['r1', 'r2', 'r3'].forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      el.addEventListener('mouseenter', () => {
        const d = ringData[id]
        if (ringInfo) {
          ringInfo.innerHTML = `<b>${d.title}</b>${d.text}`
          ringInfo.style.borderColor = getComputedStyle(el).stroke
        }
        el.setAttribute('stroke-width', '3')
      })
      el.addEventListener('mouseleave', () => {
        el.setAttribute('stroke-width', '1.5')
      })
    })

    return () => { observer.disconnect(); navObserver.disconnect() }
  }, [])

  return (
      <div className="cyber-page" suppressHydrationWarning>
        <div className="grid-bg" />

        {/* NAV */}
        <nav className="rail">
          <div className="rail-top">
            <div className="rail-logo"><span>DD</span></div>
          </div>
          <div className="rail-nav" id="railNav">
            <a href="#software">Software</a>
            <a href="#network">Network</a>
            <a href="#cyber">Cybersecurity</a>
            <a href="#framework">Framework</a>
          </div>
          <div className="rail-bottom">EST. PERIMETER · CORE</div>
        </nav>

        <div className="content">
          {/* HERO */}
          <header className="hero">
            <div className="hero-top-label">
              <span><b>3</b> domains</span>
              <span><b>1</b> attack surface</span>
              <span>briefing / rev. 2026</span>
            </div>
            <h1 className="hero-title">
              Defense in depth,<br />
              <span className="l2">not defense in one place.</span>
            </h1>
            <p className="hero-sub">
              A working map of the field — where software security, network security, and cybersecurity
              governance meet, where they diverge, and why an attacker only needs one gap while
              defenders have to close all of them.
            </p>
            <div className="hero-domains fade-in">
              <div className="hero-domain">
                <div className="num">01</div>
                <div className="name">Software Security</div>
                <div className="tag">the application layer</div>
              </div>
              <div className="hero-domain">
                <div className="num">02</div>
                <div className="name">Network Security</div>
                <div className="tag">the perimeter &amp; the wire</div>
              </div>
              <div className="hero-domain">
                <div className="num">03</div>
                <div className="name">Cybersecurity</div>
                <div className="tag">people, policy, response</div>
              </div>
            </div>
          </header>

          {/* SOFTWARE SECURITY */}
          <section id="software">
            <div className="domain-head fade-in">
              <div>
                <div className="eyebrow">01 — Application Layer</div>
                <h2>Software security is what happens<br />before code ships.</h2>
              </div>
              <p className="lede">
                Vulnerabilities written into an application are cheapest to fix at the keyboard
                and most expensive to fix in production. Software security is the discipline of
                catching them early — in design, in code, and in test.
              </p>
            </div>
            <div className="card-grid fade-in">
              <div className="card">
                <div className="idx">{'// SECURE SDLC'}</div>
                <h3>Build security in, not on</h3>
                <p>Threat modeling at design time, secure coding standards during build, and static/dynamic analysis before release — security treated as a requirement, not a final review.</p>
                <div className="threat">Skips: late-stage rewrites</div>
              </div>
              <div className="card">
                <div className="idx">{'// INPUT VALIDATION'}</div>
                <h3>Never trust the input</h3>
                <p>Every field, parameter, header, and file upload is a potential injection point. Validate, sanitize, and parameterize — don't concatenate untrusted data into commands or queries.</p>
                <div className="threat">Guards against: SQLi, XSS, command injection</div>
              </div>
              <div className="card">
                <div className="idx">{'// AUTH & SESSION'}</div>
                <h3>Identity has to hold up</h3>
                <p>Password hashing with salt, multi-factor authentication, short-lived tokens, and session invalidation on logout or privilege change.</p>
                <div className="threat">Guards against: credential stuffing, session hijack</div>
              </div>
              <div className="card">
                <div className="idx">{'// DEPENDENCY HYGIENE'}</div>
                <h3>Your code is the smaller half</h3>
                <p>Most applications are mostly third-party libraries. Software composition analysis and prompt patching close the gap between a disclosed CVE and an exploited one.</p>
                <div className="threat">Guards against: supply-chain compromise</div>
              </div>
              <div className="card">
                <div className="idx">{'// CODE REVIEW'}</div>
                <h3>A second set of eyes, on purpose</h3>
                <p>Peer review and automated static analysis (SAST) catch logic flaws and unsafe patterns that unit tests are not designed to find.</p>
                <div className="threat">Guards against: broken access control, logic flaws</div>
              </div>
              <div className="card">
                <div className="idx">{'// DATA HANDLING'}</div>
                <h3>Encrypt like it will leak</h3>
                <p>Encryption in transit and at rest, least-privilege data access, and no secrets in source control — designed for the breach you hope never happens.</p>
                <div className="threat">Guards against: data exposure, key leakage</div>
              </div>
            </div>
          </section>

          {/* ANIM: DNS RESOLUTION */}
          <div className="anim-section fade-in">
            <div className="anim-header">
              <span className="anim-tag">LIVE ANIMATION</span>
              <h2 className="anim-title">How DNS Resolution Works</h2>
            </div>
            <p className="anim-subtitle">Every time you visit a website, your browser performs a DNS lookup to translate the domain name into an IP address. This happens in milliseconds, typically through multiple resolver steps.</p>
            <DnsAnimation />
          </div>

          {/* ANIM: PHISHING SCANNER */}
          <div className="anim-section fade-in">
            <div className="anim-header">
              <span className="anim-tag">LIVE ANIMATION</span>
              <h2 className="anim-title">Phishing Domain Scanner</h2>
            </div>
            <p className="anim-subtitle">Automated tools continuously scan newly registered domains and compare them against known brands, flagging typosquatted, homoglyph, and lookalike domains before they can be used in attacks.</p>
            <PhishingScanner />
          </div>

          {/* NETWORK SECURITY */}
          <section id="network">
            <div className="domain-head fade-in">
              <div>
                <div className="eyebrow amber">02 — Perimeter &amp; Transit</div>
                <h2>Network security is what happens<br />between systems.</h2>
              </div>
              <p className="lede">
                Even flawless applications are exposed if the network around them isn't controlled. This layer decides who can reach what, and what happens to traffic while it's in motion.
              </p>
            </div>
            <div className="layer-strip fade-in">
              <div className="layer-row"><div className="tag">FILTER</div><h4>Firewalls &amp; segmentation</h4><p>Rule-based traffic control at the perimeter, plus internal segmentation so a breach in one zone can't move freely to the next.</p></div>
              <div className="layer-row"><div className="tag">DETECT</div><h4>IDS / IPS</h4><p>Intrusion detection watches for known attack signatures and anomalies; intrusion prevention acts on them in real time, not just after the fact.</p></div>
              <div className="layer-row"><div className="tag">ENCRYPT</div><h4>TLS &amp; VPN tunnels</h4><p>Transport-layer encryption protects data in motion; VPNs extend a trusted network boundary across untrusted links.</p></div>
              <div className="layer-row"><div className="tag">VERIFY</div><h4>Zero trust access</h4><p>No connection is trusted by default, inside or outside the perimeter — every request is authenticated and authorized on its own merits.</p></div>
              <div className="layer-row"><div className="tag">RESOLVE</div><h4>DNS &amp; endpoint hardening</h4><p>DNS filtering blocks known-malicious domains before a connection is even made; endpoint controls limit what a compromised device can reach.</p></div>
              <div className="layer-row"><div className="tag">ABSORB</div><h4>DDoS mitigation</h4><p>Rate limiting, traffic scrubbing, and redundant capacity keep a flood of requests from becoming an outage.</p></div>
            </div>
          </section>

          {/* ANIM: FIREWALL FILTER */}
          <div className="anim-section fade-in">
            <div className="anim-header">
              <span className="anim-tag">LIVE ANIMATION</span>
              <h2 className="anim-title">Firewall Packet Filtering</h2>
            </div>
            <p className="anim-subtitle">A firewall sits between trusted and untrusted networks, inspecting every incoming packet against rule sets. Legitimate traffic passes through; malicious or unauthorized packets are dropped instantly.</p>
            <FirewallFilter />
          </div>

          {/* ANIM: TLS HANDSHAKE */}
          <div className="anim-section fade-in">
            <div className="anim-header">
              <span className="anim-tag">LIVE ANIMATION</span>
              <h2 className="anim-title">TLS Handshake Visualizer</h2>
            </div>
            <p className="anim-subtitle">Before any sensitive data is sent, client and server perform a multi-step handshake to verify identity, negotiate encryption, and derive shared session keys — all in under a second.</p>
            <TlsHandshake />
          </div>

          {/* CYBERSECURITY / GOVERNANCE */}
          <section id="cyber">
            <div className="domain-head fade-in">
              <div>
                <div className="eyebrow">03 — Governance &amp; Response</div>
                <h2>Cybersecurity is what happens<br />around the technology.</h2>
              </div>
              <p className="lede">
                The broadest domain: the policies, people, and processes that decide what "secure" means for an organization, and what happens the moment something goes wrong anyway.
              </p>
            </div>
            <div className="card-grid fade-in">
              <div className="card"><div className="idx">{'// CIA TRIAD'}</div><h3>Confidentiality, integrity, availability</h3><p>The three properties nearly every control ultimately serves — keeping data private, unaltered, and accessible to the people who are meant to have it.</p></div>
              <div className="card"><div className="idx">{'// RISK MANAGEMENT'}</div><h3>Not every risk gets fixed the same way</h3><p>Identify, assess, and prioritize risk, then accept, mitigate, transfer, or avoid it — security budgets are finite, so risk decides where they go.</p></div>
              <div className="card"><div className="idx">{'// THREAT INTELLIGENCE'}</div><h3>Know who's likely knocking</h3><p>Tracking active threat actors, campaigns, and techniques turns generic defense into defense tuned for a specific, realistic adversary.</p></div>
              <div className="card"><div className="idx">{'// INCIDENT RESPONSE'}</div><h3>The plan you write before you need it</h3><p>Detection, containment, eradication, recovery, and a post-incident review — rehearsed, not improvised, because improvising under pressure is where mistakes happen.</p></div>
              <div className="card"><div className="idx">{'// HUMAN LAYER'}</div><h3>The most-targeted attack surface</h3><p>Phishing and social engineering bypass technical controls entirely by targeting judgment instead — security awareness is a control, not an afterthought.</p></div>
              <div className="card"><div className="idx">{'// COMPLIANCE'}</div><h3>Frameworks as a shared baseline</h3><p>ISO 27001, NIST CSF, and SOC 2 don't guarantee security, but they give organizations a common, auditable language for proving it.</p></div>
            </div>
          </section>

          {/* ANIM: DDOS FLOOD */}
          <div className="anim-section fade-in">
            <div className="anim-header">
              <span className="anim-tag">LIVE ANIMATION</span>
              <h2 className="anim-title">DDoS Attack &amp; Mitigation</h2>
            </div>
            <p className="anim-subtitle">Distributed Denial of Service attacks flood a target with traffic from thousands of sources. Modern mitigation systems detect the attack pattern and scrub malicious traffic in real-time.</p>
            <DdosFlood />
          </div>

          {/* ANIM: TYPOSQUATTING */}
          <div className="anim-section fade-in">
            <div className="anim-header">
              <span className="anim-tag">LIVE ANIMATION</span>
              <h2 className="anim-title">Typosquatting Domain Detector</h2>
            </div>
            <p className="anim-subtitle">Attackers register domains that look nearly identical to legitimate ones, exploiting character substitutions, adjacent key swaps, and added keywords to trick users.</p>
            <Typosquatting />
          </div>

          {/* ANIM: PASSWORD CRACKER */}
          <div className="anim-section fade-in">
            <div className="anim-header">
              <span className="anim-tag">INTERACTIVE DEMO</span>
              <h2 className="anim-title">Password Strength Visualizer</h2>
            </div>
            <p className="anim-subtitle">See how quickly different passwords fall to brute-force attacks. Weak passwords crack in under a second, while strong passphrases can withstand centuries of automated guessing.</p>
            <PasswordCracker />
          </div>

          {/* RINGS */}
          <section id="framework" className="rings-section">
            <div className="rings-visual fade-in">
              <svg id="ringsSvg" width="420" height="420" viewBox="0 0 420 420">
                <circle cx="210" cy="210" r="190" fill="none" stroke="#243040" strokeWidth="1" data-info="0" />
                <circle id="r1" cx="210" cy="210" r="150" fill="none" stroke="#E8A33D" strokeWidth="1.5" strokeDasharray="4 6" data-info="1" style={{ cursor: 'pointer' }} />
                <circle id="r2" cx="210" cy="210" r="105" fill="none" stroke="#4FD8C4" strokeWidth="1.5" strokeDasharray="4 6" data-info="2" style={{ cursor: 'pointer' }} />
                <circle id="r3" cx="210" cy="210" r="62" fill="none" stroke="#E7EDF2" strokeWidth="1.5" data-info="3" style={{ cursor: 'pointer' }} />
                <circle cx="210" cy="210" r="6" fill="#E5573D" />
                <text x="210" y="215" textAnchor="middle" className="ring-label" fill="#7E8FA0" fontSize="10">DATA</text>
                <text x="210" y="65" textAnchor="middle" className="ring-label">NETWORK PERIMETER</text>
                <text x="210" y="110" textAnchor="middle" className="ring-label">APPLICATION</text>
                <text x="210" y="153" textAnchor="middle" className="ring-label">GOVERNANCE</text>
              </svg>
            </div>
            <div className="rings-text fade-in">
              <div className="eyebrow">Signature model</div>
              <h2 style={{ fontSize: 'clamp(28px,3.4vw,42px)', maxWidth: '480px' }}>One breach rarely reaches the core in a single step.</h2>
              <p style={{ color: 'var(--muted)', maxWidth: '460px', marginTop: '16px', fontSize: '15px' }}>
                Layer the three domains and an attacker has to defeat each one to reach what actually matters. Hover a ring to see what stands on it.
              </p>
              <div className="ring-info" id="ringInfo">
                <b>Hover a ring →</b>
                The outer ring is the network perimeter, the middle ring is the application layer, and the inner ring is governance and response — each one assumes the others will eventually fail.
              </div>
            </div>
          </section>

          {/* MATRIX */}
          <section id="matrix">
            <div className="domain-head fade-in">
              <div>
                <div className="eyebrow amber">Field reference</div>
                <h2>Same goal, different terrain.</h2>
              </div>
            </div>
            <div className="fade-in" style={{ overflowX: 'auto' }}>
              <table className="matrix">
                <thead>
                  <tr><th>Domain</th><th>Protects</th><th>Primary tools</th><th>Typical failure</th></tr>
                </thead>
                <tbody>
                  <tr><td className="domain">Software Security</td><td>Code, logic, data handling</td><td><span className="pill">SAST/DAST</span><span className="pill">code review</span><span className="pill">SCA</span></td><td>Injection, broken access control</td></tr>
                  <tr><td className="domain">Network Security</td><td>Traffic, connectivity, transit</td><td><span className="pill">firewall</span><span className="pill">IDS/IPS</span><span className="pill">TLS</span><span className="pill">VPN</span></td><td>Misconfigured perimeter, lateral movement</td></tr>
                  <tr><td className="domain">Cybersecurity</td><td>People, process, organization</td><td><span className="pill">IR plan</span><span className="pill">risk register</span><span className="pill">training</span></td><td>Untested response, social engineering</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* CLOSING */}
          <section className="closing">
            <div className="eyebrow fade-in">Closing brief</div>
            <h2 className="fade-in">Security is a system property, not a single feature.</h2>
            <p className="lede fade-in">
              No firewall compensates for injectable code, and no clean codebase survives a flat, unmonitored network forever. The three domains are read separately here because they're built separately — but they only hold up together.
            </p>
            <div className="principles fade-in">
              <div className="principle"><div className="p-num">PRINCIPLE</div><div className="p-name">Least privilege, everywhere</div></div>
              <div className="principle"><div className="p-num">PRINCIPLE</div><div className="p-name">Assume breach, plan recovery</div></div>
              <div className="principle"><div className="p-num">PRINCIPLE</div><div className="p-name">Validate at every boundary</div></div>
              <div className="principle"><div className="p-num">PRINCIPLE</div><div className="p-name">Patch fast, monitor always</div></div>
            </div>
          </section>

          <footer className="page-footer">
            <span>DEFENSE IN DEPTH — SECURITY BRIEFING</span>
            <span>SOFTWARE · NETWORK · CYBERSECURITY</span>
          </footer>
        </div>
      </div>
  )
}