package main

import(
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type Book struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	Title  string `json:"title" binding:"required" gorm:"not null"`
	Author string `json:"author" binding:"required" gorm:"not null"`
	Year   int    `json:"year" binding:"required,min=1440, max=2026"`
}

var db *gorm.DB

func initDB(){
	var err error
	db, err = gorm.Open(sqlite.Open("books.db"), &gorm.Config{})
	if err != nil{
		panic("failed to connect to database")
	}
	db.AutoMigrate(&Book{})
}

