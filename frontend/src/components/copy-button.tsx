import { useNotification } from "@/components/notification"
import { Copy } from "lucide-react"

type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

interface CopyData {
  value: JsonValue;
  label: string;
}

export function CopyButton(copyData: CopyData) {
  const showNotification = useNotification()

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation()
    const jsonValue = JSON.stringify(copyData.value, null, 2)
    const jsonString = typeof copyData.value === "object" ? jsonValue : JSON.stringify({[copyData.label]: copyData.value}, null, 2)
    navigator.clipboard.writeText(jsonString)
    showNotification("Copied to clipboard!", "success")
  }

  return (
    <div
      onClick={handleCopy}
      className="ml-1 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
      style={{ display: "ruby", alignItems: "center" }}
    >
      <Copy className="h-3.5 w-3.5" />
    </div>
  )
}
