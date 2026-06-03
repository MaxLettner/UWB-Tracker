import React, { useRef, useEffect } from 'react'
import type ICoord from "../services/coordinate.service"
import '../styles/ConsoleView.css'

interface Props {
  data: (ICoord[] | string)[]
}

const ConsoleView = ({ data }: Props) => {
  const consoleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [data])

  return (
    <div className='consoleView' ref={consoleRef}>
      {data.map((entry, outerIndex) =>
        typeof entry === 'string'
          ? (
            splitString(entry).map((s, innerIndex) => (
              <React.Fragment key={`${outerIndex}-${innerIndex}`}>
                {innerIndex === 0 ? '>' : '\u00A0'} {s} <br />
              </React.Fragment>
            ))
          )
          : entry.map((c, innerIndex) => (
            <React.Fragment key={`${outerIndex}-${innerIndex}`}>
              {innerIndex === 0 ? '>' : '\u00A0'} X: {c.x.toFixed(2)} Y: {c.y.toFixed(2)} Z: {c.z.toFixed(2)} Time: {c.timestamp.slice(11, 19)}<br />
            </React.Fragment>
          ))
      )}
    </div>
  )
}

const splitString = (string: string): string[] => {
  const words = string.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    if (word.length > 35) {
      if (current.length > 0) {
        lines.push(current)
        current = ''
      }
      for (let i = 0; i < word.length; i += 35) {
        lines.push(word.slice(i, i + 35))
      }
    } else if (current.length === 0) {
      current = word
    } else if (current.length + 1 + word.length <= 35) {
      current += ' ' + word
    } else {
      lines.push(current)
      current = word
    }
  }

  if (current.length > 0) lines.push(current)

  return lines
}

export default ConsoleView