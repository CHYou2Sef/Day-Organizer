package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestHandleTasksOPTIONS verifies that the /tasks endpoint correctly handles
// preflight OPTIONS requests, which are essential for CORS (Cross-Origin Resource Sharing).
func TestHandleTasksOPTIONS(t *testing.T) {
	// Create a new request with the OPTIONS method
	req, err := http.NewRequest("OPTIONS", "/tasks", nil)
	if err != nil {
		t.Fatal(err)
	}

	// Create a ResponseRecorder to record the response
	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handleTasks)

	// Serve the request
	handler.ServeHTTP(rr, req)

	// Comments: Check for 200 OK status
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Comments: Verify CORS headers are present and correct
	// This ensures the frontend (Next.js) can communicate with the backend
	expectedOrigin := "*"
	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != expectedOrigin {
		t.Errorf("handler returned unexpected Access-Control-Allow-Origin: got %v want %v",
			got, expectedOrigin)
	}

	expectedMethods := "GET, POST, OPTIONS"
	if got := rr.Header().Get("Access-Control-Allow-Methods"); got != expectedMethods {
		t.Errorf("handler returned unexpected Access-Control-Allow-Methods: got %v want %v",
			got, expectedMethods)
	}

	expectedHeaders := "Content-Type"
	if got := rr.Header().Get("Access-Control-Allow-Headers"); got != expectedHeaders {
		t.Errorf("handler returned unexpected Access-Control-Allow-Headers: got %v want %v",
			got, expectedHeaders)
	}
}
