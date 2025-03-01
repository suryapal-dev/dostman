import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface KeyValueItem {
  key: string
  value: string
  enabled: boolean
}

interface KeyValueEditorProps {
  items: KeyValueItem[]
  onChange: (items: KeyValueItem[]) => void
  addButtonText?: string
}

export function KeyValueEditor({ items, onChange, addButtonText = "Add Item" }: KeyValueEditorProps) {
  const handleAddItem = () => {
    onChange([...items, { key: "", value: "", enabled: true }])
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    onChange(newItems)
  }

  const handleItemChange = (index: number, field: keyof KeyValueItem, value: string | boolean) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange(newItems)
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No items added yet</div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Checkbox
                  checked={item.enabled}
                  onCheckedChange={(checked) => handleItemChange(index, "enabled", !!checked)}
                />
                <Input
                  value={item.key}
                  onChange={(e) => handleItemChange(index, "key", e.target.value)}
                  placeholder="Key"
                  className="flex-1"
                />
                <Input
                  value={item.value}
                  onChange={(e) => handleItemChange(index, "value", e.target.value)}
                  placeholder="Value"
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      <div className="pt-4">
        <Button variant="outline" size="sm" className="w-full" onClick={handleAddItem}>
          <Plus className="h-4 w-4 mr-2" />
          {addButtonText}
        </Button>
      </div>
    </div>
  )
}

