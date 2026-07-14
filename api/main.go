package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

// ─── Environment Loading ───────────────────────────────────────────
func loadEnv() {
	paths := []string{"../.env.local", "../.env", ".env"}
	for _, path := range paths {
		file, err := os.Open(path)
		if err != nil {
			continue
		}
		defer file.Close()

		scanner := bufio.NewScanner(file)
		for scanner.Scan() {
			line := strings.TrimSpace(scanner.Text())
			if line == "" || strings.HasPrefix(line, "#") {
				continue
			}
			parts := strings.SplitN(line, "=", 2)
			if len(parts) == 2 {
				key := strings.TrimSpace(parts[0])
				val := strings.TrimSpace(parts[1])
				if strings.HasPrefix(val, "\"") && strings.HasSuffix(val, "\"") {
					val = val[1 : len(val)-1]
				}
				if strings.HasPrefix(val, "'") && strings.HasSuffix(val, "'") {
					val = val[1 : len(val)-1]
				}
				os.Setenv(key, val)
			}
		}
		log.Printf("Loaded env from %s", path)
	}
}

// ─── Redis Initialization ──────────────────────────────────────────
var rdb *redis.Client

var firebaseAuth *auth.Client

func initFirebase() {
	opt := option.WithCredentialsJSON([]byte(os.Getenv("FIREBASE_SERVICE_ACCOUNT_JSON")))
	// If the environment variable isn't set (e.g., they didn't provide a service account),
	// we will try to initialize with default Application Default Credentials (ADC).
	var app *firebase.App
	var err error
	if os.Getenv("FIREBASE_SERVICE_ACCOUNT_JSON") != "" {
		app, err = firebase.NewApp(context.Background(), nil, opt)
	} else {
		app, err = firebase.NewApp(context.Background(), nil)
	}
	
	if err != nil {
		log.Printf("⚠️ Firebase Admin SDK initialization failed: %v. Custom tokens will not work.", err)
		return
	}

	firebaseAuth, err = app.Auth(context.Background())
	if err != nil {
		log.Printf("⚠️ Firebase Auth initialization failed: %v", err)
	} else {
		log.Println("🔥 Firebase Admin SDK initialized successfully.")
	}
}

func initRedis() {
	redisUrl := os.Getenv("REDIS_URL")
	if redisUrl == "" {
		redisUrl = "localhost:6379"
	}
	rdb = redis.NewClient(&redis.Options{
		Addr: redisUrl,
	})
	
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️ Redis not connected (%s). Rate limiting will be bypassed.", redisUrl)
		rdb = nil
	} else {
		log.Printf("🛡️ Redis connected at %s. Rate limiting enabled.", redisUrl)
	}
}

// ─── DB Interface & Implementations ────────────────────────────────
type DBClient interface {
	GetUserProfile(ctx context.Context, userID string) (map[string]interface{}, error)
	UpdateUserProfile(ctx context.Context, userID string, updates map[string]interface{}) (map[string]interface{}, error)
	GetTracks(ctx context.Context) ([]map[string]interface{}, error)
	AddTrack(ctx context.Context, track map[string]interface{}) error
	UpdateTrack(ctx context.Context, id string, updates map[string]interface{}) error
	DeleteTrack(ctx context.Context, id string) error
	GetContests(ctx context.Context) ([]map[string]interface{}, error)
	AddContest(ctx context.Context, contest map[string]interface{}) error
	UpdateContest(ctx context.Context, id string, updates map[string]interface{}) error
	DeleteContest(ctx context.Context, id string) error
}

// 1. Direct PG Driver Client
type PostgresDBClient struct {
	pool *pgxpool.Pool
}

