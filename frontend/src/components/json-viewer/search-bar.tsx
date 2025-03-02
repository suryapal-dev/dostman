import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, CaseSensitive, WholeWord } from "lucide-react"

interface SearchBarProps {
  searchTerm: string
  matchCase: boolean
  matchWholeWord: boolean
  matches: number[]
  currentMatchIndex: number
  onSearchChange: (value: string) => void
  onMatchCaseToggle: () => void
  onMatchWholeWordToggle: () => void
  onNextMatch: () => void
  onPreviousMatch: () => void
}

export function SearchBar({
  searchTerm,
  matchCase,
  matchWholeWord,
  matches,
  currentMatchIndex,
  onSearchChange,
  onMatchCaseToggle,
  onMatchWholeWordToggle,
  onNextMatch,
  onPreviousMatch
}: SearchBarProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex items-center gap-2">
      <input
        ref={searchInputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder=" Search..."
        className="flex-1 p-1 border rounded"
      />
      {searchTerm && (
        <>
          <Button 
            variant={matchCase ? "destructive" : "outline"} 
            size="sm" 
            onClick={onMatchCaseToggle}
          >
            <CaseSensitive className="h-5 w-5" />
          </Button>
          <Button 
            variant={matchWholeWord ? "destructive" : "outline"} 
            size="sm" 
            onClick={onMatchWholeWordToggle}
          >
            <WholeWord className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onPreviousMatch}>
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            </Button>
            <span>
              {matches.length > 0 ? `${currentMatchIndex + 1} / ${matches.length}` : "0 / 0"}
            </span>
            <Button variant="outline" size="sm" onClick={onNextMatch}>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}