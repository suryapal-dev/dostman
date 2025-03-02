import { useState, useEffect, useRef } from "react"
import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { JsonViewerProps } from "./types"
import { SearchBar } from "./search-bar"
import { TreeNode } from "./tree-node"

export function JsonViewer({ json }: JsonViewerProps) {
  const [parsedJson, setParsedJson] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandAll, setExpandAll] = useState(false)
  const [forceCollapse, setForceCollapse] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [matchCase, setMatchCase] = useState(false)
  const [matchWholeWord, setMatchWholeWord] = useState(false)
  const [matches, setMatches] = useState<number[]>([])
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

  const handleCollapseAll = () => {
    setExpandAll(false)
    setForceCollapse(true)
    setTimeout(() => setForceCollapse(false), 0)
  }

  if (error) {
    return <div className="p-4 text-sm font-mono whitespace-pre-wrap break-words">{json}</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-2 border-b">
        <SearchBar
          searchTerm={searchTerm}
          matchCase={matchCase}
          matchWholeWord={matchWholeWord}
          matches={matches}
          currentMatchIndex={currentMatchIndex}
          onSearchChange={setSearchTerm}
          onMatchCaseToggle={() => setMatchCase(!matchCase)}
          onMatchWholeWordToggle={() => setMatchWholeWord(!matchWholeWord)}
          onNextMatch={() => setCurrentMatchIndex((prev) => (prev + 1) % matches.length)}
          onPreviousMatch={() => setCurrentMatchIndex((prev) => (prev - 1 + matches.length) % matches.length)}
        />
        <Button variant="outline" size="sm" onClick={() => setExpandAll(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={handleCollapseAll}>
          <Minus className="h-3.5 w-3.5 mr-1" />
          Collapse All
        </Button>
      </div>
      <ScrollArea 
        ref={scrollAreaRef} 
        className="flex-1 overflow-auto"
      >
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
              scrollToMatch={(index) => setCurrentMatchIndex(index)}
            />
          )}
        </div>
        <div style={{ paddingBlockStart: "16rem" }}></div>
      </ScrollArea>
    </div>
  )
}
