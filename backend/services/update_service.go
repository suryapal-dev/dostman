package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

type UpdateService struct {
	currentVersion string
	updateURL      string
	storageDir     string
}

type VersionInfo struct {
	Version     string `json:"version"`
	DownloadURL string `json:"downloadUrl"`
	Notes       string `json:"notes"`
}

func NewUpdateService(version string, updateURL string, storageDir string) *UpdateService {
	return &UpdateService{
		currentVersion: version,
		updateURL:      updateURL,
		storageDir:     storageDir,
	}
}

func (s *UpdateService) CheckForUpdates() (*VersionInfo, error) {
	resp, err := http.Get(s.updateURL)
	if err != nil {
		return nil, fmt.Errorf("failed to check for updates: %v", err)
	}
	defer resp.Body.Close()

	// Example response:
	// {
	//     "version": "1.1.0",
	//     "downloadUrl": "https://downloads.yourdomain.com/dostman/1.1.0/Dostman-Setup.exe",
	//     "notes": "Bug fixes and improvements"
	// }

	var versionInfo VersionInfo
	if err := json.NewDecoder(resp.Body).Decode(&versionInfo); err != nil {
		return nil, fmt.Errorf("failed to parse version info: %v", err)
	}

	// Compare versions
	if versionInfo.Version <= s.currentVersion {
		return nil, nil // No update available
	}

	return &versionInfo, nil
}

func (s *UpdateService) DownloadUpdate(downloadURL string) (string, error) {
	resp, err := http.Get(downloadURL)
	if err != nil {
		return "", fmt.Errorf("failed to download update: %v", err)
	}
	defer resp.Body.Close()

	updateDir := filepath.Join(s.storageDir, "updates")
	if err := os.MkdirAll(updateDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create update directory: %v", err)
	}

	ext := ".exe"
	if runtime.GOOS == "darwin" {
		ext = ".dmg"
	}

	tmpFile := filepath.Join(updateDir, "update"+ext)
	out, err := os.Create(tmpFile)
	if err != nil {
		return "", fmt.Errorf("failed to create temporary file: %v", err)
	}
	defer out.Close()

	if _, err := io.Copy(out, resp.Body); err != nil {
		return "", fmt.Errorf("failed to save update file: %v", err)
	}

	return tmpFile, nil
}

func (s *UpdateService) InstallUpdate(updateFile string) error {
	if runtime.GOOS == "windows" {
		cmd := exec.Command(updateFile, "/SILENT")
		if err := cmd.Start(); err != nil {
			return fmt.Errorf("failed to start installer: %v", err)
		}
		os.Exit(0)
	} else if runtime.GOOS == "darwin" {
		mountPoint := "/Volumes/Dostman"

		cmd := exec.Command("hdiutil", "attach", updateFile)
		if err := cmd.Run(); err != nil {
			return fmt.Errorf("failed to mount DMG: %v", err)
		}

		src := filepath.Join(mountPoint, "Dostman.app")
		dst := "/Applications/Dostman.app"
		cmd = exec.Command("cp", "-R", src, dst)
		if err := cmd.Run(); err != nil {
			return fmt.Errorf("failed to copy application: %v", err)
		}

		cmd = exec.Command("hdiutil", "detach", mountPoint)
		if err := cmd.Run(); err != nil {
			return fmt.Errorf("failed to unmount DMG: %v", err)
		}

		cmd = exec.Command("open", dst)
		if err := cmd.Start(); err != nil {
			return fmt.Errorf("failed to restart application: %v", err)
		}
		os.Exit(0)
	}

	return nil
}
