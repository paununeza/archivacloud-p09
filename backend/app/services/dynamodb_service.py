import boto3
import time
from botocore.exceptions import ClientError
from ..config import settings

class DynamoDBService:
    def __init__(self):
        # Usar las mismas credenciales que S3
        self.client = boto3.client(
            'dynamodb',
            region_name=settings.aws_region
        )
        self.resource = boto3.resource(
            'dynamodb',
            region_name=settings.aws_region
        )
        self.table_name = 'database_dynamo'
        self.table = self.resource.Table(self.table_name)
        self.id_tabla = 'archivacloud-p09-pna'
    
    def save_upload_record(self, key: str, presigned_url: str, expires_in: int) -> bool:
        """
        Guarda el registro de la URL en DynamoDB al subir un archivo.
        """
        try:
            # Obtener el nombre del archivo (sin carpeta uploads/)
            filename = key.split('/')[-1] if '/' in key else key
            
            item = {
                'id_tabla': self.id_tabla,          # Partition Key
                'nombre_proyecto': filename,        # Sort Key
                'key': key,                         # Ruta completa en S3
                'presigned_url': presigned_url,     # URL temporal
                'expires_in': expires_in,           # TTL en segundos
                'created_at': int(time.time()),     # Timestamp de creación
                'ttl': int(time.time()) + expires_in  # Para expiración automática
            }
            
            self.table.put_item(Item=item)
            print(f"Registro guardado en DynamoDB: {key}")
            return True
            
        except ClientError as e:
            print(f"Error guardando en DynamoDB: {str(e)}")
            return False
    
    def delete_upload_record(self, key: str) -> bool:
        """
        Elimina el registro de DynamoDB cuando se elimina el archivo.
        """
        try:
            filename = key.split('/')[-1] if '/' in key else key
            
            self.table.delete_item(
                Key={
                    'id_tabla': self.id_tabla,
                    'nombre_proyecto': filename
                }
            )
            print(f"Registro eliminado de DynamoDB: {key}")
            return True
            
        except ClientError as e:
            print(f"Error eliminando de DynamoDB: {str(e)}")
            return False
    
    def get_upload_record(self, key: str) -> dict:
        """
        Obtiene un registro de DynamoDB por su key.
        """
        try:
            filename = key.split('/')[-1] if '/' in key else key
            
            response = self.table.get_item(
                Key={
                    'id_tabla': self.id_tabla,
                    'nombre_proyecto': filename
                }
            )
            return response.get('Item', {})
            
        except ClientError as e:
            print(f"Error obteniendo registro: {str(e)}")
            return {}
    
    def list_all_records(self) -> list:
        """
        Lista todos los registros del proyecto (para debugging).
        """
        try:
            response = self.table.query(
                KeyConditionExpression='id_tabla = :id',
                ExpressionAttributeValues={
                    ':id': self.id_tabla
                }
            )
            return response.get('Items', [])
            
        except ClientError as e:
            print(f"Error listando registros: {str(e)}")
            return []