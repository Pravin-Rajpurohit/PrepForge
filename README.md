# PrepForge 🚀

PrepForge is a full-stack, AI-powered mock interview platform designed to help candidates prepare for technical interviews. It leverages the MERN stack and Google's Generative AI (Gemini) to provide dynamic interview questions, speech-to-text transcription for voice answers, and intelligent, strict evaluation of candidate responses.

## ✨ Features
- **Customizable Mock Interviews:** Select your target job role, topic, difficulty level, and number of questions.
- **AI Question Generation:** Dynamically generates targeted technical questions using Gemini AI (`gemini-2.5-flash`).
- **Interactive Interview Interface:** Supports both text and real-time voice input (speech-to-text) to simulate a real interview environment.
- **Intelligent Evaluation:** AI assesses answers strictly on technical accuracy, completeness, and clarity, providing a score (0-10) and constructive feedback.
- **Dashboard & Analytics:** View your interview history, track your performance trends over time with visual charts, and identify weak areas.
- **Secure Authentication:** User registration and login using JWT and bcrypt.

## 🛠️ Technology Stack
- **Frontend:** React, Vite, Tailwind CSS, Zustand (State Management), Recharts (Data Visualization)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI Integration:** Google Generative AI SDK (`@google/generative-ai`)
- **Authentication:** JSON Web Tokens (JWT), bcrypt

## ⚙️ Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas account)
- A [Google Gemini API Key](https://aistudio.google.com/)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Pravin-Rajpurohit/PrepForge.git
cd PrepForge
```

### 2. Backend Setup
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following variables:
```env
# MongoDB Connection String (Local or Atlas)
ATLAS_URI=your_mongodb_atlas_connection_string
MONGO_URI=mongodb://127.0.0.1:27017/interviewai

# JSON Web Token Secret
JWT_SECRET=your_jwt_secret_key

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key

# Server Port
PORT=5000
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal, navigate to the `client` directory, and install dependencies:
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory and add:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend Vite development server:
```bash
npm run dev
```

## 🌐 Usage
1. Open your browser and navigate to `http://localhost:5173`.
2. Register a new account.
3. Go to the Dashboard and click "Start New Interview".
4. Configure your interview preferences and begin!

## 📄 License
This project is licensed under the ISC License.
