package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandleTasksOPTIONS(t *testing.T) {
	req, err := http.NewRequest("OPTIONS", "/tasks", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(handleTasks)

	handler.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check CORS headers
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
