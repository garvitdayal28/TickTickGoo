# Tick Tick Goo 📝

A modern, full-stack task management application built with React and Flask.

## ✨ Features

- **User Authentication** - Secure registration and login with Firebase
- **Task Management** - Create, update, and delete tasks
- **Status Tracking** - Pending, Ongoing, and Completed task states
- **Responsive Design** - Beautiful UI with Tailwind CSS
- **Real-time Updates** - Instant task status changes
- **Modern Stack** - React + Vite frontend, Flask backend

## 🚀 Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

### Backend
- **Flask** - Python web framework
- **Firebase Admin** - Authentication and Firestore database
- **Flask-Login** - Session management
- **Flask-CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Firebase project with Firestore

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/tick-tick-goo.git
cd tick-tick-goo
```

### 2. Backend Setup
```bash
# Create virtual environment
python -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate

# Install dependencies
cd server
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Add Firebase service account
# Download serviceAccount.json from Firebase Console
# Place it in the server/ directory
```

### 3. Frontend Setup
```bash
cd "To-Do List App"
npm install
```

## 🔧 Configuration

### Environment Variables
Create `server/.env` with:
```env
SECRET_KEY=your-production-secret-key
FLASK_ENV=production
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccount.json
FRONTEND_ORIGIN=http://localhost:5173
SESSION_SECRET=your-session-secret
```

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Generate a service account key
4. Download as `serviceAccount.json` and place in `server/` directory

## 🏃‍♂️ Running the Application

### Development Mode

**Backend (Terminal 1):**
```bash
python run.py
# Server runs on http://127.0.0.1:5000
```

**Frontend (Terminal 2):**
```bash
cd "To-Do List App"
npm run dev
# App runs on http://localhost:5173
```

### Production Build
```bash
cd "To-Do List App"
npm run build
```

## 📁 Project Structure

```
tick-tick-goo/
├── server/                 # Flask backend
│   ├── routes/            # API routes
│   ├── __init__.py        # App factory
│   └── models.py          # Database models
├── To-Do List App/        # React frontend
│   ├── src/
│   │   └── components/    # React components
│   └── public/           # Static assets
└── run.py                # Application entry point
```

## 🔐 Security Features

- Password hashing with bcrypt
- Session-based authentication
- CORS protection
- Environment variable configuration
- Firebase security rules

## 🚀 Deployment

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

## 📝 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task status
- `DELETE /api/tasks/:id` - Delete task

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Firebase for authentication and database
- Tailwind CSS for the beautiful UI
- React and Flask communities for excellent documentation