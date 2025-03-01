import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { HttpMethod, RequestData } from "@/components/api-client"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CurlImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (request: Partial<RequestData>) => void
}

export function CurlImportModal({ isOpen, onClose, onImport }: CurlImportModalProps) {
  const [curlCommand, setCurlCommand] = useState("")
  const [error, setError] = useState<string | null>(null)

  const parseCurl = () => {
    setError(null)

    try {
      // Basic parsing of curl command
      const trimmedCommand = curlCommand.trim()

      if (!trimmedCommand.startsWith("curl ")) {
        throw new Error("Command must start with 'curl'")
      }

      // Extract URL
      const urlMatch = trimmedCommand.match(/curl\s+['"]?([^'">\s]+)['"]?/)
      const url = urlMatch ? urlMatch[1] : null

      if (!url) {
        throw new Error("Could not parse URL from curl command")
      }

      // Default to GET method
      let method: HttpMethod = "GET"

      // Extract method
      if (trimmedCommand.includes("-X ") || trimmedCommand.includes("--request ")) {
        const methodMatch = trimmedCommand.match(/-X\s+([A-Z]+)/) || trimmedCommand.match(/--request\s+([A-Z]+)/)
        if (methodMatch && ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"].includes(methodMatch[1])) {
          method = methodMatch[1] as HttpMethod
        }
      }

      // Extract headers
      const headers: { key: string; value: string; enabled: boolean }[] = []
      const headerMatches = trimmedCommand.matchAll(/-H\s+['"]([^'"]+)['"]|--header\s+['"]([^'"]+)['"]/g)

      for (const match of headerMatches) {
        const headerStr = match[1] || match[2]
        const separatorIndex = headerStr.indexOf(":")

        if (separatorIndex > 0) {
          const key = headerStr.substring(0, separatorIndex).trim()
          const value = headerStr.substring(separatorIndex + 1).trim()
          headers.push({ key, value, enabled: true })
        }
      }

      // Extract body
      let body = ""
      let bodyType: "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "none" = "none"

      const dataMatch = trimmedCommand.match(/-d\s+['"]([^'"]+)['"]|--data\s+['"]([^'"]+)['"]/)
      if (dataMatch) {
        body = dataMatch[1] || dataMatch[2]

        // Try to determine body type
        if (body.startsWith("{") && body.endsWith("}")) {
          try {
            JSON.parse(body)
            bodyType = "json"
          } catch (e) {
            bodyType = "raw"
          }
        } else if (body.includes("=")) {
          bodyType = "x-www-form-urlencoded"
        } else {
          bodyType = "raw"
        }
      }

      // Create request object
      const request: Partial<RequestData> = {
        url,
        method,
        headers,
        body,
        bodyType,
      }

      onImport(request)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse curl command")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import cURL Command</DialogTitle>
          <DialogDescription>Paste a cURL command to convert it to a request</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Textarea
            value={curlCommand}
            onChange={(e) => setCurlCommand(e.target.value)}
            placeholder="curl https://api.example.com -H 'Content-Type: application/json'"
            className="font-mono text-sm min-h-[200px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={parseCurl}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

