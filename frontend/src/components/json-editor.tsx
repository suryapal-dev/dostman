import type React from "react"

import { useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"

interface JsonEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function JsonEditor({ value, onChange, disabled = false }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, []) //Fixed useEffect dependency

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const formatJson = () => {
    try {
      const parsed = JSON.parse(value)
      onChange(JSON.stringify(parsed, null, 2))
    } catch (e) {
      // If JSON is invalid, don't format
    }
  }

  return (
    <div className="h-full">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={formatJson}
        disabled={disabled}
        className="font-mono text-sm h-full min-h-[200px] resize-none"
        placeholder="Enter JSON body"
      />
    </div>
  )
}

