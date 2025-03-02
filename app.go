package main

import (
	"context"
	"os"
	"path/filepath"

	"dostman/backend/services"
	"dostman/backend/types"
)

// App struct
type App struct {
	ctx            context.Context
	apiService     *services.APIService
	storageService *services.StorageService
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.apiService = services.NewAPIService()

	// Get user's home directory for storage
	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = "."
	}
	storageDir := filepath.Join(homeDir, ".apiforge")
	os.MkdirAll(storageDir, 0755)

	a.storageService = services.NewStorageService(storageDir)
}

// Frontend-facing methods
func (a *App) SendRequest(request types.RequestData) (*types.ResponseData, error) {
	return a.apiService.SendRequest(request)
}

func (a *App) SaveCollections(collections []types.Collection) error {
	return a.storageService.SaveCollections(collections)
}

func (a *App) LoadCollections() ([]types.Collection, error) {
	return a.storageService.LoadCollections()
}

func (a *App) SaveHistory(history []types.HistoryItem) error {
	return a.storageService.SaveHistory(history)
}

func (a *App) LoadHistory() ([]types.HistoryItem, error) {
	return a.storageService.LoadHistory()
}

func (a *App) DeleteAllHistory() error {
	return a.storageService.DeleteAllHistory()
}
