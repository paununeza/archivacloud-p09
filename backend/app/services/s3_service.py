import boto3
from botocore.config import Config as BotoConfig
from botocore.exceptions import ClientError
from ..config import settings

class S3Service:
    def __init__(self):
        # Configurar el cliente de S3 con la región y firma v4
        self.client = boto3.client(
            's3',
            region_name=settings.aws_region,
            config=BotoConfig(signature_version='s3v4')
        )
        self.bucket = settings.s3_bucket_name
        self.ttl = settings.presigned_url_ttl
    
    def generate_presigned_url(self, key: str, content_type: str) -> dict:
        """Genera una URL pre-firmada para subir un archivo a S3 + TTL (feature extra)"""
        try:
            presigned_url = self.client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket,
                    'Key': key,
                    'ContentType': content_type
                },
                ExpiresIn=self.ttl
            )
            return {
                "presigned_url": presigned_url,
                "key": key,
                "expires_in": self.ttl
            }
        
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == 'AccessDenied':
                raise Exception("No hay permisos para generar la URL")
            elif error_code == 'NoSuchBucket':
                raise Exception(f"El bucket {self.bucket} no existe")
            else:
                raise Exception(f"Error generando URL: {str(e)}")
    
    def get_content_type_for_extension(self, extension: str) -> str:
        """Obtiene Content-Type según extensión"""
        content_types = {
            'png': 'image/png',
            'svg': 'image/svg+xml'
        }
        return content_types.get(extension.lower(), 'application/octet-stream')