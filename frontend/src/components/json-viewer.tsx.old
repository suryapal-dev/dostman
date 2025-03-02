import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight, Plus, Minus, ChevronUp, CaseSensitive, WholeWord } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CopyButton } from "@/components/copy-button"

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
  forceCollapse?: boolean
  searchTerm?: string
  matchCase?: boolean
  matchWholeWord?: boolean
  currentMatchIndex?: number
  matches?: number[]
  scrollToMatch?: (index: number) => void
}

export function JsonViewer({ json }: JsonViewerProps) {
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandAll, setExpandAll] = useState(false)
  const [forceCollapse, setForceCollapse] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [matchCase, setMatchCase] = useState(false)
  const [matchWholeWord, setMatchWholeWord] = useState(false)
  const [matches, setMatches] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([])
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (searchTerm) {
      const flags = matchCase ? "g" : "gi"
      const wordBoundary = matchWholeWord ? "\\b" : ""
      const regex = new RegExp(`${wordBoundary}${searchTerm}${wordBoundary}`, flags)
      const matchIndices = []
      let match
      while ((match = regex.exec(json)) !== null) {
        matchIndices.push(match.index)
      }
      setMatches(matchIndices)
      setCurrentMatchIndex(0)
    } else {
      setMatches([])
      setCurrentMatchIndex(0)
    }
  }, [searchTerm, matchCase, matchWholeWord, json])

  useEffect(() => {
    if (matches.length > 0 && matchRefs.current[currentMatchIndex]) {
      const scrollArea = scrollAreaRef.current;
      const matchElement = matchRefs.current[currentMatchIndex];
      if (scrollArea && matchElement) {
        const scrollAreaRect = scrollArea.getBoundingClientRect();
        const matchRect = matchElement.getBoundingClientRect();
        if (matchRect.top < scrollAreaRect.top || matchRect.bottom > scrollAreaRect.bottom) {
          matchElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [currentMatchIndex, matches]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleMatchCaseToggle = () => {
    setMatchCase(!matchCase)
  }

  const handleMatchWholeWordToggle = () => {
    setMatchWholeWord(!matchWholeWord)
  }

  const handleNextMatch = () => {
    setCurrentMatchIndex((prevIndex) => (prevIndex + 1) % matches.length)
  }

  const handlePreviousMatch = () => {
    setCurrentMatchIndex((prevIndex) => (prevIndex - 1 + matches.length) % matches.length)
  }

  if (error) {
    return <div className="p-4 text-sm font-mono whitespace-pre-wrap break-words">{json}</div>
  }

  const handleCollapseAll = () => {
    setExpandAll(false)
    setForceCollapse(true)
    setTimeout(() => setForceCollapse(false), 0)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b">
        <div className="flex items-center gap-2">
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder=" Search..."
            className="flex-1 p-1 border rounded"
          />
          {searchTerm ? (
            <>
            <Button variant={matchCase ? "destructive" : "outline"} size="sm" onClick={handleMatchCaseToggle}>
              <CaseSensitive className="h-5 w-5" />
            </Button>
            <Button variant={matchWholeWord ? "destructive" : "outline"} size="sm" onClick={handleMatchWholeWordToggle}>
              <WholeWord className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMatch}>
                <ChevronUp className="h-5 w-5 text-muted-foreground" />
              </Button>
              <span>{matches.length > 0 ? `${currentMatchIndex + 1} / ${matches.length}` : "0 / 0"}</span>
              <Button variant="outline" size="sm" onClick={handleNextMatch}>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
            </>
          ) : null}
        </div>
        <Button variant="outline" size="sm" onClick={() => setExpandAll(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={handleCollapseAll}>
          <Minus className="h-3.5 w-3.5 mr-1" />
          Collapse All
        </Button>
      </div>
      <ScrollArea ref={scrollAreaRef} className="flex-1 overflow-auto">
        <div className="p-2 font-mono text-sm">
          {parsedJson !== null && (
            <TreeNode
              label="root"
              value={parsedJson}
              level={0}
              isLast={true}
              defaultExpanded={expandAll}
              forceCollapse={forceCollapse}
              searchTerm={searchTerm}
              matchCase={matchCase}
              matchWholeWord={matchWholeWord}
              currentMatchIndex={currentMatchIndex}
              matches={matches}
              scrollToMatch={(index) => matchRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })}
            />
          )}
        </div>
        <div style={{ paddingBlockStart: "16rem" }}></div>
      </ScrollArea>
    </div>
  )
}

function TreeNode({
  label,
  value,
  level,
  isLast,
  defaultExpanded = false,
  forceCollapse = false,
  searchTerm = "",
  matchCase = false,
  matchWholeWord = false,
  currentMatchIndex = 0,
  matches = [],
  scrollToMatch
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const isObject = value !== null && typeof value === "object"
  const isArray = Array.isArray(value)
  const hasChildren = isObject && Object.keys(value).length > 0
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    setExpanded(defaultExpanded)
  }, [defaultExpanded])

  useEffect(() => {
    if (forceCollapse) {
      setExpanded(false)
    }
  }, [forceCollapse])

  useEffect(() => {
    if (matches.length > 0 && matchRefs.current[currentMatchIndex]) {
      setExpanded(true); // Automatically expand the node
      matchRefs.current[currentMatchIndex]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentMatchIndex, matches]);

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const highlightMatch = (text: string) => {
    if (!searchTerm) return text
    const flags = matchCase ? "g" : "gi"
    const wordBoundary = matchWholeWord ? "\\b" : ""
    const regex = new RegExp(`(${wordBoundary}${searchTerm}${wordBoundary})`, flags)
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          ref={(el) => (matchRefs.current[index] = el)}
          className={matches[currentMatchIndex] === index ? "bg-yellow-300" : "bg-yellow-100"}
        >
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const renderValue = () => {
    if (value === null) return <span className="text-gray-500">null</span>
    if (typeof value === "string") return <span className="text-green-600">{highlightMatch(`"${value}"`)}</span>
    if (typeof value === "number") return <span className="text-blue-600">{highlightMatch(value.toString())}</span>
    if (typeof value === "boolean") return <span className="text-purple-600">{highlightMatch(value.toString())}</span>
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
            forceCollapse={forceCollapse}
            searchTerm={searchTerm}
            matchCase={matchCase}
            matchWholeWord={matchWholeWord}
            currentMatchIndex={currentMatchIndex}
            matches={matches}
            scrollToMatch={scrollToMatch}
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

        <div className="flex items-center">
          {label !== "root" && (
            <>
              <span className={isArray ? "text-blue-600" : "text-red-600"}>{highlightMatch(label)}</span>
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
          <CopyButton value={value} label={label} />
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

