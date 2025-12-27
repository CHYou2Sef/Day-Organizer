Write-Host "=== Test Kubernetes Deployment ===" -ForegroundColor Cyan

# 1. Vérifier cluster
Write-Host "`n1. Checking Kubernetes cluster..." -ForegroundColor Yellow
try {
    kubectl cluster-info | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Cluster accessible" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Cluster not accessible" -ForegroundColor Red
        Write-Host "   → Enable Kubernetes in Docker Desktop Settings" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ✗ kubectl not found or cluster not running" -ForegroundColor Red
    exit 1
}

# 2. Vérifier les images Docker
Write-Host "`n2. Checking Docker images..." -ForegroundColor Yellow
$backendImage = docker images day-organizer-backend:latest -q
$frontendImage = docker images day-organizer-frontend:latest -q

if ($backendImage -and $frontendImage) {
    Write-Host "   ✓ Both images found locally" -ForegroundColor Green
} else {
    Write-Host "   ✗ Images missing. Building..." -ForegroundColor Yellow
    docker build -t day-organizer-backend:latest .
    docker build -t day-organizer-frontend:latest ./frontend
}

# 3. Déployer l'application
Write-Host "`n3. Deploying application to Kubernetes..." -ForegroundColor Yellow
kubectl apply -f K8S/app.yml | Out-Null
Write-Host "   ✓ Deployment applied" -ForegroundColor Green
Write-Host "   → Waiting for pods to start (30 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# 4. Vérifier les pods
Write-Host "`n4. Checking pod status..." -ForegroundColor Yellow
$pods = kubectl get pods --no-headers 2>$null
if ($pods) {
    $runningPods = ($pods | Select-String "Running").Count
    $totalPods = ($pods | Measure-Object).Count
    
    Write-Host "   Pods: $runningPods/$totalPods running" -ForegroundColor $(if ($runningPods -eq $totalPods) { "Green" } else { "Yellow" })
    
    if ($runningPods -lt $totalPods) {
        Write-Host "`n   Pod Details:" -ForegroundColor Cyan
        kubectl get pods
        Write-Host "`n   → Some pods are not ready yet. Check logs with: kubectl logs <pod-name>" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ No pods found" -ForegroundColor Red
}

# 5. Vérifier les services
Write-Host "`n5. Checking services..." -ForegroundColor Yellow
$services = kubectl get services --no-headers 2>$null
if ($services) {
    $serviceCount = ($services | Measure-Object).Count
    Write-Host "   ✓ $serviceCount services created" -ForegroundColor Green
    kubectl get services
} else {
    Write-Host "   ✗ No services found" -ForegroundColor Red
}

# 6. Vérifier PVC
Write-Host "`n6. Checking Persistent Volume Claims..." -ForegroundColor Yellow
$pvc = kubectl get pvc --no-headers 2>$null
if ($pvc) {
    $boundPVC = ($pvc | Select-String "Bound").Count
    Write-Host "   ✓ PVC status: $boundPVC bound" -ForegroundColor Green
} else {
    Write-Host "   ✗ No PVC found" -ForegroundColor Red
}

# 7. Tester l'accès frontend
Write-Host "`n7. Testing frontend accessibility..." -ForegroundColor Yellow
Write-Host "   → Waiting for frontend to be ready (10 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

try {
    $response = Invoke-WebRequest -Uri "http://localhost:30000" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✓ Frontend accessible at http://localhost:30000 (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Frontend not accessible yet" -ForegroundColor Yellow
    Write-Host "   → Try accessing http://localhost:30000 in your browser" -ForegroundColor Cyan
    Write-Host "   → If it doesn't work, check pod logs: kubectl logs -l app=frontend" -ForegroundColor Cyan
}

# 8. Résumé
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Frontend URL: http://localhost:30000" -ForegroundColor White
Write-Host "`nUseful commands:" -ForegroundColor Yellow
Write-Host "  kubectl get pods              # Check pod status" -ForegroundColor Gray
Write-Host "  kubectl logs -l app=backend   # View backend logs" -ForegroundColor Gray
Write-Host "  kubectl logs -l app=frontend  # View frontend logs" -ForegroundColor Gray
Write-Host "  kubectl delete -f K8S/app.yml # Remove deployment" -ForegroundColor Gray
Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan
