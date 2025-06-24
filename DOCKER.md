# Docker Guide for Feedback Backend

This guide explains how to build, run, and deploy the feedback system backend using Docker.

## 🐳 Docker Image Overview

The feedback backend Docker image is based on `python:3.11-slim` and includes:

- ✅ Flask application with Gunicorn WSGI server
- ✅ SQLAlchemy ORM with PostgreSQL/SQLite support
- ✅ Health checks and monitoring
- ✅ Non-root user for security
- ✅ Production-ready configuration

**Image Size**: ~432MB  
**Base**: `python:3.11-slim`  
**User**: `appuser` (non-root)  
**Port**: 5000  
**Workers**: 4 Gunicorn workers

## 🚀 Quick Start

### 1. Build the Image

```bash
# Build with default 'latest' tag
docker build -t feedback-backend .

# Build with specific version
docker build -t feedback-backend:v1.0.0 .

# Using the build script
./scripts/docker-build.sh v1.0.0
```

### 2. Run the Container

```bash
# Simple run
docker run -p 5000:5000 feedback-backend

# Run with environment file
docker run -p 5000:5000 --env-file .env feedback-backend

# Run in background with custom name
docker run -d --name my-feedback-backend -p 5000:5000 feedback-backend

# Using the run script
./scripts/docker-run.sh
```

### 3. Test the API

```bash
# Health check
curl http://localhost:5000/

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager1@company.com", "password": "password123"}'
```

## ⚙️ Environment Variables

### Required for Production

```env
SECRET_KEY=your_32_character_secret_key_here
JWT_SECRET_KEY=your_jwt_secret_key_here
FLASK_ENV=production
CORS_ORIGINS=https://your-frontend-domain.com
```

### Optional Configuration

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=5000
FLASK_DEBUG=False
LOG_LEVEL=INFO
```

### Example .env File

```env
SECRET_KEY=super-secret-key-change-in-production-32-chars
JWT_SECRET_KEY=jwt-secret-key-for-token-signing-32-chars
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=postgresql://user:password@localhost:5432/feedback_db
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app
PORT=5000
LOG_LEVEL=INFO
```

## 🐳 Docker Commands Reference

### Building Images

```bash
# Basic build
docker build -t feedback-backend .

# Build with no cache
docker build --no-cache -t feedback-backend .

# Build for specific platform (M1 Macs)
docker build --platform linux/amd64 -t feedback-backend .

# Multi-stage build (if you modify Dockerfile)
docker build --target production -t feedback-backend .
```

### Running Containers

```bash
# Interactive run (for debugging)
docker run -it --rm -p 5000:5000 feedback-backend

# Run with volume mount (for development)
docker run -it --rm -p 5000:5000 \
  -v $(pwd)/backend:/app \
  feedback-backend

# Run with custom network
docker network create feedback-network
docker run -d --name feedback-backend \
  --network feedback-network \
  -p 5000:5000 feedback-backend
```

### Container Management

```bash
# List running containers
docker ps

# View container logs
docker logs feedback-backend

# Follow logs in real-time
docker logs -f feedback-backend

# Execute commands in running container
docker exec -it feedback-backend /bin/bash

# Stop container
docker stop feedback-backend

# Remove container
docker rm feedback-backend

# Remove container after stop
docker rm -f feedback-backend
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi feedback-backend

# Prune unused images
docker image prune

# Tag image for registry
docker tag feedback-backend:latest your-registry/feedback-backend:v1.0.0

# Push to registry
docker push your-registry/feedback-backend:v1.0.0
```

## 🔧 Advanced Docker Usage

### 1. Multi-Stage Production Build

If you want to optimize the image size further, create a multi-stage Dockerfile:

```dockerfile
# Build stage
FROM python:3.11-slim as builder
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY backend/ .
ENV PATH=/root/.local/bin:$PATH
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:create_app()"]
```

### 2. Using Docker Compose

For development with database:

```yaml
version: "3.8"
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/feedback
    depends_on:
      - db

  db:
    image: postgres:17
    environment:
      - POSTGRES_DB=feedback
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 3. Health Checks

The image includes health checks. Monitor with:

```bash
# Check health status
docker inspect --format='{{.State.Health.Status}}' feedback-backend

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' feedback-backend
```

## 🚀 Deployment Options

### 1. Docker Hub

```bash
# Build and tag
docker build -t your-username/feedback-backend:latest .

# Push to Docker Hub
docker push your-username/feedback-backend:latest

# Deploy anywhere
docker run -d -p 5000:5000 your-username/feedback-backend:latest
```

### 2. AWS ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-west-2 | \
  docker login --username AWS --password-stdin your-account.dkr.ecr.us-west-2.amazonaws.com

# Tag and push
docker tag feedback-backend:latest your-account.dkr.ecr.us-west-2.amazonaws.com/feedback-backend:latest
docker push your-account.dkr.ecr.us-west-2.amazonaws.com/feedback-backend:latest
```

### 3. Google Cloud Run

```bash
# Build for Cloud Run
docker build -t gcr.io/your-project/feedback-backend .

# Push to GCR
docker push gcr.io/your-project/feedback-backend

# Deploy to Cloud Run
gcloud run deploy feedback-backend \
  --image gcr.io/your-project/feedback-backend \
  --platform managed \
  --allow-unauthenticated
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Use different port
   docker run -p 5001:5000 feedback-backend
   ```

2. **Database Connection Errors**

   ```bash
   # Check environment variables
   docker run --env-file .env feedback-backend

   # For PostgreSQL, ensure DATABASE_URL is correct
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

3. **Permission Denied**

   ```bash
   # The image runs as non-root user 'appuser'
   # If you need root access for debugging:
   docker run -it --user root feedback-backend /bin/bash
   ```

4. **Build Failures**
   ```bash
   # Clear Docker cache and rebuild
   docker system prune -f
   docker build --no-cache -t feedback-backend .
   ```

### Debugging Container

```bash
# Run container interactively
docker run -it --rm feedback-backend /bin/bash

# Check running processes
docker exec feedback-backend ps aux

# Check disk usage
docker exec feedback-backend df -h

# View environment variables
docker exec feedback-backend env
```

## 📊 Monitoring

### Resource Usage

```bash
# Container stats
docker stats feedback-backend

# Container resource limits
docker run -d --memory="512m" --cpus="1.0" feedback-backend
```

### Logs

```bash
# Application logs
docker logs feedback-backend

# Follow logs with timestamp
docker logs -f -t feedback-backend

# Export logs
docker logs feedback-backend > feedback-backend.log
```

## 🔐 Security Best Practices

1. **Use Non-Root User**: ✅ Already implemented
2. **Minimal Base Image**: ✅ Using `python:3.11-slim`
3. **No Secrets in Image**: ✅ Use environment variables
4. **Regular Updates**: Update base image regularly
5. **Scan for Vulnerabilities**:
   ```bash
   docker scan feedback-backend
   ```

## 🚀 Production Checklist

- [ ] Set strong `SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Configure proper `DATABASE_URL` for PostgreSQL
- [ ] Set `FLASK_ENV=production`
- [ ] Configure `CORS_ORIGINS` for your frontend domain
- [ ] Set up proper logging and monitoring
- [ ] Configure health checks in orchestrator
- [ ] Set resource limits (memory, CPU)
- [ ] Enable HTTPS/TLS termination at load balancer
- [ ] Set up backup strategy for database

---

**Need Help?** Check the [DEPLOYMENT.md](DEPLOYMENT.md) for cloud deployment instructions or open an issue in the repository.
