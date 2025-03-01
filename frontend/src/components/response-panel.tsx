import type { ResponseData } from "@/components/api-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { JsonViewer } from "@/components/json-viewer"

interface ResponsePanelProps {
  response: ResponseData | null
  isLoading: boolean
}

export function ResponsePanel({ response, isLoading }: ResponsePanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Sending request...</p>
        </div>
      </div>
    )
  }

  if (!response) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p>Send a request to see the response</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (status >= 300 && status < 400) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    if (status >= 400 && status < 500) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    if (status >= 500) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  const isJsonResponse = response.contentType.includes("application/json")

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center gap-4">
        <Badge className={getStatusColor(response.status)}>
          {response.status} {response.statusText}
        </Badge>
        <div className="text-sm text-muted-foreground">Time: {response.time}ms</div>
        <div className="text-sm text-muted-foreground">Size: {response.size}</div>
      </div>

      <Tabs defaultValue="body" className="flex-1">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="body">Body</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
        </TabsList>
        <TabsContent value="body" className="p-0 flex-1">
          {isJsonResponse ? (
            <JsonViewer json={response.body} />
          ) : (
            <ScrollArea className="h-[calc(100vh-20rem)]">
              <pre className="p-4 text-sm font-mono whitespace-pre-wrap break-words">{response.body}</pre>
            </ScrollArea>
          )}
        </TabsContent>
        <TabsContent value="headers" className="p-4">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <div className="space-y-2">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="grid grid-cols-[200px_1fr] gap-2 text-sm">
                  <div className="font-medium">{key}:</div>
                  <div className="text-muted-foreground">{value}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

