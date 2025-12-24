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

	_ "github.com/lib/pq"
)

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
	conn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("DB_HOST"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_NAME"))
	
	var err error
	for i := 0; i < 5; i++ { // Retry logic for container startup
		if db, err = sql.Open("postgres", conn); err == nil && db.Ping() == nil { break }
		time.Sleep(2 * time.Second)
	}
	if err != nil { log.Fatal("DB Fail:", err) }

	db.Exec(`CREATE TABLE IF NOT EXISTS tasks (id SERIAL PRIMARY KEY, title TEXT, description TEXT, priority INT, start_time TEXT, end_time TEXT)`)

	http.Handle("/tasks", middleware(handleTasks))
	http.HandleFunc("/metrics", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("active_tasks 1")) })

	log.Println("Server :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func middleware(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		reqID := rand.Intn(99999)
		w.Header().Set("X-Request-ID", fmt.Sprintf("%d", reqID))
		next(w, r)
		log.Printf("id=%d method=%s path=%s dur=%v", reqID, r.Method, r.URL.Path, time.Since(start))
	})
}

func handleTasks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method == "GET" {
		rows, err := db.Query("SELECT id::text, title, description, priority, start_time, end_time FROM tasks")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()
		tasks := []Task{}
		for rows.Next() {
			var t Task
			rows.Scan(&t.ID, &t.Title, &t.Description, &t.Priority, &t.Start, &t.End)
			tasks = append(tasks, t)
		}
		json.NewEncoder(w).Encode(tasks)
	} else if r.Method == "POST" {
		var t Task
		err := json.NewDecoder(r.Body).Decode(&t)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err = db.Exec("INSERT INTO tasks (title, description, priority, start_time, end_time) VALUES ($1, $2, $3, $4, $5)", t.Title, t.Description, t.Priority, t.Start, t.End)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}