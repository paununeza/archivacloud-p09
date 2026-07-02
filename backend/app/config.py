from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # AWS Configuracion
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "archivacloud-p09-pna"
    
    # Configuracion de la Aplicacion
    presigned_url_ttl: int = 3600  # 60 minutos (feature extra)
    allowed_extensions: List[str] = ["png", "svg"]
    max_file_size_mb: int = 6
    max_file_size_bytes: int = 6 * 1024 * 1024
    
    # CORS
    cors_allowed_origins: List[str] = ["http://localhost:5173"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()