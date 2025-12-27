import { useState, useEffect } from "react";
import "./App.css";

// Define a TypeScript type called Book
type Book = {
  id: number;
  title: string;
  author: string;
  year: number;
};

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  useEffect(() => {
    fetch("http://localhost:8080/books")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch books");
        }
        return response.json();
      })
      .then((data: Book[]) => {
        setBooks(data);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
      });
  }, []); // Empty array = run only once when component mounts
  return (
    <div>
      <h1>My Book Library</h1>
      <p className="book-count">
        You have {books.length} {books.length === 1 ? "book" : "books"} in your
        library
      </p>

      {/* Display the list of books */}
      {books.length === 0 ? (
        <p className="empty-state">
          No books yet - add one below to get started!
        </p>
      ) : (
        <ul className="book-list">
          {" "}
          {books.map((book) => (
            <li key={book.id} className="book-item">
              <div className="book-info">
                <h3>{book.title}</h3>
                <p>by {book.author}</p>
                <p>Published: {book.year}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
