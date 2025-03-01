package services

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"dostman/backend/types"
)

type APIService struct {
	client *http.Client
}

func NewAPIService() *APIService {
	return &APIService{
		client: &http.Client{
			Timeout: time.Second * 30,
		},
	}
}

func (s *APIService) SendRequest(req types.RequestData) (*types.ResponseData, error) {
	// Build URL with query parameters
	baseURL, err := url.Parse(req.URL)
	if err != nil {
		return nil, fmt.Errorf("invalid URL: %w", err)
	}

	// Add query parameters
	q := baseURL.Query()
	for _, param := range req.Params {
		if param.Enabled && param.Key != "" {
			q.Add(param.Key, param.Value)
		}
	}
	baseURL.RawQuery = q.Encode()

	// Create request
	var bodyReader io.Reader
	if req.Method != types.GET && req.Method != types.HEAD && req.BodyType != "none" {
		bodyReader = bytes.NewBufferString(req.Body)
	}

	httpReq, err := http.NewRequest(string(req.Method), baseURL.String(), bodyReader)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	// Add headers
	for _, header := range req.Headers {
		if header.Enabled && header.Key != "" {
			httpReq.Header.Add(header.Key, header.Value)
		}
	}

	// Add content type header for body
	if req.BodyType == "json" {
		httpReq.Header.Set("Content-Type", "application/json")
	}

	startTime := time.Now()
	resp, err := s.client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %w", err)
	}

	// Build response headers map
	headers := make(map[string]string)
	for k, v := range resp.Header {
		if len(v) > 0 {
			headers[k] = v[0]
		}
	}

	return &types.ResponseData{
		Status:      resp.StatusCode,
		StatusText:  resp.Status,
		Time:        time.Since(startTime).Milliseconds(),
		Size:        fmt.Sprintf("%d B", len(body)),
		Headers:     headers,
		Body:        string(body),
		ContentType: resp.Header.Get("Content-Type"),
	}, nil
}
