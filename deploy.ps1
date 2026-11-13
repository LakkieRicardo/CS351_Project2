$ErrorActionPreference = 'Stop'

$repositoryRoot = $PSScriptRoot
$frontendDirectory = Join-Path $repositoryRoot 'frontend\client'
$backendSource = Join-Path $repositoryRoot 'backend\server'
$distDirectory = Join-Path $repositoryRoot 'dist'
$staticDirectory = Join-Path $distDirectory 'static'
$backendDirectory = Join-Path $distDirectory 'backend'

Push-Location $frontendDirectory
try {
    npm ci
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend dependency installation failed with exit code $LASTEXITCODE."
    }

    npm run build -- --mode production --base=/ --outDir $staticDirectory --emptyOutDir
    if ($LASTEXITCODE -ne 0) {
        throw "Frontend build failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}

if (Test-Path -LiteralPath $backendDirectory) {
    Remove-Item -LiteralPath $backendDirectory -Recurse -Force
}
New-Item -ItemType Directory -Path $backendDirectory -Force | Out-Null

Get-ChildItem -LiteralPath $backendSource -Force |
    Where-Object { $_.Name -ne 'node_modules' -and $_.Name -ne '.env' } |
    ForEach-Object {
        Copy-Item -LiteralPath $_.FullName -Destination $backendDirectory -Recurse -Force
    }

Push-Location $backendDirectory
try {
    npm ci --omit=dev
    if ($LASTEXITCODE -ne 0) {
        throw "Backend dependency installation failed with exit code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}

Write-Host "Deployment files are ready in $distDirectory. Starting the backend server..."

Push-Location $backendDirectory
try {
    node .\server.js
    if ($LASTEXITCODE -ne 0) {
        throw "Backend server exited with code $LASTEXITCODE."
    }
}
finally {
    Pop-Location
}
