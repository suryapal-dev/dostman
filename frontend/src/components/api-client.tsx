"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Sidebar } from "@/components/sidebar"
import { RequestPanel } from "@/components/request-panel"
import { ResponsePanel } from "@/components/response-panel"
import { RequestHistory } from "@/components/request-history"
import { CollectionsPanel } from "@/components/collections-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { SaveRequestDialog } from "@/components/save-request-dialog"
import { useLocalStorage } from "@/lib/use-local-storage"

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD"
export type RequestData = {
  id: string
  name: string
  url: string
  method: HttpMethod
  headers: { key: string; value: string; enabled: boolean }[]
  params: { key: string; value: string; enabled: boolean }[]
  body: string
  bodyType: "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "none"
}

export type ResponseData = {
  status: number
  statusText: string
  time: number
  size: string
  headers: Record<string, string>
  body: string
  contentType: string
}

export type Collection = {
  id: string
  name: string
  requests: RequestData[]
}

export type HistoryItem = {
  id: string
  request: RequestData
  response: ResponseData
  timestamp: number
}

export default function ApiClient() {
  const [activeTab, setActiveTab] = useState("request")
  const [collections, setCollections] = useLocalStorage<Collection[]>("api-forge-collections", [], true)
  const [history, setHistory] = useLocalStorage<HistoryItem[]>("api-forge-history", [])

  const [activeRequest, setActiveRequest] = useState<RequestData>({
    id: "temp-" + Date.now().toString(),
    name: "New Request",
    url: "",
    method: "GET",
    headers: [],
    params: [],
    body: "",
    bodyType: "none",
  })

  const [response, setResponse] = useState<ResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)

  // Initialize with a default collection if none exists
  useEffect(() => {
    if (collections.length === 0) {
      setCollections([
        {
          id: "default-" + Date.now().toString(),
          name: "My Collection",
          requests: [],
        },
      ])
    }
  }, [collections.length, setCollections]) // Added collections.length and setCollections to dependencies

  const handleSendRequest = async () => {
    setIsLoading(true)
    try {
      // Build URL with query parameters
      const url = new URL(activeRequest.url)
      activeRequest.params
        .filter((param) => param.enabled && param.key)
        .forEach((param) => {
          url.searchParams.append(param.key, param.value)
        })

      // Build headers
      const headers: Record<string, string> = {}
      activeRequest.headers
        .filter((header) => header.enabled && header.key)
        .forEach((header) => {
          headers[header.key] = header.value
        })

      // Build request options
      const options: RequestInit = {
        method: activeRequest.method,
        headers,
      }

      // Add body for non-GET requests
      if (activeRequest.method !== "GET" && activeRequest.method !== "HEAD" && activeRequest.bodyType !== "none") {
        if (activeRequest.bodyType === "json") {
          options.headers = {
            ...options.headers,
            "Content-Type": "application/json",
          }
          try {
            options.body = JSON.stringify(JSON.parse(activeRequest.body))
          } catch (e) {
            options.body = activeRequest.body
          }
        } else if (activeRequest.bodyType === "form-data") {
          // Handle form data
          const formData = new FormData()
          try {
            const formValues = JSON.parse(activeRequest.body)
            Object.entries(formValues).forEach(([key, value]) => {
              formData.append(key, value as string)
            })
            options.body = formData
          } catch (e) {
            options.body = activeRequest.body
          }
        }
      }

      const startTime = Date.now()
      const res = await fetch(url.toString(), options)
      const endTime = Date.now()

      const responseHeaders: Record<string, string> = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const contentType = res.headers.get("content-type") || ""
      let responseBody = ""
      let responseSize = "0 B"

      if (contentType.includes("application/json")) {
        const json = await res.json()
        responseBody = JSON.stringify(json, null, 2)
        responseSize = new Blob([responseBody]).size + " B"
      } else {
        responseBody = await res.text()
        responseSize = new Blob([responseBody]).size + " B"
      }

      const responseData: ResponseData = {
        status: res.status,
        statusText: res.statusText,
        time: endTime - startTime,
        size: responseSize,
        headers: responseHeaders,
        body: responseBody,
        contentType,
      }

      setResponse(responseData)
      setActiveTab("response")

      // Add to history
      const historyItem: HistoryItem = {
        id: Date.now().toString(),
        request: { ...activeRequest },
        response: responseData,
        timestamp: Date.now(),
      }

      setHistory((prev) => [historyItem, ...prev.slice(0, 19)]) // Keep only last 20 items
    } catch (error) {
      console.error("Request failed:", error)
      setResponse({
        status: 0,
        statusText: "Error",
        time: 0,
        size: "0 B",
        headers: {},
        body: error instanceof Error ? error.message : "Unknown error occurred",
        contentType: "text/plain",
      })
      setActiveTab("response")
    } finally {
      setIsLoading(false)
    }
  }

  const addNewRequest = () => {
    const newRequest: RequestData = {
      id: "temp-" + Date.now().toString(),
      name: "New Request",
      url: "",
      method: "GET",
      headers: [],
      params: [],
      body: "",
      bodyType: "none",
    }
    setActiveRequest(newRequest)
    setResponse(null)
    setActiveTab("request")
  }

  const updateActiveRequest = (updatedRequest: Partial<RequestData>) => {
    setActiveRequest((prev) => ({ ...prev, ...updatedRequest }))
  }

  // Collection management
  const handleAddCollection = (name: string) => {
    const newCollection: Collection = {
      id: "col-" + Date.now().toString(),
      name,
      requests: [],
    }
    setCollections([...collections, newCollection])
  }

  const handleRenameCollection = (id: string, name: string) => {
    setCollections(collections.map((col) => (col.id === id ? { ...col, name } : col)))
  }

  const handleDeleteCollection = (id: string) => {
    setCollections(collections.filter((col) => col.id !== id))
  }

  const handleSaveRequest = () => {
    if (collections.length === 0) {
      handleAddCollection("My Collection")
    }
    setIsSaveDialogOpen(true)
  }

  const handleSaveRequestToCollection = (name: string, collectionId: string) => {
    const requestToSave: RequestData = {
      ...activeRequest,
      id: activeRequest.id.startsWith("temp-") ? "req-" + Date.now().toString() : activeRequest.id,
      name,
    }

    setActiveRequest(requestToSave)

    setCollections(
      collections.map((col) => {
        if (col.id === collectionId) {
          // Check if request already exists in this collection
          const existingIndex = col.requests.findIndex((req) => req.id === requestToSave.id)

          if (existingIndex >= 0) {
            // Update existing request
            const updatedRequests = [...col.requests]
            updatedRequests[existingIndex] = requestToSave
            return { ...col, requests: updatedRequests }
          } else {
            // Add new request
            return { ...col, requests: [...col.requests, requestToSave] }
          }
        }
        return col
      }),
    )
  }

  const handleRenameRequest = (collectionId: string, requestId: string, name: string) => {
    setCollections(
      collections.map((col) => {
        if (col.id === collectionId) {
          return {
            ...col,
            requests: col.requests.map((req) => (req.id === requestId ? { ...req, name } : req)),
          }
        }
        return col
      }),
    )

    // Update active request if it's the one being renamed
    if (activeRequest.id === requestId) {
      setActiveRequest((prev) => ({ ...prev, name }))
    }
  }

  const handleDeleteRequest = (collectionId: string, requestId: string) => {
    setCollections(
      collections.map((col) => {
        if (col.id === collectionId) {
          return {
            ...col,
            requests: col.requests.filter((req) => req.id !== requestId),
          }
        }
        return col
      }),
    )

    // If the active request is deleted, create a new one
    if (activeRequest.id === requestId) {
      addNewRequest()
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b px-4 py-2 flex items-center justify-between bg-background">
        <h1 className="text-xl font-bold">API Forge</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addNewRequest}>
            <Plus className="h-4 w-4 mr-1" />
            New Request
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <Sidebar>
            <Tabs defaultValue="collections">
              <TabsList className="w-full">
                <TabsTrigger value="collections" className="flex-1">
                  Collections
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  History
                </TabsTrigger>
              </TabsList>
              <TabsContent value="collections" className="p-0">
                <CollectionsPanel
                  collections={collections}
                  activeRequestId={activeRequest.id}
                  onSelectRequest={(request) => {
                    setActiveRequest(request)
                    setResponse(null)
                    setActiveTab("request")
                  }}
                  onAddCollection={handleAddCollection}
                  onRenameCollection={handleRenameCollection}
                  onDeleteCollection={handleDeleteCollection}
                  onRenameRequest={handleRenameRequest}
                  onDeleteRequest={handleDeleteRequest}
                />
              </TabsContent>
              <TabsContent value="history" className="p-0">
                <RequestHistory
                  history={history}
                  onSelectHistoryItem={(item) => {
                    setActiveRequest(item.request)
                    setResponse(item.response)
                    setActiveTab("request")
                  }}
                  onClearHistory={() => setHistory([])}
                />
              </TabsContent>
            </Tabs>
          </Sidebar>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="mx-4 mt-2">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="response">Response</TabsTrigger>
            </TabsList>
            <TabsContent value="request" className="p-0 flex-1">
              <RequestPanel
                request={activeRequest}
                onUpdateRequest={updateActiveRequest}
                onSendRequest={handleSendRequest}
                onSaveRequest={handleSaveRequest}
                isLoading={isLoading}
              />
            </TabsContent>
            <TabsContent value="response" className="p-0 flex-1">
              <ResponsePanel response={response} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>

      <SaveRequestDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveRequestToCollection}
        collections={collections}
        initialName={activeRequest.name}
        initialCollectionId={collections[0]?.id}
      />
    </div>
  )
}

