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
// Import Wails backend functions
import { SendRequest, LoadCollections, SaveCollections, LoadHistory, SaveHistory, DeleteAllHistory, CheckForUpdates, DownloadAndInstallUpdate } from '../../wailsjs/go/main/App'
import { types } from '../../wailsjs/go/models'

// Use the Wails-generated types as a base
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD"

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestData {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  bodyType: "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "none";
  collectionId: string;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: string;
  contentType: string;
}

export interface Collection {
  id: string;
  name: string;
  requests: RequestData[];
}

export interface HistoryItem {
  id: string;
  request: RequestData;
  response: ResponseData;
  timestamp: number;
}

const convertToWailsCollections = (collections: Collection[]): types.Collection[] => {
  return collections.map(col => new types.Collection({
    id: col.id,
    name: col.name,
    requests: col.requests.map(req => new types.RequestData({
      id: req.id,
      name: req.name,
      url: req.url,
      method: req.method,
      headers: req.headers,
      params: req.params,
      body: req.body,
      bodyType: req.bodyType
    }))
  }));
}

export default function ApiClient() {
  const [activeTab, setActiveTab] = useState("request")
  const [collections, setCollections] = useState<Collection[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeRequest, setActiveRequest] = useState<RequestData>({
    id: "temp-" + Date.now().toString(),
    name: "New Request",
    url: "",
    method: "GET",
    headers: [],
    params: [],
    body: "",
    bodyType: "none",
    collectionId: ""
  })
  const [response, setResponse] = useState<ResponseData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)

  const checkForUpdates = async () => {
    try {
      const updateInfo = await CheckForUpdates()
      if (updateInfo) {
        // Show update dialog to user
        if (confirm(`New version ${updateInfo.version} available. Would you like to update?\n\nRelease notes:\n${updateInfo.notes}`)) {
          await DownloadAndInstallUpdate(updateInfo.downloadUrl)
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }
  }

  useEffect(() => {
    checkForUpdates()
  }, [])

  useEffect(() => {
    // Load initial data
    const loadInitialData = async () => {
      try {
        const [loadedCollections, loadedHistory] = await Promise.all([
          LoadCollections(),
          LoadHistory()
        ]);

        // Convert the Wails types to frontend types
        const convertedCollections: Collection[] = loadedCollections.map(col => ({
          ...col,
          requests: col.requests.map(req => ({
            ...req,
            method: req.method as HttpMethod,
            bodyType: req.bodyType as "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "none",
            collectionId: col.id
          }))
        }));

        const convertedHistory: HistoryItem[] = loadedHistory.map(item => ({
          ...item,
          request: {
            ...item.request,
            method: item.request.method as HttpMethod,
            bodyType: item.request.bodyType as "json" | "form-data" | "x-www-form-urlencoded" | "raw" | "none",
            collectionId: item.id
          }
        }));

        setCollections(convertedCollections);
        setHistory(convertedHistory);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  const handleSendRequest = async () => {
    setIsLoading(true)
    try {
      // Convert our frontend request to a Wails request
      const wailsRequest = {
        ...activeRequest,
        headers: activeRequest.headers.filter(h => h.enabled && h.key),
        params: activeRequest.params.filter(p => p.enabled && p.key),
        convertValues: function() {} // Add the required method
      };

      const responseData = await SendRequest(wailsRequest)
      const convertedResponse: ResponseData = {
        status: responseData.status,
        statusText: responseData.statusText,
        time: responseData.time,
        size: responseData.size,
        headers: responseData.headers,
        body: responseData.body,
        contentType: responseData.contentType
      }

      setResponse(convertedResponse)
      setActiveTab("response")

      // Create a new history item with proper Wails types
      const historyItem = new types.HistoryItem({
        id: Date.now().toString(),
        request: new types.RequestData({
          id: activeRequest.id,
          name: activeRequest.name,
          url: activeRequest.url,
          method: activeRequest.method,
          headers: activeRequest.headers,
          params: activeRequest.params,
          body: activeRequest.body,
          bodyType: activeRequest.bodyType
        }),
        response: new types.ResponseData({
          status: convertedResponse.status,
          statusText: convertedResponse.statusText,
          time: convertedResponse.time,
          size: convertedResponse.size,
          headers: convertedResponse.headers,
          body: convertedResponse.body,
          contentType: convertedResponse.contentType
        }),
        timestamp: Date.now()
      });

      await SaveHistory([historyItem]);
      
      const frontendHistoryItem: HistoryItem = {
        id: historyItem.id,
        request: activeRequest,
        response: convertedResponse,
        timestamp: historyItem.timestamp
      };

      setHistory(prev => [frontendHistoryItem, ...prev.slice(0, 19)])
    } catch (error) {
      setResponse({
        status: 0,
        statusText: "Error",
        time: 0,
        size: "0 B",
        headers: {},
        body: error instanceof Error ? error.message : "Unknown error occurred",
        contentType: "text/plain"
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
      collectionId: ""
    }
    setActiveRequest(newRequest)
    setResponse(null)
    setActiveTab("request")
  }

  const updateActiveRequest = (updatedRequest: Partial<RequestData>) => {
    setActiveRequest((prev) => ({ ...prev, ...updatedRequest }))
  }

  // Collection management
  const handleAddCollection = async (name: string) => {
    const newCollection: Collection = {
      id: "col-" + Date.now().toString(),
      name,
      requests: [],
    }
    const updatedCollections = [...collections, newCollection];
    setCollections(updatedCollections);
    
    // Convert to Wails types before saving
    const wailsCollections = convertToWailsCollections(updatedCollections);
    
    await SaveCollections(wailsCollections);
  }

  const handleRenameCollection = async (id: string, name: string) => {
    const updatedCollections = collections.map((col) => 
      col.id === id ? { ...col, name } : col
    );
    setCollections(updatedCollections);
    
    const wailsCollections = convertToWailsCollections(updatedCollections);
    
    await SaveCollections(wailsCollections);
  }

  const handleDeleteCollection = async (id: string) => {
    const updatedCollections = collections.filter((col) => col.id !== id);
    setCollections(updatedCollections);
    
    const wailsCollections = convertToWailsCollections(updatedCollections);
    
    await SaveCollections(wailsCollections);
  }

  const handleSaveRequest = () => {
    if (collections.length === 0) {
      handleAddCollection("My Collection")
    }
    setIsSaveDialogOpen(true)
  }

  const handleSaveRequestToCollection = async (name: string, collectionId: string) => {
    const requestToSave: RequestData = {
      ...activeRequest,
      id: activeRequest.id.startsWith("temp-") ? "req-" + Date.now().toString() : activeRequest.id,
      name,
    }

    setActiveRequest(requestToSave)

    const updatedCollections = collections.map((col) => {
      if (col.id === collectionId) {
        const existingIndex = col.requests.findIndex((req) => req.id === requestToSave.id)
        if (existingIndex >= 0) {
          const updatedRequests = [...col.requests]
          updatedRequests[existingIndex] = requestToSave
          return { ...col, requests: updatedRequests }
        } else {
          return { ...col, requests: [...col.requests, requestToSave] }
        }
      }
      return col
    });

    setCollections(updatedCollections);
    
    const wailsCollections = convertToWailsCollections(updatedCollections);
    
    await SaveCollections(wailsCollections);
  }

  const handleRenameRequest = async (collectionId: string, requestId: string, name: string) => {
    const updatedCollections = collections.map((col) => {
      if (col.id === collectionId) {
        return {
          ...col,
          requests: col.requests.map((req) => (req.id === requestId ? { ...req, name } : req)),
        }
      }
      return col
    });

    setCollections(updatedCollections);

    // Update active request if it's the one being renamed
    if (activeRequest.id === requestId) {
      setActiveRequest((prev) => ({ ...prev, name }));
    }

    // Save to backend
    const wailsCollections = convertToWailsCollections(updatedCollections);
    await SaveCollections(wailsCollections);
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

  const handleClearHistory = async () => {
    try {
      // Clear the history in the UI
      setHistory([])
      
      // Save the empty history to the backend
      await DeleteAllHistory()
    } catch (error) {
      console.error('Failed to clear history:', error)
    }
  }

  const handleMoveRequest = async (requestId: string, fromCollectionId: string, toCollectionId: string) => {
    const updatedCollections = collections.map(col => {
      if (col.id === fromCollectionId) {
        return {
          ...col,
          requests: col.requests.filter(req => req.id !== requestId)
        }
      }
      if (col.id === toCollectionId) {
        const request = collections
          .find(c => c.id === fromCollectionId)
          ?.requests.find(r => r.id === requestId)
        if (request) {
          return {
            ...col,
            requests: [...col.requests, request]
          }
        }
      }
      return col
    })

    setCollections(updatedCollections)
    
    const wailsCollections = convertToWailsCollections(updatedCollections)
    await SaveCollections(wailsCollections)

    // Update active request if it was moved
    if (activeRequest.id === requestId) {
      setActiveRequest(prev => ({
        ...prev,
        collectionId: toCollectionId
      }))
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 border-b px-4 py-2 flex items-center justify-between bg-background">
        <h1 className="text-xl font-bold">Dostman</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addNewRequest}>
            <Plus className="h-4 w-4 mr-1" />
            New Request
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <ResizablePanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <Sidebar>
            <div className="flex flex-col h-full overflow-hidden">
              <Tabs defaultValue="collections" className="flex flex-col h-full">
                <TabsList className="sticky top-0 z-40 w-full bg-background border-b">
                  <TabsTrigger value="collections" className="flex-1">
                    Collections
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    History
                  </TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-y-auto">
                  <TabsContent value="collections" className="p-0 h-full">
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
                      onMoveRequest={handleMoveRequest}
                    />
                  </TabsContent>
                  <TabsContent value="history" className="p-0 h-full">
                    <RequestHistory
                      history={history}
                      onSelectHistoryItem={(item) => {
                        setActiveRequest(item.request)
                        setResponse(item.response)
                        setActiveTab("request")
                      }}
                      onClearHistory={handleClearHistory}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </Sidebar>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80}>
          <div className="flex flex-col h-full overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
              <TabsList className="sticky top-0 z-40 mx-4 mt-2 bg-background">
                <TabsTrigger value="request">Request</TabsTrigger>
                <TabsTrigger value="response">Response</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto">
                <TabsContent value="request" className="p-0">
                  <RequestPanel
                    request={activeRequest}
                    onUpdateRequest={updateActiveRequest}
                    onSendRequest={handleSendRequest}
                    onSaveRequest={handleSaveRequest}
                    isLoading={isLoading}
                    collections={collections}
                    onMoveRequest={handleMoveRequest}
                  />
                </TabsContent>
                <TabsContent value="response" className="p-0">
                  <ResponsePanel response={response} isLoading={isLoading} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
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

