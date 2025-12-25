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

## 📁 Project Structure & DevOps Toolkit

Understanding the role of each configuration file is key to the DevOps workflow of this project:

### Development & Orchestration
| File | Role | Purpose |
| :--- | :--- | :--- |
| `Dockerfile` | **Component Recipe** | Defines how to build the Go Backend image (base image, dependencies, compilation). |
| `frontend/Dockerfile` | **Component Recipe** | Defines how to build the Next.js Frontend image. |
| `docker-compose.yml` | **Orchestrator** | Managers the whole stack (App + DB) on a single machine. Ideal for local development. |
| `K8S/app.yml` | **Production Blueprint** | Deployment manifests for Kubernetes. Handles scaling, high availability, and persistent volumes for production environments. |

### Automation & Security (CI/CD)
| File | Role | Purpose |
| :--- | :--- | :--- |
| `.github/workflows/pipeline.yml` | **The Inspector** | Automated GitHub Actions pipeline. Runs on every push to verify builds, run tests, and perform security scans. |
| `main_test.go` | **Safety Net** | Go unit tests that verify backend logic and CORS configurations during the CI process. |

### Configuration
| File | Role | Purpose |
| :--- | :--- | :--- |
| `.gitignore` | **Filter** | Ensures temporary files (`node_modules`, `.next`, binaries) aren't tracked by Git, keeping the repository clean. |
| `go.mod / go.sum` | **Dependency Lock** | Manages backend libraries and ensures version consistency. |
| `frontend/package.json` | **Dependency Lock** | Manages frontend libraries and scripts. |

## 🛡️ Security & Quality
This project implements a "Shift-Left" security approach in the `pipeline.yml`:
1. **Build & Unit Testing**: Verified for both Go and Next.js.
2. **SAST (Static Application Security Testing)**: Uses `gosec` to find vulnerabilities in the source code.
3. **DAST (Dynamic Application Security Testing)**: Spins up the environment using Docker Compose and uses `OWASP ZAP` to scan the active frontend for common web attacks.
4. **Multi-Stage Builds**: Dockerfiles are optimized for small, secure production images containing only necessary binaries.