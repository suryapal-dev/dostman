export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

export interface JsonViewerProps {
  json: string
}

export interface TreeNodeProps {
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