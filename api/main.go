package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	// A simple health check route
	http.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "*") // Allow frontend to call this
		json.NewEncoder(w).Encode(map[string]string{
			"status": "Success",
			"message": "Go Backend is running perfectly!",
		})
	})

	log.Println("Go Server is starting on http://localhost:8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
