package main

import (
	"net/http"
	"strconv"

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

// Step 5: Add update and deleteBook handlers
// updateBook by ID || PUT /books/:id - update an existing book
func updateBook(c *gin.Context) {

	idStr := c.Param("id")         // Gets the :id from the URL (e.g., "5" from /books/5)
	id, err := strconv.Atoi(idStr) // Converts the string ID to an integer
	if err != nil || id < 1 {      // Checks if conversion failed or ID is invalid
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"}) // Returns 400 if ID is bad
		return
	}

	var existing Book                                           // Creates a variable to hold the book from DB
	if result := db.First(&existing, id); result.Error != nil { // If query results in an error, then...
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"}) // Returns 404 if book doesn't exists
		return
	}

	var input Book // Creates a variable for the incoming JSON data
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}) // Returns 400 if JSON is invalid or validations fails
		return
	}

	db.Model(&existing).Updates(input) // Updates only the fields (data shape) provided in input (partial updates)

	c.JSON(http.StatusOK, existing) // Returns the updated book with 200 OK

}

// deleteBook by ID || DELETE  /books/:id - delete an existing book
func deleteBook(c *gin.Context) {
	// Extract logic from update and repeats logic here
	idStr := c.Param("id")         // Gets the :id from the URL (e.g., "5" from /books/5)
	id, err := strconv.Atoi(idStr) // Converts the string ID to an integer
	if err != nil || id < 1 {      // Checks if conversion failed or ID is invalid
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"}) // Returns 400 if ID is bad
		return
	}
	// Extract logic from update and repeats logic here
	var book Book                                           // Creates a variable to hold the book we're deleting
	if result := db.First(&book, id); result.Error != nil { // If query results in an error, then...
		c.JSON(http.StatusNotFound, gin.H{"error": "Book not found"}) // Returns 404 if book doesn't exists
		return
	}

	db.Delete(&book) // Permanently deletes the book from the db

	c.JSON(http.StatusOK, gin.H{"message": "Book deleted successfully"}) // Returns JSON success message
}

// Setup the Gin server and first route (GET /books)
func main() {
	initDB() // Connect to DB and create table

	r := gin.Default() // Create Gin router with default middleware(logger, recovery)

	// Our first route: GET /books -> returns all books
	r.GET("/books", getBooks)

	// Create second route: POST / books -> creates a new book
	r.POST("/books", createBook)

	// Create third route: PUT /books/:id -> updates book by id
	r.PUT("/books/:id", updateBook)

	// Create fourth route: DELETE /books/:id -> deletes book by id
	r.DELETE("/books/:id", deleteBook)

	// Start server
	r.Run(":8080") // Listen on http://localhost:8080
}
