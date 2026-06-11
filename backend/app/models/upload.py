from pydantic import BaseModel, Field, field_validator
import re
from ..config import settings

class PresignedUrlRequest(BaseModel):
    file_name: str = Field(..., description="Nombre del archivo a subir")
    file_type: str = Field(..., description="Tipo del archivo")
    
    @field_validator('file_name')
    @classmethod
    def validate_file_name(cls, v: str) -> str:
        """Validación y sanitización de nombres de archivo"""
        # Verificar que no esté vacío
        if not v or len(v) == 0:
            raise ValueError('El nombre del archivo no puede estar vacío')
        
        # Limitar longitud
        if len(v) > 255:
            raise ValueError('El nombre del archivo es demasiado largo (máx 255 caracteres)')
        
        # Detectar path traversal y caracteres peligrosos
        dangerous_patterns = ['..', '/', '\\', '%00', '\x00']
        for pattern in dangerous_patterns:
            if pattern in v:
                raise ValueError(f'Caracteres no permitidos en el nombre: {pattern}')
        
        # Validar extensión permitida (PNG, SVG)
        if '.' not in v:
            raise ValueError('El archivo debe tener una extensión válida')
        
        extension = v.split('.')[-1].lower()
        if extension not in settings.allowed_extensions:
            raise ValueError(
                f'Tipo de archivo no permitido. Permitidos: {", ".join(settings.allowed_extensions)}'
            )
        
        # Sanitizar nombre (reemplazar caracteres peligrosos)
        safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', v)
        
        # Poner en carpeta uploads/
        return f"uploads/{safe_name}"
    
    @field_validator('file_type')
    @classmethod
    def validate_file_type(cls, v: str) -> str:
        """Validar que el tipo de archivo coincida con las extensiones permitidas"""
        allowed_mime_types = {
            'png': ['image/png'],
            'svg': ['image/svg+xml', 'image/svg']
        }
        
        # Extraer extensión del tipo de archivo
        extension = None
        for ext, mime_types in allowed_mime_types.items():
            if v.lower() in mime_types:
                extension = ext
                break
        
        if not extension:
            raise ValueError(f'Tipo de archivo no permitido: {v}')
        
        return v

class PresignedUrlResponse(BaseModel):
    presigned_url: str
    key: str
    expires_in: int
    message: str