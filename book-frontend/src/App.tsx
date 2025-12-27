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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", author: "", year: "" });
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleUpdate = async (id: number) => {
    const response = await fetch(`http://localhost:8080/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editForm.title || undefined,
        author: editForm.author || undefined,
        year: editForm.year ? parseInt(editForm.year) : undefined,
      }),
    });

    if (response.ok) {
      const updatedBook = await response.json();
      setBooks(books.map((book) => (book.id === id ? updatedBook : book)));
      setEditingId(null);
      setEditForm({ title: "", author: "", year: "" });
    } else {
      console.error("Failed to update book");
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

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Search Bar */}
      <div
        className="form-card"
        style={{ marginTop: "0", marginBottom: "30px" }}
      >
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "16px 20px",
            fontSize: "1.2rem",
            background: "rgba(255, 255, 255, 0.2)",
            border: "2px solid rgba(255,255,255,0.4)",
            borderRadius: "12px",
            color: "white",
            outline: "none",
          }}
        />
      </div>
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
        {filteredBooks.length === 0 ? (
          <p className="empty-state">
            {searchTerm
              ? `No books found matching "${searchTerm}"`
              : "No books yet — add your first one!"}
          </p>
        ) : (
          <ul className="book-list">
            {filteredBooks.map((book) => (
              <li key={book.id} className="book-item">
                {editingId === book.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleUpdate(book.id);
                    }}
                    className="add-form"
                  >
                    <input
                      type="text"
                      value={editForm.title}
                      placeholder={book.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      value={editForm.author}
                      placeholder={book.author}
                      onChange={(e) =>
                        setEditForm({ ...editForm, author: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      value={editForm.year}
                      placeholder={book.year.toString()}
                      onChange={(e) =>
                        setEditForm({ ...editForm, year: e.target.value })
                      }
                    />
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="book-info">
                      <h3>{book.title}</h3>
                      <p>by {book.author}</p>
                      <p>Published: {book.year}</p>
                    </div>
                    <div className="book-actions">
                      <button
                        onClick={() => {
                          setEditingId(book.id);
                          setEditForm({
                            title: book.title,
                            author: book.author,
                            year: book.year.toString(),
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(book.id)}>
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
