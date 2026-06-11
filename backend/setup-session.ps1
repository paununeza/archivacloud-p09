# setup-session.ps1
Write-Host "=== Configuración de entorno ArchivaCloud ===" -ForegroundColor Cyan

# 1. Solicitar credenciales
$AccessKey = Read-Host "AWS_ACCESS_KEY_ID"
$SecretKey = Read-Host "AWS_SECRET_ACCESS_KEY"
$SessionToken = Read-Host "AWS_SESSION_TOKEN"

# 2. Configurar entorno
$env:AWS_ACCESS_KEY_ID = $AccessKey
$env:AWS_SECRET_ACCESS_KEY = $SecretKey
$env:AWS_SESSION_TOKEN = $SessionToken
$env:AWS_REGION = "us-east-1"

Write-Host "✅ Credenciales configuradas" -ForegroundColor Green

# 3. Verificar credenciales (opcional)
aws sts get-caller-identity


# 4. Ir a backend e iniciar
#cd backend
#if (-not (Test-Path "venv")) {
#    python -m venv venv
#}
#.\venv\Scripts\activate
#pip install -r requirements.txt
#python run.py
