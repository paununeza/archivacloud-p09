from fastapi import APIRouter, HTTPException, status
from ..services.s3_service import S3Service

router = APIRouter(prefix='/api/files', tags=['files'])
s3_service = S3Service()

@router.get('/')
async def list_files():
    """Lista todos los archivos en el bucket"""
    try:
        files = s3_service.list_files()
        return {'files': files, 'count': len(files)}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error listando archivos"
        )

@router.delete('/{key:path}')
async def delete_file(key: str):
    """Elimina un archivo del bucket"""
    try:
        s3_service.delete_file(key)
        return {'message': f'Archivo {key} eliminado correctamente'}
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error eliminando archivo"
        )
    
@router.get('/download/{key:path}')
async def get_download_url(key: str):
    """Genera una presigned URL para descargar un archivo"""
    try:
        result = s3_service.get_download_url(key)
        return {
            'download_url': result['download_url'],
            'key': result['key'],
            'expires_in': result['expires_in']
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error generando URL de descarga"
        )