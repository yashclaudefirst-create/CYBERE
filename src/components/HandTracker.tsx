'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import Script from 'next/script'

const HandTracker: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isEnabled, setIsEnabled] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [isPinching, setIsPinching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [scriptsLoaded, setScriptsLoaded] = useState(0)

  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)

  const isPinchingRef = useRef(false)

  const onResults = useCallback((results: any) => {
    if (!canvasRef.current) return
    const canvasCtx = canvasRef.current.getContext('2d')
    if (!canvasCtx) return

    canvasCtx.save()
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        if (window.drawConnectors && window.HAND_CONNECTIONS) {
          window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS, { color: '#4FD8C4', lineWidth: 5 })
        }
        if (window.drawLandmarks) {
          window.drawLandmarks(canvasCtx, landmarks, { color: '#E5573D', lineWidth: 2, radius: 3 })
        }

        // Use index finger tip (landmark 8) for cursor position
        const indexFingerTip = landmarks[8]
        const thumbTip = landmarks[4]

        // Smooth cursor movement (inverted X because camera is mirrored)
        const targetX = (1 - indexFingerTip.x) * window.innerWidth
        const targetY = indexFingerTip.y * window.innerHeight

        setCursorPos(prev => ({
          x: prev.x + (targetX - prev.x) * 0.3,
          y: prev.y + (targetY - prev.y) * 0.3
        }))

        // Detect pinch (distance between thumb tip and index finger tip)
        const distance = Math.sqrt(
          Math.pow(indexFingerTip.x - thumbTip.x, 2) +
          Math.pow(indexFingerTip.y - thumbTip.y, 2) +
          Math.pow(indexFingerTip.z - thumbTip.z, 2)
        )

        if (distance < 0.05) {
          if (!isPinchingRef.current) {
            isPinchingRef.current = true
            setIsPinching(true)
            triggerClick(targetX, targetY)
          }
        } else {
          isPinchingRef.current = false
          setIsPinching(false)
        }
      }
    }
    canvasCtx.restore()
  }, [])

  const triggerClick = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)
    if (el) {
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y
      })
      el.dispatchEvent(clickEvent)
      if (el instanceof HTMLElement) {
        el.focus()
      }
    }
  }

  const handleScriptLoad = () => {
    setScriptsLoaded(prev => prev + 1)
  }

  useEffect(() => {
    if (isEnabled && scriptsLoaded >= 4 && !handsRef.current) {
      setIsLoading(true)

      const Hands = (window as any).Hands
      const Camera = (window as any).Camera

      if (!Hands || !Camera) {
        console.error("MediaPipe Hand or Camera classes not found")
        setIsLoading(false)
        return
      }

      const hands = new Hands({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      hands.onResults(onResults)
      handsRef.current = hands

      if (videoRef.current) {
        const camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current })
            }
          },
          width: 640,
          height: 480
        })
        camera.start().then(() => {
          setIsLoading(false)
        })
        cameraRef.current = camera
      }
    } else if (!isEnabled) {
      if (cameraRef.current) {
        cameraRef.current.stop()
        cameraRef.current = null
      }
      if (handsRef.current) {
        handsRef.current.close()
        handsRef.current = null
      }
    }

    return () => {
      if (cameraRef.current) cameraRef.current.stop()
      if (handsRef.current) handsRef.current.close()
    }
  }, [isEnabled, onResults, scriptsLoaded])

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" onReady={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js" onReady={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" onReady={handleScriptLoad} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" onReady={handleScriptLoad} />

      {/* Custom Cursor */}
      {isEnabled && (
        <div
          className={`fixed z-[9999] pointer-events-none transition-transform duration-75 ${isPinching ? 'scale-75' : 'scale-100'}`}
          style={{
            left: cursorPos.x,
            top: cursorPos.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 ${isPinching ? 'bg-red-500/50 border-red-500' : 'bg-cyan-500/30 border-cyan-400'} shadow-[0_0_15px_rgba(34,211,238,0.5)]`}>
            <div className={`w-1 h-1 rounded-full ${isPinching ? 'bg-white' : 'bg-cyan-400'}`} />
            <div className={`absolute inset-0 rounded-full border border-cyan-400/30 animate-ping`} />
          </div>
        </div>
      )}

      {/* Control UI */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
        {isEnabled && (
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/80 backdrop-blur-md shadow-2xl transition-all duration-300 w-48 h-36">
            <video
              ref={videoRef}
              className="hidden"
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover mirror"
              width={640}
              height={480}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 font-mono text-[10px] text-cyan-400">
                INITIALIZING...
              </div>
            )}
            <div className="absolute top-2 left-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-[10px] text-white/70 uppercase tracking-tighter">Hand Feed</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsEnabled(!isEnabled)}
          className={`group flex items-center gap-3 px-6 py-3 font-mono text-sm border transition-all duration-300 ${
            isEnabled
              ? 'border-red-500/50 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
              : 'border-cyan-400 bg-transparent text-cyan-400 hover:bg-cyan-400 hover:text-black'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-red-500 group-hover:bg-white' : 'bg-cyan-400 group-hover:bg-black'}`} />
          {isEnabled ? 'DISABLE HAND CONTROL' : 'ENABLE HAND CONTROL'}
        </button>
      </div>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </>
  )
}

export default HandTracker
