# Builds a sideloadable debug APK: Vite web build, Capacitor sync, Gradle assembleDebug.
# Usage (from repo root or anywhere):
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools/android/build-apk.ps1
#   npm run android:apk

param(
    [switch] $SkipSync,
    [switch] $NoCopy
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "../..")).Path
Set-Location $repoRoot

function Write-Step([string] $message) {
    Write-Host ""
    Write-Host "==> $message" -ForegroundColor Cyan
}

function Assert-Command([string] $name) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $name"
    }
}

function Get-AndroidSdkPath {
    $candidates = @(
        $env:ANDROID_HOME,
        $env:ANDROID_SDK_ROOT,
        (Join-Path $env:LOCALAPPDATA "Android\Sdk")
    )
    foreach ($candidate in $candidates) {
        if ([string]::IsNullOrWhiteSpace($candidate)) {
            continue
        }
        if (Test-Path -LiteralPath $candidate) {
            return (Resolve-Path $candidate).Path
        }
    }
    return $null
}

function Ensure-LocalProperties([string] $sdkPath) {
    $propertiesPath = Join-Path $repoRoot "android\local.properties"
    $escaped = $sdkPath.Replace("\", "\\").Replace(":", "\:")
    $contents = "sdk.dir=$escaped`n"
    if (Test-Path -LiteralPath $propertiesPath) {
        $existing = Get-Content -LiteralPath $propertiesPath -Raw
        if ($existing -match "sdk\.dir=") {
            return
        }
    }
    Set-Content -LiteralPath $propertiesPath -Value $contents -Encoding ASCII
    Write-Host "Wrote android/local.properties with sdk.dir=$sdkPath"
}

Write-Step "Checking tools"
Assert-Command "node"
Assert-Command "npm"
if (-not (Get-Command "java" -ErrorAction SilentlyContinue)) {
    throw "Java is not on PATH. Install JDK 17+ and set JAVA_HOME."
}

$sdkPath = Get-AndroidSdkPath
if (-not $sdkPath) {
    throw "Android SDK not found. Install Android Studio or set ANDROID_HOME."
}
Write-Host "Node: $(node -v)"
$javaVersion = cmd /c "java -version 2>&1" | Select-Object -First 1
Write-Host "Java: $javaVersion"
Write-Host "Android SDK: $sdkPath"
Ensure-LocalProperties $sdkPath

if (-not (Test-Path -LiteralPath (Join-Path $repoRoot "node_modules"))) {
    Write-Step "Installing npm dependencies"
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed with exit code $LASTEXITCODE"
    }
}

if (-not $SkipSync) {
    Write-Step "Building web assets and syncing Capacitor"
    npm run android:sync
    if ($LASTEXITCODE -ne 0) {
        throw "android:sync failed with exit code $LASTEXITCODE"
    }
}

Write-Step "Assembling debug APK"
$gradlew = Join-Path $repoRoot "android\gradlew.bat"
if (-not (Test-Path -LiteralPath $gradlew)) {
    throw "Gradle wrapper missing: android/gradlew.bat"
}

Push-Location (Join-Path $repoRoot "android")
try {
    & $gradlew assembleDebug --quiet
    if ($LASTEXITCODE -ne 0) {
        throw "Gradle assembleDebug failed with exit code $LASTEXITCODE"
    }
} finally {
    Pop-Location
}

$builtApk = Join-Path $repoRoot "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path -LiteralPath $builtApk)) {
    throw "APK was not produced at $builtApk"
}

$destApk = Join-Path $repoRoot "MagnetRover-debug.apk"
if (-not $NoCopy) {
    Copy-Item -LiteralPath $builtApk -Destination $destApk -Force
}

Write-Host ""
Write-Host "APK ready:" -ForegroundColor Green
Write-Host "  $builtApk"
if (-not $NoCopy) {
    Write-Host "  $destApk"
}
Write-Host "Install on a device: adb install -r `"$destApk`""
