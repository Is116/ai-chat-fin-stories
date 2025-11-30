# 📚 Literary Chat - AI-Powered Book Character Conversations

A full-stack web application that allows users to upload books, extract characters using AI, and have engaging conversations with those characters in multiple languages. Built with React, Node.js, Express, SQLite, and Google Gemini AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![React](https://img.shields.io/badge/react-18.2.0-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Dependencies](#-dependencies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [AI Integration](#-ai-integration)
- [Multilingual Support](#-multilingual-support)
- [Social Authentication](#-social-authentication)
- [Admin Panel](#-admin-panel)
- [File Uploads](#-file-uploads)
- [Contributing](#-contributing)

---

## Features

### Core Features
- **PDF Book Upload** - Upload books in PDF format
- **AI Character Extraction** - Automatically extract main characters using Google Gemini AI
- **Character Chat** - Have conversations with book characters
- **Opinionated Personalities** - Characters express strong opinions and emotions
- **Multilingual Support** - Chat in English, Sinhala, Finnish, and more
- **User Authentication** - Local and Google OAuth login
- **Admin Dashboard** - Manage books, characters, and users
- **Auto-Generated Book Covers** - AI creates beautiful cover images
- **Character Avatars** - Auto-generated unique avatars using DiceBear API
- **Book Metadata Extraction** - AI extracts title, author, genre, year, description, language

### Advanced Features
- **RAG (Retrieval Augmented Generation)** - Context-aware responses using book chunks
- **Character Personas** - Deep personality analysis and authentic voices
- **Image Chat Support** - Upload images for character analysis
- **Conversation History** - Persistent chat history
- **Responsive Design** - Mobile-friendly interface
- **Beautiful UI** - Gradient backgrounds, animations, modern design

---

## Tech Stack

### Frontend
- **React 18.2** - UI library
- **React Router DOM 7.9** - Client-side routing
- **Vite 4.3** - Build tool and dev server
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **i18next** - Internationalization framework
- **React i18next** - React bindings for i18next

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.1** - Web framework
- **Better-SQLite3 12.4** - Embedded database
# AI Chat — Book Character Conversations

A concise repository for a web application that lets users upload books (PDFs), extract characters, and chat with character personas. The project includes a React frontend, an Express backend, and utilities for processing PDFs and storing chat history.

## Quick Overview

- Purpose: Upload books, extract characters and personas, and chat with them.
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + SQLite (Prisma support present)
- Screenshots: See the `screenshots/` folder for UI examples included below.

## Screenshots

Landing page
![Landing](/screenshots/landing.jpeg)

Chat interface
![Chat](/screenshots/chat.jpeg)

Character list
![Characters](/screenshots/characters.jpeg)

Admin — users
![Admin users](/screenshots/admin_users.jpeg)

Admin — books
![Admin books](/screenshots/admin_books.jpeg)

Admin — prompts
![Admin prompts](/screenshots/admin_prompts.jpeg)

Admin — characters
![Admin characters](/screenshots/admin_characters.jpeg)

## Getting Started

Prerequisites

- Node.js >= 18
- npm or bun

Install

```bash
git clone https://github.com/Is116/ai-chat-fin-stories.git
cd ai-chat-fin-stories
npm install
```

Environment

Create a `.env` file (copy from `.env.example` if present) and set the following as needed:

- `PORT` (backend port)
- `DATABASE_PATH` (path to SQLite file)
- OAuth credentials for Google (if using social login)
- API keys for any AI or cloud services you plan to enable

Run (development)

```bash
# Frontend
npm run dev

# Backend (in another terminal)
npm run server

# Or run both together (if configured)
npm run dev:full
```

Access

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

## What’s Included

- Frontend React app in `src/`
- Backend server in `server/`
- Prisma schema and seed in `prisma/`
- Screenshots in `screenshots/` (referenced above)

## Key Workflows

- Upload a PDF (frontend -> backend)
- Process PDF to extract metadata and text chunks
- Run character extraction to produce character entries and personas
- Start a chat tied to a character; conversation history is persisted

## Development Notes

- Database migrations and seeds are available in the `prisma/` folder.
- Useful scripts are in `package.json` (`dev`, `server`, `build`, `prisma:*`).

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/something`
3. Commit and push your changes
4. Open a pull request

## License

This project is available under the MIT License — see `LICENSE` for details.

## Contact

For questions or issues, open an issue on the repository.
