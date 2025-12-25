# Docker Desktop Status Check Script
Write-Host "=== Docker Desktop Status Check ===" -ForegroundColor Cyan
Write-Host ""

# Check if Docker Desktop process is running
Write-Host "1. Checking Docker Desktop process..." -ForegroundColor Yellow
$dockerDesktop = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerDesktop) {
    Write-Host "   ✓ Docker Desktop process is running" -ForegroundColor Green
} else {
    Write-Host "   ✗ Docker Desktop process is NOT running" -ForegroundColor Red
    Write-Host "   → Please start Docker Desktop from the Start menu" -ForegroundColor Yellow
    exit 1
}

# Check Docker daemon
Write-Host ""
Write-Host "2. Checking Docker daemon..." -ForegroundColor Yellow
try {
    $dockerVersion = docker version --format '{{.Server.Version}}' 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Docker daemon is running (version: $dockerVersion)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Docker daemon is not responding" -ForegroundColor Red
        Write-Host "   → Wait for Docker Desktop to fully start (check system tray icon)" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ✗ Cannot connect to Docker daemon" -ForegroundColor Red
    Write-Host "   → Docker Desktop may still be starting up" -ForegroundColor Yellow
    exit 1
}

# Check Docker Compose
Write-Host ""
Write-Host "3. Checking Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version --short 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Docker Compose is available (version: $composeVersion)" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Docker Compose is not available" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Docker Compose check failed" -ForegroundColor Red
}

# Check Kubernetes
Write-Host ""
Write-Host "4. Checking Kubernetes..." -ForegroundColor Yellow
try {
    $k8sVersion = kubectl version --client --short 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ kubectl is installed" -ForegroundColor Green
        
        # Check if K8s cluster is accessible
        $clusterInfo = kubectl cluster-info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Kubernetes cluster is accessible" -ForegroundColor Green
        } else {
            Write-Host "   ✗ Kubernetes cluster is not accessible" -ForegroundColor Red
            Write-Host "   → Enable Kubernetes in Docker Desktop Settings" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ✗ kubectl is not installed or not in PATH" -ForegroundColor Red
    }
} catch {
    Write-Host "   ✗ Kubernetes check failed" -ForegroundColor Red
}

# Test with hello-world
Write-Host ""
Write-Host "5. Testing Docker with hello-world..." -ForegroundColor Yellow
try {
    $testOutput = docker run --rm hello-world 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✓ Docker is working correctly!" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Docker test failed" -ForegroundColor Red
        Write-Host "   Output: $testOutput" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Cannot run test container" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "If all checks passed, you can now run:" -ForegroundColor Green
Write-Host "  docker compose up --build" -ForegroundColor White
Write-Host ""
Write-Host "If checks failed, please:" -ForegroundColor Yellow
Write-Host "  1. Make sure Docker Desktop is open and running" -ForegroundColor White
Write-Host "  2. Check the system tray for the Docker whale icon" -ForegroundColor White
Write-Host "  3. Wait until the icon is steady (not animated)" -ForegroundColor White
Write-Host "  4. Run this script again to verify" -ForegroundColor White
