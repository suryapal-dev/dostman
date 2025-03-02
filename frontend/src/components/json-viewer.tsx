import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface JsonViewerProps {
  json: string
}

type JsonValue = string | number | boolean | null | JsonObject | JsonArray
type JsonObject = { [key: string]: JsonValue }
type JsonArray = JsonValue[]

interface TreeNodeProps {
  label: string
  value: JsonValue
  level: number
  isLast: boolean
  defaultExpanded?: boolean
}

export function JsonViewer({ json }: JsonViewerProps) {
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandAll, setExpandAll] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  useEffect(() => {
    try {
      const parsed = JSON.parse(json)
      setParsedJson(parsed)
      setError(null)
    } catch (e) {
      setError("Invalid JSON")
      setParsedJson(null)
    }
  }, [json])

  if (error) {
    return <div className="p-4 text-sm font-mono whitespace-pre-wrap break-words">{json}</div>
  }

  const handleShowFormatOrRaw = () => {
    setShowRaw(!showRaw)
    setExpandAll(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b">
        <Button variant="outline" size="sm" onClick={handleShowFormatOrRaw}>
          {showRaw ? "Show Formatted" : "Show Raw"}
        </Button>
        {!showRaw && (
          <>
            <Button variant="outline" size="sm" onClick={() => setExpandAll(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExpandAll(false)}>
              <Minus className="h-3.5 w-3.5 mr-1" />
              Collapse All
            </Button>
          </>
        )}
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 font-mono text-sm">
          {showRaw ? (
            <pre className="whitespace-pre-wrap break-words text-start">{json}</pre>
          ) : (parsedJson !== null && (
            <TreeNode
              label="root"
              value={parsedJson}
              level={0}
              isLast={true}
              defaultExpanded={expandAll}
            />
          )
          )}
        </div>
        <div style={{ paddingBlockStart: "13rem" }}></div>
      </ScrollArea>
    </div>
  )
}

function TreeNode({ label, value, level, isLast, defaultExpanded = false }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const isObject = value !== null && typeof value === "object"
  const isArray = Array.isArray(value)
  const hasChildren = isObject && Object.keys(value).length > 0

  useEffect(() => {
    setExpanded(defaultExpanded)
  }, [defaultExpanded])

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const renderValue = () => {
    if (value === null) return <span className="text-gray-500">null</span>
    if (typeof value === "string") return <span className="text-green-600">"{value}"</span>
    if (typeof value === "number") return <span className="text-blue-600">{value}</span>
    if (typeof value === "boolean") return <span className="text-purple-600">{value.toString()}</span>
    return null
  }

  const renderChildren = () => {
    if (!isObject || !expanded) return null

    const entries = Object.entries(value)
    return (
      <div className="ml-4">
        {entries.map(([key, val], index) => (
          <TreeNode
            key={key}
            label={isArray ? index.toString() : key}
            value={val}
            level={level + 1}
            isLast={index === entries.length - 1}
            defaultExpanded={defaultExpanded}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="my-1 text-start">
      <div
        className="flex items-start hover:bg-muted/50 rounded px-1 cursor-pointer"
        onClick={hasChildren ? toggleExpanded : undefined}
      >
        <div className="mr-1 mt-0.5">
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )
          ) : (
            <span className="inline-block w-3.5" />
          )}
        </div>

        <div>
          {label !== "root" && (
            <>
              <span className={isArray ? "text-blue-600" : "text-red-600"}>{label}</span>
              <span className="text-muted-foreground mx-1">:</span>
            </>
          )}

          {isObject ? (
            <>
              <span className="text-muted-foreground">{isArray ? "[" : "{"}</span>
              {!expanded && (
                <>
                  <span className="text-muted-foreground">
                    {Object.keys(value).length} {Object.keys(value).length === 1 ? "item" : "items"}
                  </span>
                  <span className="text-muted-foreground">{isArray ? "]" : "}"}</span>
                </>
              )}
            </>
          ) : (
            renderValue()
          )}
        </div>
      </div>

      {renderChildren()}

      {isObject && expanded && (
        <div className="ml-1">
          <span className="text-muted-foreground">{isArray ? "]" : "}"}</span>
        </div>
      )}
    </div>
  )
}

