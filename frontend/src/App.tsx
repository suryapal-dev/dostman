import ApiClient from "@/components/api-client"
import { NotificationProvider } from "@/components/notification"

function App() {
    return (
        <NotificationProvider>
            <main className="min-h-screen bg-background">
                <ApiClient />
            </main>
        </NotificationProvider>
    )
}

export default App
