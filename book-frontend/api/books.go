package handler

import (
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

type Book struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	Title  string `json:"title" binding:"required" gorm:"not null"`
	Author string `json:"author" binding:"required" gorm:"not null"`
	Year   int    `json:"year" binding:"required,min=1440,max=2026"`
}

var (
	db   *gorm.DB
	once sync.Once
)

func initDB() {
	once.Do(func() {
		// Vercel: use /tmp for writable SQLite DB (filesystem is read-only elsewhere)
		dbPath := filepath.Join(os.TempDir(), "books.db")

		var err error
		db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
		if err != nil {
			panic("failed to connect to database: " + err.Error())
		}

		// Auto-migrate on every cold start (safe and idempotent)
		if err := db.AutoMigrate(&Book{}); err != nil {
			panic("failed to migrate database: " + err.Error())
		}
	})
}

// GET /api/books - list all
func getBooks(c *gin.Context) {
	var books []Book
	if result := db.Find(&books); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch books"})
		return
	}
	c.JSON(http.StatusOK, books)
}

// POST /api/books - create
func createBook(c *gin.Context) {
	var input Book
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if result := db.Create(&input); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book"})
		return
	}
	c.JSON(http.StatusCreated, input)
}

// PUT /api/books/:id - update
func updateBook(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var existing Book
	if result := db.First(&existing, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	var input Book
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Model(&existing).Updates(input)
	c.JSON(http.StatusOK, existing)
}

// DELETE /api/books/:id - delete
func deleteBook(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id < 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}

	var book Book
	if result := db.First(&book, id); result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"})
		return
	}

	db.Delete(&book)
	c.JSON(http.StatusOK, gin.H{"message": "Book deleted successfully"})
}

// Vercel-required handler
func Handler(w http.ResponseWriter, r *http.Request) {
	initDB()

	// Set up Gin router on every invocation
	router := gin.New()
	router.Use(gin.Recovery())

	// Routes
	router.GET("/books", getBooks)
	router.POST("/books", createBook)
	router.PUT("/books/:id", updateBook)
	router.DELETE("/books/:id", deleteBook)

	// Handle CORS
	if r.Method == "OPTIONS" {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.WriteHeader(http.StatusOK)
		return
	}

	// Add CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// Serve using Gin's HTTP handler
	router.ServeHTTP(w, r)
}