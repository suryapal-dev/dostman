"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Collection } from "@/components/api-client"

interface SaveRequestDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, collectionId: string) => void
  collections: Collection[]
  initialName?: string
  initialCollectionId?: string
}

export function SaveRequestDialog({
  isOpen,
  onClose,
  onSave,
  collections,
  initialName = "",
  initialCollectionId = "",
}: SaveRequestDialogProps) {
  const [name, setName] = useState(initialName)
  const [collectionId, setCollectionId] = useState(initialCollectionId || collections[0]?.id || "")

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setCollectionId(initialCollectionId || collections[0]?.id || "")
    }
  }, [isOpen, initialName, initialCollectionId, collections])

  const handleSave = () => {
    if (name.trim() && collectionId) {
      onSave(name.trim(), collectionId)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Request</DialogTitle>
          <DialogDescription>Save your request to a collection</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Request Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Request"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="collection">Collection</Label>
            {collections.length > 0 ? (
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger id="collection">
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="text-sm text-muted-foreground">No collections available. Create a collection first.</div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || !collectionId || collections.length === 0}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

