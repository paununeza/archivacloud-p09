from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .routes import upload_router
from .config import settings

#Aplicacion FastAPI
app = FastAPI(
    title="ArchivaCloud API",
    description="API para portal de carga de archivos a Amazon S3",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
    expose_headers=["ETag"]
)

# Incluir routers
app.include_router(upload_router)

# Endpoint health check
@app.get("/healthz", tags=["health"])
async def health_check():
    """Endpoint para verificar estado de la API"""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "region": settings.aws_region,
            "bucket": settings.s3_bucket_name,
            "feature_extra": "Enlace temporal de descarga con TTL 60 minutos",
            "allowed_extensions": settings.allowed_extensions,
            "max_size_mb": settings.max_file_size_mb
        }
    )

# Endpoint raíz
@app.get("/", tags=["root"])
async def root():
    return {
        "message": "ArchivaCloud API v1.0.0",
        "endpoints": {
            "docs": "/api/docs",
            "health": "/healthz",
            "presigned_url": "POST /api/upload/presigned-url"
        }
    }