AstroGram 🌌

AstroGram is a full-stack social networking platform dedicated to astrophysics enthusiasts. It provides a focused environment for sharing astronomical discoveries, engaging in scientific discussions, and connecting with like-minded individuals.

🚀 Features

User Authentication: Secure login and registration using Firebase (Email/Password & Google Auth).

Profile Management: Customizable user profiles with bio, avatar, and post history.

Social Graph:

Send, accept, and decline friend requests.

"Home Feed" showing posts exclusively from friends.

"Explore Feed" for discovering public content from the community.

Rich Interactions:

Create posts with titles, descriptions, and images (stored via Cloudinary).

Like and unlike posts in real-time.

Advanced comment system with threaded replies.

Real-time updates for posts and friend requests using Socket.IO.

AI-Powered Moderation: A two-layer content moderation system (Rule-based + Local AI) to ensure a safe and professional community.

Responsive Design: A fully responsive UI with a dark/light theme toggle.

🛠️ Tech Stack

Frontend: React.js, React Router, Context API

Backend: Node.js, Express.js

Database: MongoDB (Atlas) with Mongoose

Real-Time: Socket.IO

Authentication: Firebase Admin SDK

Image Storage: Cloudinary

AI: @xenova/transformers (Local inference)

📦 Installation & Setup

Follow these steps to set up the project locally.

1. Prerequisites

Node.js (v18 or higher)

MongoDB Atlas Account

Firebase Project

Cloudinary Account

2. Backend Setup

Navigate to the server directory:

cd ostrogram-server


Install dependencies:

npm install


Create a .env file in the ostrogram-server root and add your credentials (see .env.example).

Important: For the AI moderation to work, you must manually download the model files.

Create a folder: ostrogram-server/models/multilingual-toxic-model/

Download the ONNX model files for unitary/toxic-bert-multilingual-cased from Hugging Face and place them in this folder.

Start the server:

npm start


3. Frontend Setup

Navigate to the client directory:

cd ostrogram-client


Install dependencies:

npm install


Create a .env file in ostrogram-client with your Firebase config (see .env.example).

Start the React app:

npm start


📝 Environment Variables (.env.example)

Backend (ostrogram-server/.env):

PORT=5001
MONGO_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret


Frontend (ostrogram-client/.env):

REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_id
REACT_APP_FIREBASE_APP_ID=your_app_id


🤝 Contribution

Fork the repository.

Create a new branch (git checkout -b feature/YourFeature).

Commit your changes (git commit -m 'Add some feature').

Push to the branch (git push origin feature/YourFeature).

Open a Pull Request.

Developed by Modi Shivam Mayurkumar