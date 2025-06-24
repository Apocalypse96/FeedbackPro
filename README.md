# Employee Feedback Management System

A modern, full-stack employee feedback management system built with React and Flask, designed for managers to provide structured feedback to their team members.

![GitHub](https://img.shields.io/github/license/apocalypse96/feedback-backend)
![Docker](https://img.shields.io/badge/docker-ready-blue)
![Flask](https://img.shields.io/badge/flask-2.3.2-green)
![React](https://img.shields.io/badge/react-18.2.0-blue)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/apocalypse96/feedback-backend.git
cd feedback-backend

# Run with Docker (Recommended)
docker-compose up --build

# Access the application
Frontend: http://localhost:3000
Backend API: http://localhost:5000
```

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack & Design Decisions](#-tech-stack--design-decisions)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Docker Deployment](#-docker-deployment)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Cloud Deployment](#-cloud-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **🔐 User Authentication**: Role-based access control (Manager/Employee)
- **💬 Feedback Management**: Create, view, edit, and acknowledge feedback
- **🗨️ Interactive Comments**: Add comments and replies to feedback threads
- **📊 Dashboard Analytics**: Visual insights with charts and performance metrics
- **📄 PDF Export**: Generate and download professional feedback reports
- **📝 Feedback Requests**: Employees can request feedback from their managers
- **⚡ Real-time Updates**: Dynamic UI updates without page refresh
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **🔍 Search & Filter**: Advanced filtering and search capabilities

## 🛠 Tech Stack & Design Decisions

### Backend Architecture

| Technology     | Purpose               | Why We Chose It                                            |
| -------------- | --------------------- | ---------------------------------------------------------- |
| **Flask**      | Web Framework         | Lightweight, flexible, and perfect for RESTful APIs        |
| **SQLAlchemy** | ORM                   | Type-safe database operations with relationship management |
| **PostgreSQL** | Database              | ACID compliance, scalability, and robust data integrity    |
| **Gunicorn**   | WSGI Server           | Production-ready with multi-worker support                 |
| **Flask-CORS** | Cross-Origin Requests | Secure frontend-backend communication                      |
| **ReportLab**  | PDF Generation        | Professional document generation capabilities              |

### Frontend Architecture

| Technology   | Purpose            | Why We Chose It                                              |
| ------------ | ------------------ | ------------------------------------------------------------ |
| **React 18** | UI Framework       | Modern hooks, concurrent features, and component reusability |
| **Recharts** | Data Visualization | Lightweight, responsive charts with React integration        |
| **Axios**    | HTTP Client        | Promise-based requests with interceptors and error handling  |
| **CSS3**     | Styling            | Modern layouts with Flexbox/Grid and responsive design       |

### Key Design Decisions

1. **🏗️ Microservices Architecture**: Separate frontend and backend for scalability
2. **🔄 RESTful API Design**: Standard HTTP methods and consistent response formats
3. **🧩 Component-Based UI**: Reusable React components for maintainability
4. **📊 Relational Database**: Proper foreign keys and data relationships
5. **🛡️ Security First**: Input validation, CORS, JWT tokens, and environment variables
6. **🐳 Containerization**: Docker for consistent deployment across environments
7. **⚡ Performance**: Lazy loading, optimized queries, and efficient state management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10+) and **Docker Compose** (v2.0+)
- **Git** (v2.30+)
- **Node.js** (v18+) - Only for local development
- **Python** (v3.11+) - Only for local development

## 🚀 Installation & Setup

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/apocalypse96/feedback-backend.git
cd feedback-backend

# 2. Set up environment variables
cp env.example .env
# Edit .env file with your configuration

# 3. Build and start all services
docker-compose up --build

# 4. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Database: localhost:5432
```

### Option 2: Local Development

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export SECRET_KEY=your_secret_key_here
export JWT_SECRET_KEY=your_jwt_secret_here

# Initialize database
python -c "from app import db; db.create_all()"

# Run the application
python app.py
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start development server
npm start
```

## 🐳 Docker Deployment

### Building Individual Images

```bash
# Build backend image
docker build -t feedback-backend .

# Build frontend image
docker build -t feedback-frontend ./frontend

# Run backend container
docker run -p 5000:5000 --env-file .env feedback-backend

# Run frontend container
docker run -p 3000:3000 feedback-frontend
```

### Using Pre-built Image

```bash
# Pull and run the backend image from Docker Hub
docker pull apocalypse96/feedback-backend:latest
docker run -p 5000:5000 apocalypse96/feedback-backend:latest
```

### Production Deployment

```bash
# Set production environment
export FLASK_ENV=production
export DATABASE_URL=postgresql://user:password@host:5432/dbname

# Deploy with production compose file
docker-compose -f docker-compose.prod.yml up -d
```

## 📡 API Documentation

### Authentication Endpoints

```bash
# Login
POST /api/auth/login
Body: {"email": "user@example.com", "password": "password"}

# Logout
POST /api/auth/logout
Headers: {"Authorization": "Bearer <token>"}
```

### Feedback Endpoints

```bash
# Get all feedback
GET /api/feedback
Headers: {"Authorization": "Bearer <token>"}

# Create feedback
POST /api/feedback
Headers: {"Authorization": "Bearer <token>"}
Body: {"recipient_id": 1, "content": "Great work!", "category": "performance"}

# Update feedback
PUT /api/feedback/<id>
Headers: {"Authorization": "Bearer <token>"}
Body: {"content": "Updated feedback", "status": "acknowledged"}
```

### User Endpoints

```bash
# Get all users
GET /api/users
Headers: {"Authorization": "Bearer <token>"}

# Get user profile
GET /api/users/profile
Headers: {"Authorization": "Bearer <token>"}
```

### Sample API Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "content": "Excellent presentation skills",
    "category": "performance",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z",
    "author": {
      "id": 2,
      "name": "John Manager",
      "email": "john@company.com"
    }
  },
  "message": "Feedback retrieved successfully"
}
```

## 📊 Database Schema

### Entity Relationship Diagram

```
Users (1) ──── (N) Feedback
  │                  │
  │                  │
  └─── (1:N) ──── (N:1) ── Comments
                          │
                          └── (N:1) ── Users
```

### Table Structures

#### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    manager_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Feedback Table

```sql
CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    author_id INTEGER REFERENCES users(id) NOT NULL,
    recipient_id INTEGER REFERENCES users(id) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Default Test Data

```bash
# Manager Account
Email: manager1@company.com
Password: password123

# Employee Accounts
Email: employee1@company.com, employee2@company.com
Password: password123
```

## ☁️ Cloud Deployment

### Vercel + Railway (Free Tier)

#### Frontend (Vercel)

1. Fork this repository
2. Connect to [Vercel](https://vercel.com)
3. Set root directory: `frontend`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend.railway.app`

#### Backend (Railway)

1. Connect repository to [Railway](https://railway.app)
2. Railway auto-detects configuration from `railway.toml`
3. Add PostgreSQL database (automatic)
4. Set environment variables:
   ```
   SECRET_KEY=your_32_character_secret_key
   JWT_SECRET_KEY=your_jwt_secret_key
   CORS_ORIGINS=https://your-app.vercel.app
   FLASK_ENV=production
   ```

### Alternative Platforms

- **Heroku**: Use `Procfile` for deployment
- **Render**: Use `render.yaml` configuration
- **DigitalOcean**: Use Docker droplets
- **AWS**: ECS with RDS PostgreSQL

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed cloud deployment instructions.

## 🧪 Testing

```bash
# Run backend tests
cd backend
python -m pytest tests/

# Run frontend tests
cd frontend
npm test

# Run integration tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint and Prettier for JavaScript
- Write tests for new features
- Update documentation for API changes
- Ensure Docker builds pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 What's Next?

- [ ] Real-time notifications with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Mobile app with React Native
- [ ] Integration with Slack/Teams
- [ ] AI-powered feedback suggestions
- [ ] Multi-language support

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/apocalypse96/feedback-backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/apocalypse96/feedback-backend/discussions)
- **Email**: support@feedbacksystem.com

## 🙏 Acknowledgments

- Built with ❤️ by the development team
- Icons by [Heroicons](https://heroicons.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Deployment guides inspired by [Docker best practices](https://docs.docker.com/develop/dev-best-practices/)

---

**⭐ Star this repository if you found it helpful!**

Made with ❤️ and ☕ by developers, for developers.
# FeedbackPro
