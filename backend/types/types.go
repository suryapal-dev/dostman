package types

type HttpMethod string

const (
	GET     HttpMethod = "GET"
	POST    HttpMethod = "POST"
	PUT     HttpMethod = "PUT"
	DELETE  HttpMethod = "DELETE"
	PATCH   HttpMethod = "PATCH"
	OPTIONS HttpMethod = "OPTIONS"
	HEAD    HttpMethod = "HEAD"
)

type KeyValue struct {
	Key     string `json:"key"`
	Value   string `json:"value"`
	Enabled bool   `json:"enabled"`
}

type RequestData struct {
	ID       string     `json:"id"`
	Name     string     `json:"name"`
	URL      string     `json:"url"`
	Method   HttpMethod `json:"method"`
	Headers  []KeyValue `json:"headers"`
	Params   []KeyValue `json:"params"`
	Body     string     `json:"body"`
	BodyType string     `json:"bodyType"`
}

type ResponseData struct {
	Status      int               `json:"status"`
	StatusText  string            `json:"statusText"`
	Time        int64             `json:"time"`
	Size        string            `json:"size"`
	Headers     map[string]string `json:"headers"`
	Body        string            `json:"body"`
	ContentType string            `json:"contentType"`
}

type Collection struct {
	ID       string        `json:"id"`
	Name     string        `json:"name"`
	Requests []RequestData `json:"requests"`
}

type HistoryItem struct {
	ID        string       `json:"id"`
	Request   RequestData  `json:"request"`
	Response  ResponseData `json:"response"`
	Timestamp int64        `json:"timestamp"`
}
