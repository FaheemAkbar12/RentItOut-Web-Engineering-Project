# RentItOut Backend Setup Script
# Run this script to check and setup your backend

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  RentItOut Backend Setup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is NOT installed" -ForegroundColor Red
    Write-Host "  Please download from: https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is NOT installed" -ForegroundColor Red
    exit 1
}

# Check if backend folder exists
Write-Host ""
Write-Host "Checking backend folder..." -ForegroundColor Yellow
if (Test-Path "d:\Web Project\backend") {
    Write-Host "✓ Backend folder found" -ForegroundColor Green
} else {
    Write-Host "✗ Backend folder not found" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
Write-Host "Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "d:\Web Project\backend\node_modules") {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠ Dependencies not installed" -ForegroundColor Yellow
    Write-Host "  Installing now..." -ForegroundColor Yellow
    cd "d:\Web Project\backend"
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check .env file
Write-Host ""
Write-Host "Checking configuration..." -ForegroundColor Yellow
if (Test-Path "d:\Web Project\backend\.env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
    
    # Check if it's configured
    $envContent = Get-Content "d:\Web Project\backend\.env" -Raw
    
    $needsConfig = $false
    
    if ($envContent -match "YOUR_CLERK_PUBLISHABLE_KEY") {
        Write-Host "⚠ Clerk keys need to be configured" -ForegroundColor Yellow
        $needsConfig = $true
    }
    
    if ($envContent -match "your_cloud_name") {
        Write-Host "⚠ Cloudinary credentials need to be configured" -ForegroundColor Yellow
        $needsConfig = $true
    }
    
    if ($needsConfig) {
        Write-Host ""
        Write-Host "Configuration needed:" -ForegroundColor Cyan
        Write-Host "1. Get Clerk keys from: https://dashboard.clerk.com/" -ForegroundColor White
        Write-Host "2. Get Cloudinary from: https://cloudinary.com/" -ForegroundColor White
        Write-Host "3. Edit: d:\Web Project\backend\.env" -ForegroundColor White
    } else {
        Write-Host "✓ Configuration looks complete" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ .env file not found, using .env.example" -ForegroundColor Yellow
    Copy-Item "d:\Web Project\backend\.env.example" "d:\Web Project\backend\.env"
    Write-Host "✓ Created .env file" -ForegroundColor Green
    Write-Host "  Please configure it before starting the server" -ForegroundColor Yellow
}

# Check MongoDB
Write-Host ""
Write-Host "Checking MongoDB..." -ForegroundColor Yellow
try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService) {
        if ($mongoService.Status -eq "Running") {
            Write-Host "✓ MongoDB service is running" -ForegroundColor Green
        } else {
            Write-Host "⚠ MongoDB service exists but not running" -ForegroundColor Yellow
            Write-Host "  Starting MongoDB..." -ForegroundColor Yellow
            Start-Service -Name "MongoDB"
            Write-Host "✓ MongoDB started" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠ MongoDB service not found" -ForegroundColor Yellow
        Write-Host "  Options:" -ForegroundColor Cyan
        Write-Host "  1. Install MongoDB locally: https://www.mongodb.com/try/download/community" -ForegroundColor White
        Write-Host "  2. Use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas" -ForegroundColor White
    }
} catch {
    Write-Host "⚠ Could not check MongoDB status" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Setup Summary" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Configure .env file with your API keys" -ForegroundColor White
Write-Host "2. Ensure MongoDB is running" -ForegroundColor White
Write-Host "3. Start the backend server:" -ForegroundColor White
Write-Host "   cd 'd:\Web Project\backend'" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open your browser to test:" -ForegroundColor White
Write-Host "   http://localhost:5000/health" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to start the server now
Write-Host "Would you like to start the backend server now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "Starting backend server..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
    Write-Host ""
    cd "d:\Web Project\backend"
    npm run dev
}
