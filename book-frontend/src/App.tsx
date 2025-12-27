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
  const [newBook, setNewBook] = useState({ title: "", author: "", year: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.year) return;

    const response = await fetch("http://localhost:8080/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newBook.title,
        author: newBook.author,
        year: parseInt(newBook.year) || 0,
      }),
    });

    if (response.ok) {
      const createdBook = await response.json();
      setBooks([...books, createdBook]); // Instant Update!
      setNewBook({ title: "", author: "", year: "" });
    } else {
      console.error("Failed to add new book");
    }
  };

  const handleDelete = async (id: number) => {
    const response = await fetch(`http://localhost:8080/books/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setBooks(books.filter((book) => book.id !== id)); // instant removal
    } else {
      console.error("Failed to delete book");
    }
  };

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
      <div className="content-wrapper">
        <h1>My Book Library</h1>
        <p className="book-count">
          You have {books.length} {books.length === 1 ? "book" : "books"} in
          your library
        </p>
        {/* Add Book Form */}
        <div className="form-card">
          <form onSubmit={handleSubmit} className="add-form">
            <input
              type="text"
              placeholder="Book Title"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Year"
              value={newBook.year}
              onChange={(e) => setNewBook({ ...newBook, year: e.target.value })}
            />
            <button type="submit">Add Book</button>
          </form>
        </div>

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
                <div className="book-actions">
                  <button onClick={() => handleDelete(book.id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