func (c *PostgresDBClient) GetUserProfile(ctx context.Context, userID string) (map[string]interface{}, error) {
	row := c.pool.QueryRow(ctx, `
		SELECT id, email, name, first_name, last_name, avatar, xp, streak, onboarding_completed, lessons_completed, 
		completed_lesson_ids, unlocked_lesson_ids, activity_log, activity_history, last_active_at, created_at 
		FROM public.users WHERE id = $1
	`, userID)

	var id, email, name, firstName, lastName, avatar *string
	var xp, streak, lessonsCompleted *int
	var onboardingCompleted *bool
	var completedLessonIds, unlockedLessonIds []string
	var activityLog, activityHistory []byte
	var lastActiveAt *time.Time
	var createdAt time.Time

	err := row.Scan(&id, &email, &name, &firstName, &lastName, &avatar, &xp, &streak, &onboardingCompleted, &lessonsCompleted,
		&completedLessonIds, &unlockedLessonIds, &activityLog, &activityHistory, &lastActiveAt, &createdAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	profile := map[string]interface{}{
		"id":                    id,
		"email":                 email,
		"name":                  name,
		"first_name":            firstName,
		"last_name":             lastName,
		"avatar":                avatar,
		"xp":                    xp,
		"streak":                streak,
		"onboarding_completed":  onboardingCompleted,
		"lessons_completed":     lessonsCompleted,
		"completed_lesson_ids":  completedLessonIds,
		"unlocked_lesson_ids":   unlockedLessonIds,
		"last_active_at":        lastActiveAt,
		"created_at":            createdAt,
	}

	if len(activityLog) > 0 {
		var arr []interface{}
		json.Unmarshal(activityLog, &arr)
		profile["activity_log"] = arr
	} else {
		profile["activity_log"] = []interface{}{}
	}

	if len(activityHistory) > 0 {
		var arr []interface{}
		json.Unmarshal(activityHistory, &arr)
		profile["activity_history"] = arr
	} else {
		profile["activity_history"] = []interface{}{}
	}

	return profile, nil
}

func (c *PostgresDBClient) UpdateUserProfile(ctx context.Context, userID string, updates map[string]interface{}) (map[string]interface{}, error) {
	if len(updates) == 0 {
		return c.GetUserProfile(ctx, userID)
	}

	var columns []string
	var args []interface{}
	paramIdx := 1

	for k, v := range updates {
		columns = append(columns, fmt.Sprintf("%s = $%d", k, paramIdx))
		if k == "activity_log" || k == "activity_history" {
			bytesVal, _ := json.Marshal(v)
			args = append(args, bytesVal)
		} else {
			args = append(args, v)
		}
		paramIdx++
	}

	args = append(args, userID)
	query := fmt.Sprintf("UPDATE public.users SET %s WHERE id = $%d", strings.Join(columns, ", "), paramIdx)

	_, err := c.pool.Exec(ctx, query, args...)
	if err != nil {
		return nil, err
	}

	return c.GetUserProfile(ctx, userID)
}

func (c *PostgresDBClient) GetTracks(ctx context.Context) ([]map[string]interface{}, error) {
	rows, err := c.pool.Query(ctx, `SELECT id, name, initials, "desc", difficulty, icon, created_at FROM public.practice_tracks ORDER BY created_at ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tracks []map[string]interface{}
	for rows.Next() {
		var id, name, initials, desc, difficulty, icon string
		var createdAt time.Time
		if err := rows.Scan(&id, &name, &initials, &desc, &difficulty, &icon, &createdAt); err != nil {
			return nil, err
		}
		tracks = append(tracks, map[string]interface{}{
			"id":         id,
			"name":       name,
			"initials":   initials,
			"desc":       desc,
			"difficulty": difficulty,
			"icon":       icon,
			"created_at": createdAt,
		})
	}
	return tracks, nil
}

func (c *PostgresDBClient) AddTrack(ctx context.Context, t map[string]interface{}) error {
	_, err := c.pool.Exec(ctx, `
		INSERT INTO public.practice_tracks (id, name, initials, "desc", difficulty, icon) 
		VALUES ($1, $2, $3, $4, $5, $6)
	`, t["id"], t["name"], t["initials"], t["desc"], t["difficulty"], t["icon"])
	return err
}

func (c *PostgresDBClient) UpdateTrack(ctx context.Context, id string, t map[string]interface{}) error {
	_, err := c.pool.Exec(ctx, `
		UPDATE public.practice_tracks 
		SET name = $1, initials = $2, "desc" = $3, difficulty = $4, icon = $5 
		WHERE id = $6
	`, t["name"], t["initials"], t["desc"], t["difficulty"], t["icon"], id)
	return err
}

func (c *PostgresDBClient) DeleteTrack(ctx context.Context, id string) error {
	_, err := c.pool.Exec(ctx, `DELETE FROM public.practice_tracks WHERE id = $1`, id)
	return err
}

func (c *PostgresDBClient) GetContests(ctx context.Context) ([]map[string]interface{}, error) {
	rows, err := c.pool.Query(ctx, `SELECT id, title, date, prize, participants, type, source, created_at FROM public.contests ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var contests []map[string]interface{}
	for rows.Next() {
		var id, title, date, prize, participants, typeVal, source string
		var createdAt time.Time
		if err := rows.Scan(&id, &title, &date, &prize, &participants, &typeVal, &source, &createdAt); err != nil {
			return nil, err
		}
		contests = append(contests, map[string]interface{}{
			"id":           id,
			"title":        title,
			"date":         date,
			"prize":        prize,
			"participants": participants,
			"type":         typeVal,
			"source":       source,
			"created_at":   createdAt,
		})
	}
	return contests, nil
}

func (c *PostgresDBClient) AddContest(ctx context.Context, co map[string]interface{}) error {
	_, err := c.pool.Exec(ctx, `
		INSERT INTO public.contests (id, title, date, prize, participants, type, source) 
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, co["id"], co["title"], co["date"], co["prize"], co["participants"], co["type"], co["source"])
	return err
}

func (c *PostgresDBClient) UpdateContest(ctx context.Context, id string, co map[string]interface{}) error {
	_, err := c.pool.Exec(ctx, `
		UPDATE public.contests 
		SET title = $1, date = $2, prize = $3, participants = $4, type = $5, source = $6 
		WHERE id = $7
	`, co["title"], co["date"], co["prize"], co["participants"], co["type"], co["source"], id)
	return err
}

func (c *PostgresDBClient) DeleteContest(ctx context.Context, id string) error {
	_, err := c.pool.Exec(ctx, `DELETE FROM public.contests WHERE id = $1`, id)
	return err
}

// 2. HTTPS Proxy / REST API Client (Fallback if PostgreSQL port 5432 is blocked or no DB password is set)
type SupabaseRestDBClient struct {
	url  string
	key  string
	http *http.Client
}

func (c *SupabaseRestDBClient) makeRequest(ctx context.Context, method, path string, body interface{}, headers map[string]string) ([]byte, error) {
	var bodyReader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewBuffer(data)
	}

	fullURL := fmt.Sprintf("%s/rest/v1%s", c.url, path)
	req, err := http.NewRequestWithContext(ctx, method, fullURL, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", c.key)
	req.Header.Set("Authorization", "Bearer "+c.key)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("REST API status %d: %s", resp.StatusCode, string(respBody))
	}

	return respBody, nil
}

func (c *SupabaseRestDBClient) GetUserProfile(ctx context.Context, userID string) (map[string]interface{}, error) {
	path := fmt.Sprintf("/users?id=eq.%s&select=*", userID)
	data, err := c.makeRequest(ctx, "GET", path, nil, nil)
	if err != nil {
		return nil, err
	}

	var list []map[string]interface{}
	if err := json.Unmarshal(data, &list); err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	}
	return list[0], nil
}

func (c *SupabaseRestDBClient) UpdateUserProfile(ctx context.Context, userID string, updates map[string]interface{}) (map[string]interface{}, error) {
	path := fmt.Sprintf("/users?id=eq.%s", userID)
	headers := map[string]string{"Prefer": "return=representation"}
	data, err := c.makeRequest(ctx, "PATCH", path, updates, headers)
	if err != nil {
		return nil, err
	}

	var list []map[string]interface{}
	if err := json.Unmarshal(data, &list); err != nil {
		return nil, err
	}

	if len(list) == 0 {
		return nil, nil
	}
	return list[0], nil
}

func (c *SupabaseRestDBClient) GetTracks(ctx context.Context) ([]map[string]interface{}, error) {
	data, err := c.makeRequest(ctx, "GET", "/practice_tracks?select=*&order=created_at.asc", nil, nil)
	if err != nil {
		return nil, err
	}

	var list []map[string]interface{}
	if err := json.Unmarshal(data, &list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *SupabaseRestDBClient) AddTrack(ctx context.Context, track map[string]interface{}) error {
	_, err := c.makeRequest(ctx, "POST", "/practice_tracks", track, nil)
	return err
}

func (c *SupabaseRestDBClient) UpdateTrack(ctx context.Context, id string, updates map[string]interface{}) error {
	path := fmt.Sprintf("/practice_tracks?id=eq.%s", id)
	_, err := c.makeRequest(ctx, "PATCH", path, updates, nil)
	return err
}

func (c *SupabaseRestDBClient) DeleteTrack(ctx context.Context, id string) error {
	path := fmt.Sprintf("/practice_tracks?id=eq.%s", id)
	_, err := c.makeRequest(ctx, "DELETE", path, nil, nil)
	return err
}

func (c *SupabaseRestDBClient) GetContests(ctx context.Context) ([]map[string]interface{}, error) {
	data, err := c.makeRequest(ctx, "GET", "/contests?select=*&order=created_at.desc", nil, nil)
	if err != nil {
		return nil, err
	}

	var list []map[string]interface{}
	if err := json.Unmarshal(data, &list); err != nil {
		return nil, err
	}
	return list, nil
}

func (c *SupabaseRestDBClient) AddContest(ctx context.Context, contest map[string]interface{}) error {
	_, err := c.makeRequest(ctx, "POST", "/contests", contest, nil)
	return err
}

func (c *SupabaseRestDBClient) UpdateContest(ctx context.Context, id string, updates map[string]interface{}) error {
	path := fmt.Sprintf("/contests?id=eq.%s", id)
	_, err := c.makeRequest(ctx, "PATCH", path, updates, nil)
	return err
}

func (c *SupabaseRestDBClient) DeleteContest(ctx context.Context, id string) error {
	path := fmt.Sprintf("/contests?id=eq.%s", id)
	_, err := c.makeRequest(ctx, "DELETE", path, nil, nil)
	return err
}

// ─── Authentication JWT Claims ─────────────────────────────────────
type Claims struct {
	jwt.RegisteredClaims
	Email string `json:"email"`
}

func authMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error": "Missing Authorization header"}`, http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			http.Error(w, `{"error": "Invalid Authorization header format"}`, http.StatusUnauthorized)
			return
		}

		tokenStr := parts[1]
		jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")

		var claims Claims
		var token *jwt.Token
		var err error

		if jwtSecret != "" {
			token, err = jwt.ParseWithClaims(tokenStr, &claims, func(t *jwt.Token) (interface{}, error) {
				return []byte(jwtSecret), nil
			})
			if err != nil || !token.Valid {
				http.Error(w, `{"error": "Invalid token signature"}`, http.StatusUnauthorized)
				return
			}
		} else {
			// Skips verification for local environment development
			parser := jwt.NewParser()
			_, _, err = parser.ParseUnverified(tokenStr, &claims)
			if err != nil {
				http.Error(w, `{"error": "Invalid token format"}`, http.StatusUnauthorized)
				return
			}
		}

		ctx := context.WithValue(r.Context(), "userID", claims.Subject)
		ctx = context.WithValue(ctx, "userEmail", claims.Email)
		next.ServeHTTP(w, r.WithContext(ctx))
	}
}

// ─── Gemini AI Client Integration ──────────────────────────────────
func callGeminiAPI(ctx context.Context, apiKeys []string, prompt string) (string, error) {
	// Fallback chain: if the newest model is overloaded (503), gracefully degrade
	models := []string{
		"gemini-2.5-flash",
		"gemini-2.0-flash",
		"gemini-2.5-pro",
		"gemini-2.0-flash-lite-preview-02-05",
	}

	var lastErr error
	for _, apiKey := range apiKeys {
		if apiKey == "" {
			continue
		}
		
		for _, model := range models {
			url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey)

			reqBody, _ := json.Marshal(map[string]interface{}{
				"contents": []interface{}{
					map[string]interface{}{
						"parts": []interface{}{
							map[string]interface{}{
								"text": prompt,
							},
						},
					},
				},
			})

			req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(reqBody))
			if err != nil {
				lastErr = err
				continue
			}
			req.Header.Set("Content-Type", "application/json")

			client := &http.Client{Timeout: 30 * time.Second}
			resp, err := client.Do(req)
			if err != nil {
				lastErr = err
				continue
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				bodyBytes, _ := io.ReadAll(resp.Body)
				lastErr = fmt.Errorf("model %s status %d: %s", model, resp.StatusCode, string(bodyBytes))
				
				// If the key is invalid (400), don't try other models with the same key, move to next key
				if resp.StatusCode == 400 && strings.Contains(string(bodyBytes), "API_KEY_INVALID") {
					break 
				}
				// Otherwise, try the next model (e.g. 503 overloaded, 404 not found for this key)
				continue
			}

			var respData struct {
				Candidates []struct {
					Content struct {
						Parts []struct {
							Text string `json:"text"`
						} `json:"parts"`
					} `json:"content"`
				} `json:"candidates"`
			}

			if err := json.NewDecoder(resp.Body).Decode(&respData); err != nil {
				lastErr = err
				continue
			}

			if len(respData.Candidates) > 0 && len(respData.Candidates[0].Content.Parts) > 0 {
				return respData.Candidates[0].Content.Parts[0].Text, nil
			}

			lastErr = fmt.Errorf("empty candidates array returned by %s", model)
		}
	}
	return "", fmt.Errorf("all api keys and models failed: %w", lastErr)
}

