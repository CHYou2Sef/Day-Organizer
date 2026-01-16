package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"os"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	_ "github.com/lib/pq" // PostgreSQL driver
)

// Observability: Define Prometheus metrics to track application performance.
// These variables act as collectors that will aggregate data in memory.

// httpDuration tracks the latency of HTTP requests.
// We use a Histogram because it's best for measuring distribution of duration (e.g., 95th percentile).
var (
	httpDuration = promauto.NewHistogramVec(prometheus.HistogramOpts{
		Name: "http_request_duration_seconds", // Metric name in Prometheus
		Help: "Duration of HTTP requests.",    // Description for the metric
	}, []string{"path"}) // Label by 'path' to distinguish between endpoints (e.g., /tasks)

	// activeTasks tracks the total number of lists/tasks active in the system (mocked for now).
	// usage: activeTasks.Set(float64(count))
	activeTasks = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "dayorg_active_tasks_count",
		Help: "The total number of active tasks in the database",
	})
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
	/*
	http.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) {
		_, err := w.Write([]byte("active_tasks 1")) // Simple health/metrics endpoint
		if err != nil {
			log.Printf("Failed to write metrics: %v", err)
		}
	})*/
	// Observability: Expose the standard Prometheus metrics endpoint.
	// This handler will be scraped by the Prometheus server defined in prometheus.yml.
	http.Handle("/metrics", promhttp.Handler())

	log.Println("Server starting on :8080")
	server := &http.Server{
		Addr:         ":8080",
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		Handler:      nil, // Uses http.DefaultServeMux
	}
	log.Fatal(server.ListenAndServe())
}

// middleware logs each request and adds a request ID
func middleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		// G404 fix: Use crypto/rand for secure IDs
		nBig, err := rand.Int(rand.Reader, big.NewInt(99999))
		reqID := int64(0)
		if err == nil {
			reqID = nBig.Int64()
		}
		w.Header().Set("X-Request-ID", fmt.Sprintf("%d", reqID))
		// Observability: Start timer to measure request duration
		timer := prometheus.NewTimer(httpDuration.WithLabelValues(r.URL.Path))
		// Defer the observation until the request is finished
		defer timer.ObserveDuration()

		next(w, r)
		log.Printf("id=%d method=%s path=%s duration=%v", reqID, r.Method, r.URL.Path, time.Since(start))
	})
}

// handleTasks handles both GET (list) and POST (create) for tasks
func handleTasks(w http.ResponseWriter, r *http.Request) {
	// Enable CORS for frontend interaction
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
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
		if err := json.NewEncoder(w).Encode(tasks); err != nil {
			log.Printf("Encoding error: %v", err)
		}

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
		// Observability: Increment the mock active task gauge (simplified for demo)
		activeTasks.Inc()
	} else if r.Method == "PUT" {
		// Update an existing task
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "id is required", http.StatusBadRequest)
			return
		}
		var t Task
		err := json.NewDecoder(r.Body).Decode(&t)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = db.Exec("UPDATE tasks SET title=$1, description=$2, priority=$3, start_time=$4, end_time=$5 WHERE id=$6",
			t.Title, t.Description, t.Priority, t.Start, t.End, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	} else if r.Method == "DELETE" {
		// Delete a task by ID
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "id is required", http.StatusBadRequest)
			return
		}
		_, err := db.Exec("DELETE FROM tasks WHERE id = $1", id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		// Observability: Decrement the mock active task gauge
		activeTasks.Dec()
	}
}
