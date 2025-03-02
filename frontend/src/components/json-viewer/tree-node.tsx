import { useState, useEffect, useRef } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { CopyButton } from "@/components/copy-button"
import type { TreeNodeProps } from "./types"

export function TreeNode({
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
      setExpanded(true)
      matchRefs.current[currentMatchIndex]?.scrollIntoView({ 
        behavior: "smooth", 
        block: "center" 
      })
    }
  }, [currentMatchIndex, matches])

  const toggleExpanded = () => setExpanded(!expanded)

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
      ) : part
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
              <span className={isArray ? "text-blue-600" : "text-red-600"}>
                {highlightMatch(label)}
              </span>
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