// ─── OpenAI Compatible API Client Integration ──────────────────────
func callOpenAICompatibleAPI(ctx context.Context, apiURL, apiKey, model, prompt string) (string, error) {
	reqBody, _ := json.Marshal(map[string]interface{}{
		"model": model,
		"messages": []map[string]string{
			{"role": "user", "content": prompt},
		},
		"temperature": 0.7,
	})

	url := strings.TrimRight(apiURL, "/") + "/chat/completions"

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(reqBody))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	if apiKey != "" {
		req.Header.Set("Authorization", "Bearer "+apiKey)
	}

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var respData struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&respData); err != nil {
		return "", err
	}

	if len(respData.Choices) > 0 {
		return respData.Choices[0].Message.Content, nil
	}

	return "", fmt.Errorf("empty choices array returned")
}

// ─── CORS Middleware ───────────────────────────────────────────────
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, Prefer")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ─── Entry Point & Handlers ────────────────────────────────────────
func main() {
	loadEnv()
	initRedis()
	initFirebase()

	var db DBClient
	dbUrl := os.Getenv("DATABASE_URL")

	if dbUrl != "" {
		log.Println("🔌 Initializing Supabase direct PostgreSQL connection pool...")
		pool, err := pgxpool.New(context.Background(), dbUrl)
		if err != nil {
			log.Fatalf("Failed to initialize database pool: %v", err)
		}
		defer pool.Close()
		db = &PostgresDBClient{pool: pool}
	} else {
		log.Println("🔗 Database URL not set. Initializing Supabase REST Client proxy...")
		supUrl := os.Getenv("VITE_SUPABASE_URL")
		supKey := os.Getenv("VITE_SUPABASE_ANON_KEY")
		if supUrl == "" || supKey == "" {
			log.Println("⚠️ Supabase Client configurations are missing. Database routes will return placeholder data.")
		}
		db = &SupabaseRestDBClient{
			url:  supUrl,
			key:  supKey,
			http: &http.Client{Timeout: 10 * time.Second},
		}
	}

	mux := http.NewServeMux()

	// Firebase Custom Token Endpoint
	mux.HandleFunc("/api/firebase-token", func(w http.ResponseWriter, r *http.Request) {
		authMiddleware(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != "GET" {
				http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
				return
			}
			
			if firebaseAuth == nil {
				http.Error(w, `{"error": "Firebase Admin SDK not configured on server"}`, http.StatusInternalServerError)
				return
			}

			userID := r.Context().Value("userID").(string)
			
			token, err := firebaseAuth.CustomToken(r.Context(), userID)
			if err != nil {
				log.Printf("Error creating custom token for user %s: %v", userID, err)
				http.Error(w, `{"error": "Failed to create custom token"}`, http.StatusInternalServerError)
				return
			}
			
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{
				"token": token,
			})
		})(w, r)
	})

	// 1. Health Route
	mux.HandleFunc("/api/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "Success",
			"message": "Go Backend Secure Proxy is running perfectly!",
		})
	})

	// 2. User Profile Routes
	mux.HandleFunc("/api/user/profile", func(w http.ResponseWriter, r *http.Request) {
		authMiddleware(func(w http.ResponseWriter, r *http.Request) {
			userID := r.Context().Value("userID").(string)

			if r.Method == "GET" {
				profile, err := db.GetUserProfile(r.Context(), userID)
				if err != nil {
					log.Printf("Error loading user %s profile: %v", userID, err)
					http.Error(w, fmt.Sprintf(`{"error": "Failed to fetch profile: %v"}`, err), http.StatusInternalServerError)
					return
				}
				if profile == nil {
					http.Error(w, `{"error": "Profile not found"}`, http.StatusNotFound)
					return
				}
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(profile)
				return
			}

			if r.Method == "POST" {
				var updates map[string]interface{}
				if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
					http.Error(w, `{"error": "Invalid request JSON"}`, http.StatusBadRequest)
					return
				}

				// Sanitize ID and critical fields if sent
				delete(updates, "id")
				delete(updates, "email")
				delete(updates, "created_at")

				profile, err := db.UpdateUserProfile(r.Context(), userID, updates)
				if err != nil {
					log.Printf("Error updating user %s profile: %v", userID, err)
					http.Error(w, fmt.Sprintf(`{"error": "Failed to update profile: %v"}`, err), http.StatusInternalServerError)
					return
				}

				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(profile)
				return
			}

			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		})(w, r)
	})

	// 3. Practice Tracks Routes
	mux.HandleFunc("/api/tracks", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			tracks, err := db.GetTracks(r.Context())
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "Failed to load tracks: %v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(tracks)
			return
		}

		authMiddleware(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == "POST" {
				var track map[string]interface{}
				if err := json.NewDecoder(r.Body).Decode(&track); err != nil {
					http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
					return
				}
				if err := db.AddTrack(r.Context(), track); err != nil {
					http.Error(w, fmt.Sprintf(`{"error": "Failed to add track: %v"}`, err), http.StatusInternalServerError)
					return
				}
				w.WriteHeader(http.StatusCreated)
				json.NewEncoder(w).Encode(map[string]string{"message": "Track created"})
				return
			}

			if r.Method == "PUT" {
				id := r.URL.Query().Get("id")
				if id == "" {
					http.Error(w, `{"error": "Missing parameter: id"}`, http.StatusBadRequest)
					return
				}
				var track map[string]interface{}
				if err := json.NewDecoder(r.Body).Decode(&track); err != nil {
					http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
					return
				}
				if err := db.UpdateTrack(r.Context(), id, track); err != nil {
					http.Error(w, fmt.Sprintf(`{"error": "Failed to update track: %v"}`, err), http.StatusInternalServerError)
					return
				}
				json.NewEncoder(w).Encode(map[string]string{"message": "Track updated"})
				return
			}

			if r.Method == "DELETE" {
				id := r.URL.Query().Get("id")
				if id == "" {
					http.Error(w, `{"error": "Missing parameter: id"}`, http.StatusBadRequest)
					return
				}
				if err := db.DeleteTrack(r.Context(), id); err != nil {
					http.Error(w, fmt.Sprintf(`{"error": "Failed to delete track: %v"}`, err), http.StatusInternalServerError)
					return
				}
				json.NewEncoder(w).Encode(map[string]string{"message": "Track deleted"})
				return
			}

			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		})(w, r)
	})

	// 4. Contests Routes
	mux.HandleFunc("/api/contests", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			contests, err := db.GetContests(r.Context())
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "Failed to load contests: %v"}`, err), http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(contests)
			return
		}

		authMiddleware(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == "POST" {
				var contest map[string]interface{}
				if err := json.NewDecoder(r.Body).Decode(&contest); err != nil {
					http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
					return
				}
				if err := db.AddContest(r.Context(), contest); err != nil {
					http.Error(w, fmt.Sprintf(`{"error": "Failed to add contest: %v"}`, err), http.StatusInternalServerError)
					return
				}
				w.WriteHeader(http.StatusCreated)
				json.NewEncoder(w).Encode(map[string]string{"message": "Contest created"})
				return
			}

			if r.Method == "PUT" {
				id := r.URL.Query().Get("id")
				if id == "" {
					http.Error(w, `{"error": "Missing parameter: id"}`, http.StatusBadRequest)
					return
				}
				var contest map[string]interface{}
				if err := json.NewDecoder(r.Body).Decode(&contest); err != nil {
					http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
					return
				}
				if err := db.UpdateContest(r.Context(), id, contest); err != nil {
					http.Error(w, fmt.Sprintf(`{"error": "Failed to update contest: %v"}`, err), http.StatusInternalServerError)
					return
				}
				json.NewEncoder(w).Encode(map[string]string{"message": "Contest updated"})
				return
			}

			if r.Method == "DELETE" {
				id := r.URL.Query().Get("id")
				if id == "" {
					http.Error(w, `{"error": "Missing parameter: id"}`, http.StatusBadRequest)
					return
				}
				if err := db.DeleteContest(r.Context(), id); err != nil {
					http.Error(w, fmt.Sprintf(`{"error": "Failed to delete contest: %v"}`, err), http.StatusInternalServerError)
					return
				}
				json.NewEncoder(w).Encode(map[string]string{"message": "Contest deleted"})
				return
			}

			http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
		})(w, r)
	})

	// 5. Gemini AI Chat Proxy
	mux.HandleFunc("/api/ai/chat", func(w http.ResponseWriter, r *http.Request) {
		authMiddleware(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != "POST" {
				http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
				return
			}

			var body struct {
				Prompt string `json:"prompt"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Prompt == "" {
				http.Error(w, `{"error": "Missing prompt string"}`, http.StatusBadRequest)
				return
			}

			provider := os.Getenv("AI_PROVIDER")
			var respText string
			var err error

			if provider == "vllm" {
				apiURL := os.Getenv("VLLM_API_URL")
				apiKey := os.Getenv("VLLM_API_KEY")
				model := os.Getenv("VLLM_MODEL")
				if apiURL == "" {
					apiURL = "http://localhost:8000/v1"
				}
				if model == "" {
					model = "meta-llama/Meta-Llama-3-8B-Instruct"
				}
				respText, err = callOpenAICompatibleAPI(r.Context(), apiURL, apiKey, model, body.Prompt)
			} else {
				key1 := os.Getenv("VITE_GEMINI_API_KEY_1")
				key2 := os.Getenv("VITE_GEMINI_API_KEY_2")
				
				var keys []string
				if key1 != "" { keys = append(keys, key1) }
				if key2 != "" { keys = append(keys, key2) }
				
				// Fallback to legacy key variable just in case
				if len(keys) == 0 {
					legacyKey := os.Getenv("VITE_GEMINI_API_KEY")
					if legacyKey != "" { keys = append(keys, legacyKey) }
				}

				if len(keys) == 0 {
					http.Error(w, `{"error": "No Gemini API keys are configured in the Go backend environment"}`, http.StatusInternalServerError)
					return
				}
				respText, err = callGeminiAPI(r.Context(), keys, body.Prompt)
			}

			if err != nil {
				log.Printf("AI call error: %v", err)
				http.Error(w, fmt.Sprintf(`{"error": "%v"}`, err), http.StatusBadGateway)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]string{"text": respText})
		})(w, r)
	})

	// 6. Code Execution Proxy (Piston)
	mux.HandleFunc("/api/execute", func(w http.ResponseWriter, r *http.Request) {
		authMiddleware(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != "POST" {
				http.Error(w, `{"error": "Method not allowed"}`, http.StatusMethodNotAllowed)
				return
			}

			userID := r.Context().Value("userID").(string)

			// Redis Rate Limiting to prevent spam/hacks and server crashes
			if rdb != nil {
				ctx := r.Context()
				
				// 1. Debounce (Prevent double clicks / fast spamming)
				debounceKey := fmt.Sprintf("debounce:execute:%s", userID)
				isDebounced, _ := rdb.SetNX(ctx, debounceKey, "1", 3*time.Second).Result()
				if !isDebounced {
					http.Error(w, `{"error": "Too many requests. Please wait a few seconds before running code again."}`, http.StatusTooManyRequests)
					return
				}

				// 2. Hard Rate Limit (Max 10 executions per minute)
				rateKey := fmt.Sprintf("ratelimit:execute:%s", userID)
				count, _ := rdb.Incr(ctx, rateKey).Result()
				if count == 1 {
					rdb.Expire(ctx, rateKey, time.Minute)
				}
				if count > 10 {
					http.Error(w, `{"error": "Rate limit exceeded. Please wait 1 minute."}`, http.StatusTooManyRequests)
					return
				}
			}

			// Forward the execution request to the Piston server
			pistonURL := os.Getenv("PISTON_API_URL")
			if pistonURL == "" {
				pistonURL = "https://piston-2i5z.onrender.com/api/v2/execute"
			}

			// The frontend already sends the exact JSON structure Piston expects:
			// { "language": "...", "version": "...", "files": [...], "stdin": "..." }
			pistonReq, err := http.NewRequestWithContext(r.Context(), "POST", pistonURL, r.Body)
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "Failed to create Piston request: %v"}`, err), http.StatusInternalServerError)
				return
			}
			pistonReq.Header.Set("Content-Type", "application/json")

			client := &http.Client{Timeout: 15 * time.Second}
			pistonResp, err := client.Do(pistonReq)
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error": "Failed to connect to Piston server at %s. Make sure Docker is running."}`, pistonURL), http.StatusBadGateway)
				return
			}
			defer pistonResp.Body.Close()

			// Stream the exact response from Piston back to the frontend
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(pistonResp.StatusCode)
			io.Copy(w, pistonResp.Body)
		})(w, r)
	})

	corsHandler := corsMiddleware(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Go Backend Secure Proxy is starting on port %s...", port)
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, corsHandler))
}
