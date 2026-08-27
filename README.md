# SmartTrip

Intelligent Travel Booking & Personalized Trip Planning Platform

## Project Structure

This is a monorepo containing the following components:

- `/frontend`: React + Vite application for the user and admin interfaces.
- `/backend`: Node.js + Express + Prisma REST API.
- `/docs`: Documentation and architecture diagrams.

## Prerequisites

- Node.js (v24 or later)
- PostgreSQL (v18 or later)

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Copy `.env.example` to `.env` and configure your `DATABASE_URL`.
   ```bash
   cp .env.example .env
   ```
4. Initialize the Prisma database (run migrations once schemas are added):
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:5000`. A health check is available at `/api/v1/health`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env`.
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.
