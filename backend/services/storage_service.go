package services

import (
	"dostman/backend/types"
	"encoding/json"
	"os"
	"path/filepath"
)

type StorageService struct {
	basePath string
}

func NewStorageService(basePath string) *StorageService {
	return &StorageService{
		basePath: basePath,
	}
}

func (s *StorageService) SaveCollections(collections []types.Collection) error {
	data, err := json.Marshal(collections)
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(s.basePath, "collections.json"), data, 0644)
}

func (s *StorageService) LoadCollections() ([]types.Collection, error) {
	data, err := os.ReadFile(filepath.Join(s.basePath, "collections.json"))
	if err != nil {
		if os.IsNotExist(err) {
			return []types.Collection{}, nil
		}
		return nil, err
	}

	var collections []types.Collection
	err = json.Unmarshal(data, &collections)
	return collections, err
}

func (s *StorageService) SaveHistory(history []types.HistoryItem) error {
	data, err := json.Marshal(history)
	if err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(s.basePath, "history.json"), data, 0644)
}

func (s *StorageService) LoadHistory() ([]types.HistoryItem, error) {
	data, err := os.ReadFile(filepath.Join(s.basePath, "history.json"))
	if err != nil {
		if os.IsNotExist(err) {
			return []types.HistoryItem{}, nil
		}
		return nil, err
	}

	var history []types.HistoryItem
	err = json.Unmarshal(data, &history)
	return history, err
}
