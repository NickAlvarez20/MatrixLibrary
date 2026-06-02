# Matrix Library (BookApi) Project

## Table of Contents

- [Project Name](#project-name)
- [About](#about)
- [Prerequisites](#prerequisites)
- [Features](#features)
- [Getting Started & Installation](#getting-started--installation)
- [Usage](#usage)
- [Learning Outcomes](#learning-outcomes)
- [Contributing](#contributing)
- [License](#license)
- [Credits & Acknowledgements](#credits--acknowledgements)
- [Contact](#contact)

## Project Name

**Matrix Library (BookApi)**

## About

Matrix Library is a full-stack book management application with a cyberpunk, Matrix-inspired user interface. Users can add, search, edit, and delete books from a personal library while an animated digital-rain background runs behind the UI.

The app is **deployed on Vercel using a serverless architecture**: the React frontend is served as static assets, and the **Go API runs as serverless functions** via `book-frontend/api/books.go`. There is **no persistent storage** in production — book data lives in an ephemeral SQLite file written to `/tmp` for the lifetime of a single function instance and is **not retained** across cold starts, redeployments, or scale events.

A standalone `main.go` is included for optional local API development with a local `books.db` file, but the live application is designed around the Vercel serverless model.

## Prerequisites

To run this project you need **Go** and **Node.js** installed on your system.

| Tool | Version (recommended) |
|------|---------------------|
| Go   | 1.25+               |
| Node.js | 18+              |
| npm  | 9+ (bundled with Node) |

**Additional libraries are required** and are installed automatically:

- **Backend (Go):** Gin, GORM, SQLite driver — installed via `go mod download`
- **Frontend (React):** React, Vite, TypeScript, ESLint — installed via `npm install` inside `book-frontend/`

## Features

This project includes these features:

* **Full CRUD book library** — create, read, update, and delete books (title, author, year)
* **Live search** — filter books by title or author as you type
* **Serverless Go API on Vercel** — Gin-powered `/api/books` endpoints as serverless functions
* **Ephemeral data (no persistent storage)** — SQLite in `/tmp` per function instance; data does not survive cold starts or redeploys
* **Matrix-themed UI** — neon cyberpunk styling, glitch effects, and responsive layout
* **Optimized Matrix rain animation** — continuous falling glyph streams with cycling characters, isolated from UI re-renders
* **Vercel deployment** — static React build + API rewrites configured in `book-frontend/vercel.json`

## Getting Started & Installation

Clone the repository to your local machine:

```bash
git clone https://github.com/NickAlvarez20/BookApi.git
cd BookApi
```

Install backend dependencies:

```bash
go mod download
```

Install frontend dependencies:

```bash
cd book-frontend
npm install
cd ..
```

## Usage

### Deploy to Vercel (production)

This is the intended way to run the application. Deploy the `book-frontend` directory to Vercel:

* Vercel serves the built React app as static files
* `/api/books` and `/api/books/:id` are routed to the Go serverless handler in `api/books.go`
* Book data is **temporary** — it exists only while a serverless instance is warm and is reset when the function cold-starts or the project is redeployed

### Run the frontend locally (Vite dev server)

From the `book-frontend` directory:

```bash
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`). API calls go to `/api/books`, matching the Vercel serverless route structure.

### Run the backend locally (optional)

For local API testing only, from the project root:

```bash
go run main.go
```

The standalone server listens on `http://localhost:8080` and writes to `books.db` in the project root. Route paths differ from production (`/books` vs `/api/books`), so use this mainly for backend development rather than as a mirror of the Vercel deployment.

| Method | Route         | Description      |
|--------|---------------|------------------|
| GET    | `/books`      | List all books   |
| POST   | `/books`      | Create a book    |
| PUT    | `/books/:id`  | Update a book    |
| DELETE | `/books/:id`  | Delete a book    |

### Build for production

```bash
cd book-frontend
npm run build
```

## Learning Outcomes

This project helped me:

* Build a **RESTful API** in Go using Gin, GORM, and SQLite with validation and error handling
* Deploy a full-stack app on **Vercel serverless** — static frontend plus Go API functions without managing a long-running server
* Understand **ephemeral storage limits** in serverless environments and why `/tmp` SQLite is not a substitute for a hosted database
* Connect a **React + TypeScript** SPA to a backend with fetch-based CRUD operations
* Implement performant **CSS animations** and isolate background effects from React state updates
* Design a cohesive **themed UI** with responsive layout, search UX, and accessible layering (content above decorative backgrounds)

## Contributing

This is primarily a personal learning / portfolio repository, so formal contributions aren't required. However, if you spot bugs, have project ideas, or want to add improvements, feel free to:

1. Fork the repo
2. Create a feature branch
3. Submit a pull request

Please include clear explanations of your changes and test any new code.

## License

This repository is open and free for educational use.


## Credits & Acknowledgements

This project was created by **NickAlvarez20** as part of my journey to learn **Go and React/TypeScript** full-stack development. Check out my other repositories to see more of my work!

## Contact

You can find more of my work at [NickAlvarez20 on GitHub](https://github.com/NickAlvarez20).
