## Reporte de Seguridad (SEC-01 a SEC-10)

**Proyecto:** ArchivaCloud SpA

### SEC-01: Secretos fuera del repositorio
Se configuró el archivo `.gitignore` para excluir el archivo `.env` del control de versiones. Las credenciales de AWS Academy, debido a su naturaleza temporal, no se almacenan en archivos locales, sino que se inyectan dinámicamente como variables de entorno mediante un script de PowerShell (`setup-session.ps1`). Esto reduce el riesgo de exposición de credenciales en el repositorio. Además, se incluye un archivo `.env.example` en GitHub como plantilla de configuración.

### SEC-02: CORS restrictivo
Tanto el middleware de FastAPI como la configuración CORS del bucket de Amazon S3 limitan explícitamente `AllowedOrigins` a `http://localhost:5173`. De esta forma, únicamente la aplicación frontend autorizada puede realizar solicitudes desde el navegador, reduciendo la superficie de exposición frente a orígenes no autorizados.

### SEC-03: Validación de entrada
El backend utiliza modelos de `Pydantic` para validar los datos recibidos. Los nombres de archivo se sanitizan mediante expresiones regulares (`re.sub`), reemplazando secuencias potencialmente peligrosas, como `../`, por guiones bajos para prevenir ataques de *Path Traversal*. Adicionalmente, se aplica una validación mediante lista blanca (`AllowedExtensions`) que solo permite archivos con extensión `.png` y `.svg`.

### SEC-04: Límite de tamaño
La aplicación respeta el límite de tamaño definido para P-09. La clase `Settings` de Pydantic valida que el tamaño del archivo no supere los 6 MB (`fileSizeMb > 6`). Si el límite es excedido, la solicitud es rechazada antes de generar la URL prefirmada (*Presigned URL*), evitando el consumo innecesario de recursos y ancho de banda.

### SEC-05: IAM con principio de mínimo privilegio
Se reemplazaron los permisos globales por una política administrada asociada al rol de la aplicación. La política restringe el acceso exclusivamente a las acciones `PutObject`, `GetObject`, `ListBucket` y `DeleteObject`, limitadas al recurso `arn:aws:s3:::archivacloud-p09-pna`, aplicando el principio de mínimo privilegio.

### SEC-06: Bucket S3 sin acceso público
El bucket de Amazon S3 fue configurado con la opción **Block All Public Access** habilitada,  garantizando que los objetos solo puedan accederse mediante solicitudes autenticadas.

### SEC-07: Manejo seguro de errores
Las operaciones realizadas con `boto3` se encuentran protegidas mediante bloques `try/except` que capturan excepciones `ClientError`. Los detalles técnicos de las excepciones se registran únicamente para fines de diagnóstico, mientras que al cliente se le devuelve una respuesta genérica mediante `HTTPException` con código HTTP 500, evitando exponer información sensible sobre la infraestructura.

### SEC-08: Cifrado en reposo
El bucket de Amazon S3 fue configurado con cifrado del lado del servidor (`SSE-S3`), utilizando el algoritmo AES-256 para proteger automáticamente todos los objetos almacenados.

### SEC-09: Escaneo de dependencias
Se realizaron auditorías de seguridad en ambos componentes del proyecto. En el backend se ejecutó `pip-audit`, corrigiendo una vulnerabilidad documentada mediante la actualización de `pydantic-settings` a la versión 2.14.2. En el frontend se utilizó `npm audit` para detectar vulnerabilidades en las dependencias de Node.js, pero no se encontraron riesgos.

### SEC-10: TLS de extremo a extremo
En el entorno MVP, se garantiza el encriptado en tránsito mediante la utilización obligatoria de los endpoints `https://` generados nativamente por el SDK de AWS Boto3. 