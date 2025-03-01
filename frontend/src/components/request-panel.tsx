"use client"

import type React from "react"

import { useState } from "react"
import type { HttpMethod, RequestData } from "@/components/api-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Code, Download, Loader2, Play, Save, Upload } from "lucide-react"
import { KeyValueEditor } from "@/components/key-value-editor"
import { JsonEditor } from "@/components/json-editor"
import { CurlImportModal } from "@/components/curl-import-modal"
import { CurlExportModal } from "@/components/curl-export-modal"

interface RequestPanelProps {
  request: RequestData
  onUpdateRequest: (request: Partial<RequestData>) => void
  onSendRequest: () => void
  onSaveRequest: () => void
  isLoading: boolean
}

export function RequestPanel({ request, onUpdateRequest, onSendRequest, onSaveRequest, isLoading }: RequestPanelProps) {
  const [requestName, setRequestName] = useState(request.name)
  const [isCurlImportOpen, setIsCurlImportOpen] = useState(false)
  const [isCurlExportOpen, setIsCurlExportOpen] = useState(false)

  const handleMethodChange = (value: string) => {
    onUpdateRequest({ method: value as HttpMethod })
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateRequest({ url: e.target.value })
  }

  const handleBodyTypeChange = (value: string) => {
    onUpdateRequest({
      bodyType: value as "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "none",
      body: value === "json" ? "{}" : "",
    })
  }

  const handleSave = () => {
    onUpdateRequest({ name: requestName })
    onSaveRequest()
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              className="max-w-[200px]"
              placeholder="Request name"
            />
            <Button variant="outline" size="icon" onClick={handleSave} title="Save request">
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setIsCurlImportOpen(true)} title="Import cURL">
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsCurlExportOpen(true)}
              title="Export as cURL"
              disabled={!request.url}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Format request"
              onClick={() => {
                if (request.bodyType === "json" && request.body) {
                  try {
                    const formatted = JSON.stringify(JSON.parse(request.body), null, 2)
                    onUpdateRequest({ body: formatted })
                  } catch (e) {
                    // If JSON is invalid, don't format
                  }
                }
              }}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Select value={request.method} onValueChange={handleMethodChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                <SelectItem value="HEAD">HEAD</SelectItem>
              </SelectContent>
            </Select>
            <Input value={request.url} onChange={handleUrlChange} placeholder="Enter request URL" className="flex-1" />
            <Button onClick={onSendRequest} disabled={!request.url || isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
              Send
            </Button>
          </div>
        </div>

        <Tabs defaultValue="params" className="flex-1">
          <TabsList className="mx-4">
            <TabsTrigger value="params">Params</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="body">Body</TabsTrigger>
          </TabsList>
          <TabsContent value="params" className="p-4 h-full">
            <KeyValueEditor
              items={request.params}
              onChange={(params) => onUpdateRequest({ params })}
              addButtonText="Add Parameter"
            />
          </TabsContent>
          <TabsContent value="headers" className="p-4 h-full">
            <KeyValueEditor
              items={request.headers}
              onChange={(headers) => onUpdateRequest({ headers })}
              addButtonText="Add Header"
            />
          </TabsContent>
          <TabsContent value="body" className="p-0 flex flex-col h-full">
            <div className="p-4 border-b">
              <Select
                value={request.bodyType}
                onValueChange={handleBodyTypeChange}
                disabled={request.method === "GET" || request.method === "HEAD"}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Body Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="form-data">Form Data</SelectItem>
                  <SelectItem value="x-www-form-urlencoded">x-www-form-urlencoded</SelectItem>
                  <SelectItem value="raw">Raw</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 p-4">
              {request.bodyType === "json" && (
                <JsonEditor
                  value={request.body}
                  onChange={(value) => onUpdateRequest({ body: value })}
                  disabled={request.method === "GET" || request.method === "HEAD"}
                />
              )}
              {request.bodyType === "none" && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  This request does not have a body
                </div>
              )}
              {(request.bodyType === "form-data" ||
                request.bodyType === "x-www-form-urlencoded" ||
                request.bodyType === "raw") && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {request.bodyType} editor is not implemented in this demo
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CurlImportModal
        isOpen={isCurlImportOpen}
        onClose={() => setIsCurlImportOpen(false)}
        onImport={onUpdateRequest}
      />

      <CurlExportModal isOpen={isCurlExportOpen} onClose={() => setIsCurlExportOpen(false)} request={request} />
    </>
  )
}

