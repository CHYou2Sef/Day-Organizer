package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// Task represents a single item in the organizer
type Task struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    int    `json:"priority"`
	Start       string `json:"start"`
	End         string `json:"end"`
}

var db *sql.DB

func main() {
	// Build connection string from environment variables
	conn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))

	var err error
	// Retry logic to ensure the database container is ready before connecting
	for i := 0; i < 5; i++ {
		if db, err = sql.Open("postgres", conn); err == nil && db.Ping() == nil {
			break
		}
		log.Println("Waiting for database...")
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatal("Could not connect to database:", err)
	}

	// Ensure the tasks table exists
	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS tasks (
		id SERIAL PRIMARY KEY, 
		title TEXT, 
		description TEXT, 
		priority INT, 
		start_time TEXT, 
		end_time TEXT
	)`)
	if err != nil {
		log.Fatal("Could not initialize database table:", err)
	}

	// Register routes
	http.Handle("/tasks", middleware(handleTasks))
	http.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("active_tasks 1")) // Simple health/metrics endpoint
	})

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

// middleware logs each request and adds a request ID
func middleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		reqID := rand.Intn(99999)
		w.Header().Set("X-Request-ID", fmt.Sprintf("%d", reqID))
		next(w, r)
		log.Printf("id=%d method=%s path=%s duration=%v", reqID, r.Method, r.URL.Path, time.Since(start))
	})
}

// handleTasks handles both GET (list) and POST (create) for tasks
func handleTasks(w http.ResponseWriter, r *http.Request) {
	// Enable CORS for frontend interaction
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == "GET" {
		// Fetch all tasks from the database
		rows, err := db.Query("SELECT id::text, title, description, priority, start_time, end_time FROM tasks")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		tasks := []Task{}
		for rows.Next() {
			var t Task
			err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Priority, &t.Start, &t.End)
			if err != nil {
				log.Println("Scan error:", err)
				continue
			}
			tasks = append(tasks, t)
		}
		json.NewEncoder(w).Encode(tasks)

	} else if r.Method == "POST" {
		// Create a new task
		var t Task
		err := json.NewDecoder(r.Body).Decode(&t)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = db.Exec("INSERT INTO tasks (title, description, priority, start_time, end_time) VALUES ($1, $2, $3, $4, $5)",
			t.Title, t.Description, t.Priority, t.Start, t.End)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}
