import { useState } from "react"
import type { Collection, RequestData } from "@/components/api-client"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight, FolderClosed, MoreVertical, Plus, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { CollectionDialog } from "@/components/collection-dialog"
import { Button } from "@/components/ui/button"

interface CollectionsPanelProps {
  collections: Collection[]
  activeRequestId: string
  onSelectRequest: (request: RequestData) => void
  onAddCollection: (name: string) => void
  onRenameCollection: (id: string, name: string) => void
  onDeleteCollection: (id: string) => void
  onRenameRequest: (collectionId: string, requestId: string, name: string) => void
  onDeleteRequest: (collectionId: string, requestId: string) => void
}

export function CollectionsPanel({
  collections,
  activeRequestId,
  onSelectRequest,
  onAddCollection,
  onRenameCollection,
  onDeleteCollection,
  onRenameRequest,
  onDeleteRequest,
}: CollectionsPanelProps) {
  const [expandedCollections, setExpandedCollections] = useState<Record<string, boolean>>({})
  const [isAddCollectionOpen, setIsAddCollectionOpen] = useState(false)
  const [editingCollection, setEditingCollection] = useState<{ id: string; name: string } | null>(null)
  const [editingRequest, setEditingRequest] = useState<{
    collectionId: string
    requestId: string
    name: string
  } | null>(null)

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections((prev) => ({
      ...prev,
      [collectionId]: !prev[collectionId],
    }))
  }

  return (
    <>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Collections</h3>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsAddCollectionOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {collections.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <p>No collections yet</p>
              <Button variant="link" className="mt-1 h-auto p-0" onClick={() => setIsAddCollectionOpen(true)}>
                Create a collection
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {collections.map((collection) => (
                <div key={collection.id} className="space-y-1">
                  <div
                    className="flex items-center justify-between text-sm p-1.5 rounded-md hover:bg-muted cursor-pointer group"
                    onClick={() => toggleCollection(collection.id)}
                  >
                    <div className="flex items-center gap-1">
                      {expandedCollections[collection.id] ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <FolderClosed className="h-4 w-4 text-muted-foreground" />
                      <span className="ml-1">{collection.name}</span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingCollection({ id: collection.id, name: collection.name })}
                        >
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => onDeleteCollection(collection.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {expandedCollections[collection.id] && collection.requests.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {collection.requests.map((request) => (
                        <div
                          key={request.id}
                          className={cn(
                            "flex items-center justify-between text-sm p-1.5 rounded-md cursor-pointer group",
                            activeRequestId === request.id ? "bg-muted" : "hover:bg-muted/50",
                          )}
                          onClick={() => onSelectRequest(request)}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "text-xs px-1.5 py-0.5 rounded font-medium",
                                request.method === "GET"
                                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                                  : request.method === "POST"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : request.method === "PUT"
                                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                      : request.method === "DELETE"
                                        ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                              )}
                            >
                              {request.method}
                            </span>
                            <span className="truncate max-w-[120px]">{request.name}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  setEditingRequest({
                                    collectionId: collection.id,
                                    requestId: request.id,
                                    name: request.name,
                                  })
                                }
                              >
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => onDeleteRequest(collection.id, request.id)}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedCollections[collection.id] && collection.requests.length === 0 && (
                    <div className="ml-6 py-2 text-sm text-muted-foreground">No requests in this collection</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <CollectionDialog
        isOpen={isAddCollectionOpen}
        onClose={() => setIsAddCollectionOpen(false)}
        onSave={onAddCollection}
        title="Add Collection"
      />

      {editingCollection && (
        <CollectionDialog
          isOpen={!!editingCollection}
          onClose={() => setEditingCollection(null)}
          onSave={(name) => onRenameCollection(editingCollection.id, name)}
          title="Rename Collection"
          initialName={editingCollection.name}
        />
      )}

      {editingRequest && (
        <CollectionDialog
          isOpen={!!editingRequest}
          onClose={() => setEditingRequest(null)}
          onSave={(name) => onRenameRequest(editingRequest.collectionId, editingRequest.requestId, name)}
          title="Rename Request"
          initialName={editingRequest.name}
        />
      )}
    </>
  )
}

