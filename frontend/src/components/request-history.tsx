import type { HistoryItem } from "@/components/api-client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface RequestHistoryProps {
  history: HistoryItem[]
  onSelectHistoryItem: (item: HistoryItem) => void
  onClearHistory: () => void
}

export function RequestHistory({ history, onSelectHistoryItem, onClearHistory }: RequestHistoryProps) {
  if (history.length === 0) {
    return (
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-4 text-center text-muted-foreground">
          <p>No recent requests</p>
        </div>
      </ScrollArea>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          onClick={onClearHistory}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Clear History
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex flex-col p-2 rounded-md hover:bg-muted cursor-pointer"
              onClick={() => onSelectHistoryItem(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded font-medium",
                      item.request.method === "GET"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : item.request.method === "POST"
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : item.request.method === "PUT"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : item.request.method === "DELETE"
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                    )}
                  >
                    {item.request.method}
                  </span>
                  <span className="font-medium truncate max-w-[150px]">{item.request.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                </span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground truncate">{item.request.url}</div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    item.response.status >= 200 && item.response.status < 300
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : item.response.status >= 300 && item.response.status < 400
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : item.response.status >= 400 && item.response.status < 500
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                  )}
                >
                  {item.response.status}
                </span>
                <span className="text-xs">{item.response.time}ms</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

