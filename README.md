# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# Online Book Exchange Platform

A full-stack web application for exchanging books built with React + Vite frontend and Node.js backend.


## Features
- **User Authentication**: Secure signup/login with JWT
- **Book Management**: Add/list/search books by title/author/genre
- **Exchange System**: Request books and track exchanges
- **Location-Based**: Find books near you
- **Rating System**: Review exchange experiences

## Technology Stack
**Frontend**:
- React 18 + Vite
- React Router v6
- Tailwind CSS
- Axios for API calls
- Vite plugins:
  - `@vitejs/plugin-react` (Babel-based)
  - `@vitejs/plugin-react-swc` (SWC-based - faster)

**Backend**:
- Node.js + Express
- MongoDB (with Mongoose)
- JWT Authentication
- CORS middleware

## Quick Start

### Prerequisites
- Node.js ≥18.x
- npm ≥9.x
- MongoDB Atlas account (or local MongoDB)

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/book-exchange.git
cd SWAP-SHELF

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install