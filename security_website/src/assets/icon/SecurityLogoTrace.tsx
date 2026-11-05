import { useEffect, useRef } from 'react'
import './SecurityLogoTrace.css'
// @ts-expect-error - JS file module
import { mountSecurityLogo } from './mountSecurityLogo.js'

interface SecurityLogoTraceProps {
  size?: number | string
}

export default function SecurityLogoTrace({ size = 420 }: SecurityLogoTraceProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      mountSecurityLogo(containerRef.current, size)
    }
  }, [size])

  return <div ref={containerRef} style={{ display: 'contents' }} />
}
