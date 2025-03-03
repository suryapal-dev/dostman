@echo off
setlocal enabledelayedexpansion

:: Set version
set VERSION=1.0.0

:: Clean previous builds
echo Cleaning previous builds...
rd /s /q ..\..\bin 2>nul
mkdir ..\..\bin

:: Build the application
echo Building Dostman v%VERSION%...
wails build -platform windows/amd64 -nsis

echo Build complete! Output files in bin directory:
dir /b ..\..\bin

exit /b 0