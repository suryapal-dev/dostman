"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { RequestData } from "@/components/api-client"
import { Check, Copy } from "lucide-react"

interface CurlExportModalProps {
  isOpen: boolean
  onClose: () => void
  request: RequestData
}

export function CurlExportModal({ isOpen, onClose, request }: CurlExportModalProps) {
  const [curlCommand, setCurlCommand] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isOpen) {
      generateCurlCommand()
    }
  }, [isOpen]) // Removed unnecessary dependency: request

  const generateCurlCommand = () => {
    let command = `curl -X ${request.method} "${request.url}"`

    // Add headers
    request.headers
      .filter((header) => header.enabled && header.key)
      .forEach((header) => {
        command += ` \\\n  -H "${header.key}: ${header.value}"`
      })

    // Add query parameters to URL if they're not already in the URL
    const queryParams = request.params.filter((param) => param.enabled && param.key)

    if (queryParams.length > 0 && !request.url.includes("?")) {
      command += ` \\\n  "${request.url}?`
      command += queryParams
        .map((param) => `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`)
        .join("&")
      command += '"'
    }

    // Add body for non-GET requests
    if (request.method !== "GET" && request.method !== "HEAD" && request.bodyType !== "none" && request.body) {
      if (request.bodyType === "json") {
        command += ` \\\n  -H "Content-Type: application/json" \\\n  -d '${request.body}'`
      } else if (request.bodyType === "form-data") {
        try {
          const formValues = JSON.parse(request.body)
          Object.entries(formValues).forEach(([key, value]) => {
            command += ` \\\n  -F "${key}=${value}"`
          })
        } catch (e) {
          command += ` \\\n  -d '${request.body}'`
        }
      } else if (request.bodyType === "x-www-form-urlencoded") {
        command += ` \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d '${request.body}'`
      } else {
        command += ` \\\n  -d '${request.body}'`
      }
    }

    setCurlCommand(command)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export as cURL</DialogTitle>
          <DialogDescription>Copy this cURL command to use in your terminal</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="relative">
            <Textarea value={curlCommand} readOnly className="font-mono text-sm min-h-[200px] pr-10" />
            <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

