# Test Kubernetes Deployment with Observability
Write-Host "🚀 Starting Kubernetes Verification..." -ForegroundColor Cyan

# 1. Build Docker Images (Required for imagePullPolicy: Never)
Write-Host "📦 Building Backend Image..." -ForegroundColor Yellow
docker build -t day-organizer-backend:latest .
if ($LASTEXITCODE -ne 0) { Write-Error "Backend build failed"; exit 1 }

Write-Host "📦 Building Frontend Image..." -ForegroundColor Yellow
docker build -t day-organizer-frontend:latest ./frontend
if ($LASTEXITCODE -ne 0) { Write-Error "Frontend build failed"; exit 1 }

# 2. Apply Kubernetes Manifests
Write-Host "☸️  Applying K8s Manifests..." -ForegroundColor Yellow
kubectl apply -f K8S/app.yml
kubectl apply -f K8S/observability.yml

# 3. Wait for rollout (optional/simple check)
Write-Host "⏳ Waiting for resources to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
kubectl get pods

# 4. Display Access Info
Write-Host "`n✅ Deployment Complete!" -ForegroundColor Green
Write-Host "---------------------------------------------------"
Write-Host "📝 Frontend: http://localhost:30000"
Write-Host "📊 Grafana:  http://localhost:30001 (User: admin, Pass: admin)"
Write-Host "📈 Prometheus: http://localhost:30090"
Write-Host "---------------------------------------------------"
Write-Host "To clean up: kubectl delete -f K8S/"
