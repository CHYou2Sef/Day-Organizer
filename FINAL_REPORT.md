# Final Project Report: Day Organizer

## 1. Architecture Overview
The "Day Organizer" application follows a **modern, decoupled, containerized 3-tier architecture**, designed for scalability and maintainability.

*   **Frontend**: Built with **Next.js (React)** using TypeScript and Vanilla CSS. It connects to the backend via REST APIs.
*   **Backend**: A high-performance **Go (Golang)** REST API that handles business logic and task management.
*   **Database**: **PostgreSQL** for persistent relational data storage.
*   **Orchestration**:
    *   **Docker Compose**: Used for local development to spin up the full stack (Frontend, Backend, Database) seamlessly.
    *   **Kubernetes (K8s)**: Configured for production-grade deployment with scaling and persistence.

## 2. Tools & Technologies
*   **Languages**: Go (Backend), TypeScript/JavaScript (Frontend).
*   **Frameworks**: Next.js (Frontend), Standard Request Mux (Backend).
*   **Containerization**: Docker (Multi-stage builds for optimization).
*   **Orchestration**: Kubernetes, Docker Compose.
*   **CI/CD**: GitHub Actions (Automated testing, building, and security scanning).
*   **Security Tools**:
    *   `gosec`: Static Application Security Testing (SAST) for Go.
    *   `OWASP ZAP`: Dynamic Application Security Testing (DAST) for the running application.
    *   `crypto/rand`: For secure ID generation.

## 3. Observability
*   **Implemented Solution**: We have deployed a complete observability stack using **Prometheus** and **Grafana**.
*   **Metrics Collection**:
    *   **Prometheus**: Configured to scrape the backend's `/metrics` endpoint every 15 seconds.
    *   **Go Instrumentation**: The backend uses the `prometheus/client_golang` library to expose standard Go metrics and custom business metrics.
    *   **Custom Metrics**:
        *   `http_request_duration_seconds`: Tracks API latency distribution.
        *   `dayorg_active_tasks_count`: Real-time gauge of active tasks.
*   **Visualization**:
    *   **Grafana**: Connected to Prometheus as a data source. Dashboards can be created to visualize request throughput, error rates, and system health.
    *   **Access**: Exposed in Kubernetes via NodePort 30001.

## 4. Security Measures
The project adopts a **Shift-Left Security** approach:
*   **Transport Security**: All database credentials and configuration are managed via environment variables.
*   **Access Control**: CORS headers are strictly defined to allow specific methods (`GET`, `POST`, `PUT`, `DELETE`).
*   **Vulnerability Scanning**: Automated pipelines run `gosec` to catch vulnerability patterns in code and `OWASP ZAP` to scan the running container for web vulnerabilities.
*   **Code hardening**:
    *   Use of `crypto/rand` instead of `math/rand` for non-deterministic IDs.
    *   Explicit `ReadTimeout` and `WriteTimeout` in the HTTP server to prevent Slowloris/DoS attacks.

## 5. Kubernetes Setup
The Kubernetes configuration (`K8S/app.yml`) defines a robust production environment:
1.  **Persistence Layer**:
    *   **PersistentVolumeClaim (postgres-pvc)**: Requests 1Gi of storage.
    *   **StatefulSet (postgres)**: Used instead of a Deployment to ensure stable network identity and orderly handling of data volumes.
2.  **Backend Layer**:
    *   **Deployment**: Runs 2 replicas of the Go API for high availability.
    *   **Service**: Exposed via `ClusterIP` (ports 8080), accessible only within the cluster (by the frontend).
3.  **Frontend Layer**:
    *   **Deployment**: Runs 2 replicas of the Next.js app.
    *   **Service**: Exposed via `NodePort` (port 30000) to allow external access to the application.

## 6. Lessons Learned
*   **Infrastructure as Code**: Managing infrastructure via `docker-compose.yml` and K8s manifests ensures consistency between dev and prod environments.
*   **Security Integration**: Integrating security tools like Gosec early in the connection pipeline prevents technical debt and security risks from accumulating.
*   **State Management**: Handling database persistence in a containerized environment (Docker Volumes vs K8s PVCs) requires careful planning to avoid data loss.
*   **Multi-Stage Builds**: Crucial for keeping image sizes small and secure by excluding build tools and intermediate files from production images.
