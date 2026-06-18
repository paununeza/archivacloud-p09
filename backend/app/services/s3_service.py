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
        """Genera una URL pre-firmada para subir un archivo a S3 + TTL """
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
    
    def list_files(self, prefix: str = "uploads/") -> list:
        """Lista todos los archivos en el bucket bajo el prefijo"""
        try:
            response = self.client.list_objects_v2(
                Bucket=self.bucket,
                Prefix=prefix
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    files.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat(),
                        'filename': obj['Key'].split('/')[-1]
                    })

                files.sort(key=lambda x: x['last_modified'], reverse=True)
                
            return files
        except ClientError as e:
            raise Exception(f"Error listando archivos: {str(e)}")
        
    def delete_file(self, key: str) -> bool:
        """Elimina un archivo del bucket"""
        try:
            self.client.delete_object(
                Bucket=self.bucket,
                Key=key
            )
            return True
        except ClientError as e:
            raise Exception(f"Error eliminando archivo: {str(e)}")
        
    # backend/app/services/s3_service.py

    def generate_download_url(self, key: str) -> dict:
            """Genera presigned URL para DESCARGAR (GET)"""
            try:
                presigned_url = self.client.generate_presigned_url(
                    'get_object',  # ← CAMBIO IMPORTANTE
                    Params={
                        'Bucket': self.bucket,
                        'Key': key
                    },
                    ExpiresIn=self.ttl
                )
                return {
                    'download_url': presigned_url,
                    'key': key,
                    'expires_in': self.ttl
                }
            except ClientError as e:
                error_code = e.response['Error']['Code']
                if error_code == 'AccessDenied':
                    raise Exception("No hay permisos para generar la URL de descarga")
                elif error_code == 'NoSuchKey':
                    raise Exception(f"El archivo {key} no existe")
                else:
                    raise Exception(f"Error generando URL: {str(e)}")