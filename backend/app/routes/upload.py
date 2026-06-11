from fastapi import APIRouter, HTTPException, status
from ..models.upload import PresignedUrlRequest, PresignedUrlResponse
from ..services.s3_service import S3Service
from ..config import settings

router = APIRouter(prefix='/api/upload', tags=['upload'])
s3_service = S3Service()

@router.post('/presigned-url', response_model=PresignedUrlResponse)
async def get_presigned_url(request: PresignedUrlRequest):
    """Genera una URL pre-firmada para subir un archivo a S3"""
    try:
        # Extraer extensión para Content-Type
        extension = request.file_name.split('.')[-1].lower()
        content_type = s3_service.get_content_type_for_extension(extension)
        
        # Generar presigned URL con TTL
        result = s3_service.generate_presigned_url(
            key=request.file_name,
            content_type=content_type
        )
        
        return PresignedUrlResponse(
            presigned_url=result['presigned_url'],
            key=result['key'],
            expires_in=result['expires_in'],
            message=f"URL válida por {result['expires_in'] // 60} minutos."
        )
    except ValueError as e:
        # Error de validación (nombre o tipo de archivo no permitido)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Error genérico (puede ser de AWS o interno)
        print(f"Error interno: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor. Contacte al administrador."
        )