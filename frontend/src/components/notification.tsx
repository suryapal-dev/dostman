import { useEffect, useState, createContext, useContext } from "react"
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationProps {
  message: string
  type: "success" | "warning" | "info" | "error"
  onClose: () => void
}

const NotificationContext = createContext<(message: string, type: "success" | "warning" | "info" | "error") => void>(() => {})

export const useNotification = () => useContext(NotificationContext)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notification, setNotification] = useState<NotificationProps | null>(null)

  const showNotification = (message: string, type: "success" | "warning" | "info" | "error") => {
    setNotification({ message, type, onClose: () => setNotification(null) })
    setTimeout(() => setNotification(null), 2000)
  }

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      {notification && <Notification {...notification} />}
    </NotificationContext.Provider>
  )
}

function Notification({ message, type, onClose }: NotificationProps) {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 flex items-center gap-2 p-4 rounded shadow-lg transition-transform transform",
        type === "success" && "bg-green-100 text-green-800",
        type === "warning" && "bg-yellow-100 text-yellow-800",
        type === "info" && "bg-blue-100 text-blue-800",
        type === "error" && "bg-red-100 text-red-800"
      )}
    >
      {getIcon()}
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-700">
        <XCircle className="h-5 w-5" />
      </button>
    </div>
  )
}
