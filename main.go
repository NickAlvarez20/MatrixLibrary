package main

import (
	"net/http"

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

var db *gorm.DB

func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("books.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect to database")
	}
	db.AutoMigrate(&Book{})
}

// Handler for GET /books
func getBooks(c *gin.Context) {
	var books []Book

	// Query all books from database
	if result := db.Find(&books); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch books"})
		return
	}

	// Return as JSOn
	c.JSON(http.StatusOK, books)
}

// POST /books - create a new book
func createBook(c *gin.Context) {
	var input Book

	// Bind and validate JSON input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Save to database
	if result := db.Create(&input); result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create book"})
		return
	}

	// Return created book with 201 status
	c.JSON(http.StatusCreated, input)
}

// Setup the Gin server and first route (GET /books)
func main() {
	initDB() // Connect to DB and create table

	r := gin.Default() // Create Gin router with default middleware(logger, recovery)

	// Our first route: GET /books -> returns all books
	r.GET("/books", getBooks)

	// Create second route: POST / books -> creates a new book
	r.POST("/books", createBook)

	// Start server
	r.Run(":8080") // Listen on http://localhost:8080
}
