import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'
import { ThemeProvider } from "next-themes"

const container = document.getElementById('root')
const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="system" attribute="class">
            <App/>
        </ThemeProvider>
    </React.StrictMode>
)
