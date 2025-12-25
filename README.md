# 🌟 Day Organizer: Premium DevOps Project

A modern, full-stack task management application designed with a focus on **DevOps excellence**, **Premium UI/UX**, and **Scalable Architecture**.

## 🏗️ Architecture
The project follows a decoupled, containerized architecture:
- **Frontend**: Next.js (React) application with TypeScript and Vanilla CSS. Features a **Premium Glassmorphism UI**.
- **Backend**: High-performance Go (Golang) REST API.
- **Database**: Persistent PostgreSQL storage.
- **Orchestration**: Docker Compose for development and Kubernetes for production.
- **CI/CD**: Fully automated GitHub Actions pipeline with build, test, and security scanning (Gosec, OWASP ZAP).

## ✨ Features
- **Modern Logic**: Full CRUD functionality for daily tasks (List, Create, Delete).
- **Premium Aesthetics**: Interactive glassmorphism design with responsive components.
- **DevOps Ready**:
    - **Dockerized**: Multi-stage builds for lean production images.
    - **Persistence**: Database state preserved via Docker Volumes and K8S PVCs.
    - **Security**: Automated SAST and DAST scanning.
    - **Observability**: Built-in `/metrics` endpoint for monitoring.

## 🚀 Quick Start

### 1. Development (Local)
Requires **Node.js 20+** and **Go 1.21+**.
```bash
# Run backend
go run main.go

# Run frontend
cd frontend
npm install
npm run dev
```

### 2. Docker Compose (Recommended)
Spin up the entire stack with one command:
```bash
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8080/tasks](http://localhost:8080/tasks)

### 3. Kubernetes Deployment
Ensure your local cluster is running (e.g., Minikube or Docker Desktop).
```bash
kubectl apply -f K8S/app.yml
```

## 🛡️ Security & Quality
This project implements a robust CI/CD pipeline:
1. **Linting & Formatting**: Go and TypeScript verification.
2. **SAST**: `gosec` for static analysis of Go code.
3. **DAST**: `OWASP ZAP` baseline scan on the running application.
4. **Build Verification**: Multi-stage Docker builds are verified on every push.