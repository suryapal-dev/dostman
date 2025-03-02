import { Copy } from "lucide-react"

type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

interface CopyData {
  value: JsonValue;
  label: string;
}

export function CopyButton(copyData: CopyData) {
  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation()
    const jsonValue = JSON.stringify(copyData.value, null, 2)
    const jsonString = typeof copyData.value === "object" ? jsonValue : JSON.stringify({[copyData.label]: copyData.value}, null, 2)
    navigator.clipboard.writeText(jsonString)
  }

  return (
    <div
      onClick={handleCopy}
      className="ml-1 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
      style={{ display: "inline-flex", alignItems: "center" }}
    >
      <Copy className="h-3.5 w-3.5" />
    </div>
  )
}
