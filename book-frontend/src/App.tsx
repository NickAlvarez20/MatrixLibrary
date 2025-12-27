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
  return (
    <div>
      <h1>My Book Library</h1>
      <p>You have {books.length} books.</p>
    </div>
  );
}

export default App;
