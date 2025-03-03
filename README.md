# Dostman

Dostman is a powerful API client for testing and managing your API requests. Built as a modern desktop application, it provides a native experience with a sleek user interface.

## Technology Stack

- **Backend**: Go with Wails v2
- **Frontend**: React + TypeScript + Vite
- **UI Components**: 
  - Radix UI
  - Tailwind CSS
  - Shadcn/ui
- **State Management**: React Context
- **Build Tools**: 
  - NSIS (Windows installer)
  - Wails CLI

## Prerequisites

- Go 1.23 or later
- Node.js and npm
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)
- For Windows development:
  - Visual Studio Build Tools
  - WebView2 Runtime
- For macOS development:
  - Xcode Command Line Tools

## Setup Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/suryapal-dev/dostman
   cd dostman
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. Start development server:
   ```bash
   wails dev
   ```

This will run a Vite development server with hot reload for frontend changes. Access the dev tools at http://localhost:34115.

## Building for Production

### Windows

```bash
# Build with installer
wails build -platform windows/amd64 -nsis

# Build without installer
wails build -platform windows/amd64

# Build with batch file
build\windows\build.bat
```

### macOS

```bash
wails build -platform darwin/universal
```

Build outputs will be available in the `bin` directory.

## Project Structure

```
├── build/              # Build configurations and assets
│   ├── darwin/         # macOS specific files
│   └── windows/        # Windows specific files
├── frontend/           # React frontend application
│   ├── src/            # Source code
│   └── dist/           # Built frontend files
└── main.go            # Main application entry
```

## Features

- Modern native desktop application
- Cross-platform support (Windows, macOS)
- Dark/Light theme support
- Transparent/translucent window effects
- Native system integration
- Single instance lock
- Custom window management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Contributors

- [Suryapal Rao](https://github.com/suryapal-dev) - Creator & Maintainer

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Wails](https://wails.io/) - For the amazing framework
- [React](https://reactjs.org/) - For the frontend framework
- [Radix UI](https://www.radix-ui.com/) - For the UI components
