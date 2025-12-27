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
      <p>You have {books.length} books.</p>
    </div>
  );
}

export default App;
