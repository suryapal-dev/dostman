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
	// First load existing collections
	existingCollections, err := s.LoadCollections()
	if err != nil && !os.IsNotExist(err) {
		return err
	}

	// Create a map of existing collections by ID
	collectionMap := make(map[string]types.Collection)
	for _, col := range existingCollections {
		collectionMap[col.ID] = col
	}

	// Update or add new collections
	for _, col := range collections {
		collectionMap[col.ID] = col
	}

	// Convert map back to slice
	finalCollections := make([]types.Collection, 0, len(collectionMap))
	for _, col := range collectionMap {
		finalCollections = append(finalCollections, col)
	}

	// Save to file
	data, err := json.Marshal(finalCollections)
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
	// First load existing history
	existingHistory, err := s.LoadHistory()
	if err != nil && !os.IsNotExist(err) {
		return err
	}

	// Combine new history items with existing ones
	// Keep only the most recent 100 items
	allHistory := append(history, existingHistory...)
	if len(allHistory) > 100 {
		allHistory = allHistory[:100]
	}

	// Save to file
	data, err := json.Marshal(allHistory)
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
