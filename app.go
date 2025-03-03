package main

import (
	"context"
	"os"
	"path/filepath"

	"dostman/backend/services"
	"dostman/backend/types"
)

type App struct {
	ctx            context.Context
	apiService     *services.APIService
	storageService *services.StorageService
	updateService  *services.UpdateService
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.apiService = services.NewAPIService()

	homeDir, err := os.UserHomeDir()
	if err != nil {
		homeDir = "."
	}
	storageDir := filepath.Join(homeDir, ".dostman")
	os.MkdirAll(storageDir, 0755)

	a.storageService = services.NewStorageService(storageDir)

	updateURL := "https://localhost:13414322/updates"
	version := "1.0.0"
	a.updateService = services.NewUpdateService(version, updateURL, storageDir)
}

func (a *App) shutdown(ctx context.Context) {
	if a.storageService != nil {
	}
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

func (a *App) MoveRequest(payload types.MoveRequestPayload) error {
	collections, err := a.storageService.LoadCollections()
	if err != nil {
		return err
	}

	var request *types.RequestData
	for i, col := range collections {
		if col.ID == payload.FromCollectionId {
			for j, req := range col.Requests {
				if req.ID == payload.RequestId {
					request = &req
					collections[i].Requests = append(collections[i].Requests[:j], collections[i].Requests[j+1:]...)
					break
				}
			}
		}
	}

	if request != nil {
		for i, col := range collections {
			if col.ID == payload.ToCollectionId {
				collections[i].Requests = append(collections[i].Requests, *request)
				break
			}
		}
	}

	return a.storageService.SaveCollections(collections)
}

func (a *App) CheckForUpdates() (*services.VersionInfo, error) {
	return a.updateService.CheckForUpdates()
}

func (a *App) DownloadAndInstallUpdate(downloadURL string) error {
	updateFile, err := a.updateService.DownloadUpdate(downloadURL)
	if err != nil {
		return err
	}
	return a.updateService.InstallUpdate(updateFile)
}
