# AI Chatbot

This project is a full-stack AI-powered chatbot application built with Node.js (Express) for the backend and React for the frontend. It supports user authentication, real-time chat, and AI-driven responses.

## Features
- User authentication (signup, login, password reset)
- Real-time chat interface
- AI-powered message responses
- Typing indicator
- Secure token-based API access
- Modular backend structure

## Technologies Used
- **Backend:** Node.js, Express, MongoDB
- **Frontend:** React, CSS
- **Authentication:** JWT

## Project Structure
```
backend/
  config/         # Database configuration
  middleware/     # Auth middleware
  models/         # Mongoose models
  routes/         # API routes
  server.js       # Express server entry point
frontend/
  public/         # Static files
  src/            # React source code
    components/   # Reusable UI components
    pages/        # App pages (Chat, Login, Signup, etc.)
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Backend Setup
1. Navigate to the backend folder:
   ```powershell
   cd backend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Create a `.env` file in `backend/` with the following variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5001
   ```
4. Start the backend server:
   ```powershell
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend folder:
   ```powershell
   cd frontend
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```
3. Start the React development server:
   ```powershell
   npm start
   ```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:5001` by default.

## Usage
- Open the frontend in your browser.
- Sign up or log in.
- Start chatting with the AI bot.

## Environment Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication
- `PORT`: Backend server port
- 'OPENROUTER_API_KEY': AI Agent connection key

## License
This project is licensed under the MIT License.
