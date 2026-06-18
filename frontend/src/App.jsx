import React, { useState, useEffect } from 'react';
import { getPresignedUrl, uploadToS3, listFiles, deleteFile, getDownloadUrl } from './services/api';
import PixelModal from './components/PixelModal';
import './styles/pixelart.css';

function App() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [uploadingFile, setUploadingFile] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    const MAX_SIZE = 6 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/png', 'image/svg+xml'];

    useEffect(() => {
        loadFiles();
    }, []);

    const loadFiles = async () => {
        try {
            const data = await listFiles();
            setFiles(data.files || []);
        } catch (err) {
            showError('ERROR', 'NO SE PUDO CARGAR LA LISTA DE ARCHIVOS');
        }
    };

    const showError = (title, message) => {
        setShowModal(false); // Forzar cierre
        setTimeout(() => {
            setModalTitle(title);
            setModalMessage(message);
            setShowModal(true);
        }, 50);
    };

    const closeModal = () => {
        setShowModal(false);
        setTimeout(() => {
            setModalTitle('');
            setModalMessage('');
        }, 100);
    };


    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            showError('ERROR', `TIPO DE ARCHIVO NO PERMITIDO.\nSOLO PNG Y SVG.\nRECIBIDO: ${file.type}`);
            return;
        }

        if (file.size > MAX_SIZE) {
            showError('ERROR', `TAMAÑO MAXIMO EXCEDIDO.\nLIMITE: 6MB\nARCHIVO: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return;
        }

        setUploading(true);
        setProgress(0);
        /*setError('');*/
        setMessage('');
        setUploadingFile(file.name);

        try {
            const { presigned_url, key } = await getPresignedUrl(file.name, file.type);
            
            await uploadToS3(presigned_url, file, (percent) => {
                setProgress(percent);
            });
            
            setMessage(`${file.name} CARGA EXITOSA`);
            await loadFiles();
        } catch (err) {
            showError('ERROR', `ERROR AL CARGAR EL ARCHIVO: ${err.message || 'ERROR DESCONOCIDO'}`);
        } finally {
            setUploading(false);
            setUploadingFile('');
            setProgress(0);
        }
    };

    const handleDelete = async (key, filename) => {
        const confirm = window.confirm(`ELIMINAR ${filename}?\nLA ACCION ES IRREVERSIBLE`);
        if (confirm) {
            try {
                await deleteFile(key);
                setMessage(`${filename} ELIMINADO`);
                await loadFiles();
            } catch (err) {
                 showError('ERROR AL ELIMINAR', 'NO SE PUDO ELIMINAR EL ARCHIVO');
            }
        }
    };

    const handleDownload = async (key, filename) => {
        try {
            const response = await getDownloadUrl(key);
            window.open(response.download_url, '_blank');
            setMessage(`DESCARGANDO: ${filename}`);
        } catch (err) {
            showError('DESCARGA FALLIDA', 'No se pudo obtener URL de descarga');
        }
    };


    // ASCII decoration
    const asciiArt = `
┌─────────────────────────────────────┐
│  ARCHIVACLOUD.SYS    v1.0           │
├─────────────────────────────────────┤
│  REGION: us-east-1                  │
│  BUCKET: archivacloud-p09-pna       │
└─────────────────────────────────────┘
    `;

    return (
        <div>
            <pre className="pixel-decoration">{asciiArt}</pre>

            <div className="pixel-window">
                <div className="pixel-window-header">
                    PORTAL DE CARGA
                </div>
                
                <input 
                    type="file" 
                    onChange={handleUpload} 
                    disabled={uploading} 
                    accept=".png,.svg"
                    style={{ display: 'none' }}
                    id="file-input"
                />
                <label htmlFor="file-input" className="pixel-button">
                    SELECCIONAR ARCHIVO
                </label>

                {uploading && (
                    <div style={{ marginTop: '16px' }}>
                        <div>DESCARGANDO: {uploadingFile}</div>
                        <div className="pixel-progress">
                            <div className="pixel-progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div>{progress}% COMPLETADO</div>
                        <div className="pixel-blink">PROCESANDO...</div>
                    </div>
                )}
            </div>

            {message && (
                <div className="pixel-success">
                    {message}
                </div>
            )}

            <div className="pixel-window">
                <div className="pixel-window-header">
                    INDICE DE ARCHIVOS [{files.length} REGISTROS]
                </div>
                
                {files.length === 0 ? (
                    <div>NO SE ENCONTRARON ARCHIVOS EN S3 BUCKET</div>
                ) : (
                    <table className="pixel-table">
                        <thead>
                            <tr>
                                <th>NOMBRE</th>
                                <th>TAMAÑO</th>
                                <th>FECHA</th>
                                <th>ACCION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.key}>
                                    <td>{file.filename}</td>
                                    <td>{(file.size / 1024).toFixed(2)} KB</td>
                                    <td>{new Date(file.last_modified).toLocaleString()}</td>
                                    <td>
                                        <button 
                                            className="pixel-button" 
                                            style={{ fontSize: '8px', marginRight: '4px' }}
                                            onClick={() => handleDownload(file.key, file.filename)}
                                        >
                                            GET
                                        </button>
                                        <button 
                                            className="pixel-button pixel-button-danger" 
                                            style={{ fontSize: '8px' }}
                                            onClick={() => handleDelete(file.key, file.filename)}
                                        >
                                            DEL
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="pixel-window">
                <div className="pixel-window-header">
                    SYSTEM INFO
                </div>
                <div>FEATURE EXTRA: ENLACE TEMPORAL DESCARGA TTL = 60 MIN</div>
                <div>PERMITIDO: PNG / SVG</div>
                <div>TAMAÑO MAX: 6 MB</div>
                <div>ESTADO: <span className="pixel-blink">ONLINE</span></div>
            </div>
            
            {showModal && (
                <PixelModal
                    title={modalTitle}
                    message={modalMessage}
                    onClose={closeModal}
                />
            )}

        </div>
    );
}

export default App;