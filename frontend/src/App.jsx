import React, { useState, useEffect } from 'react';
import { getPresignedUrl, uploadToS3, listFiles, deleteFile } from './services/api';
import './styles/pixelart.css';

function App() {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [uploadingFile, setUploadingFile] = useState('');

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
            setError('FAILED TO LOAD FILE LIST');
        }
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError(`FILE TYPE NOT ALLOWED.\nONLY PNG AND SVG.\nRECEIVED: ${file.type}`);
            return;
        }

        if (file.size > MAX_SIZE) {
            setError(`MAX SIZE EXCEEDED.\nLIMIT: 6MB\nFILE: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
            return;
        }

        setUploading(true);
        setProgress(0);
        setError('');
        setMessage('');
        setUploadingFile(file.name);

        try {
            const { presigned_url, key } = await getPresignedUrl(file.name, file.type);
            
            await uploadToS3(presigned_url, file, (percent) => {
                setProgress(percent);
            });
            
            setMessage(`${file.name} UPLOADED SUCCESSFULLY`);
            await loadFiles();
        } catch (err) {
            setError(`UPLOAD FAILED: ${err.message || 'UNKNOWN ERROR'}`);
        } finally {
            setUploading(false);
            setUploadingFile('');
            setProgress(0);
        }
    };

    const handleDelete = async (key, filename) => {
        const confirm = window.confirm(`DELETE ${filename}?\nTHIS ACTION IS IRREVERSIBLE.`);
        if (confirm) {
            try {
                await deleteFile(key);
                setMessage(`${filename} DELETED`);
                await loadFiles();
            } catch (err) {
                setError('DELETE FAILED');
            }
        }
    };

    const handleDownload = async (key, filename) => {
        try {
            const response = await getPresignedUrl(filename, 'image/png');
            window.open(response.presigned_url, '_blank');
        } catch (err) {
            setError('DOWNLOAD FAILED');
        }
    };

    // ASCII decoration
    const asciiArt = `
┌─────────────────────────────────────┐
│  ARCHIVACLOUD.SYS    v1.0           │
├─────────────────────────────────────┤
│  PORTAL DE CARGA A S3               │
│  REGION: us-east-1                  │
│  BUCKET: archivacloud-p09-pna       │
└─────────────────────────────────────┘
    `;

    return (
        <div>
            <pre className="pixel-decoration">{asciiArt}</pre>

            <div className="pixel-window">
                <div className="pixel-window-header">
                    ⚡ UPLOAD TERMINAL [{uploading ? 'BUSY' : 'READY'}]
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
                    📁 SELECT FILE
                </label>

                {uploading && (
                    <div style={{ marginTop: '16px' }}>
                        <div>DOWNLOADING: {uploadingFile}</div>
                        <div className="pixel-progress">
                            <div className="pixel-progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div>{progress}% COMPLETE</div>
                        <div className="pixel-blink">PROCESSING...</div>
                    </div>
                )}
            </div>

            {message && (
                <div className="pixel-success">
                    {message}
                </div>
            )}

            {error && (
                <div className="pixel-error">
                    {error.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                    ))}
                </div>
            )}

            <div className="pixel-window">
                <div className="pixel-window-header">
                    FILE INDEX [{files.length} ENTRIES]
                </div>
                
                {files.length === 0 ? (
                    <div>NO FILES FOUND IN S3 BUCKET</div>
                ) : (
                    <table className="pixel-table">
                        <thead>
                            <tr>
                                <th>FILENAME</th>
                                <th>SIZE</th>
                                <th>DATE</th>
                                <th>ACTION</th>
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
                                            📥 GET
                                        </button>
                                        <button 
                                            className="pixel-button pixel-button-danger" 
                                            style={{ fontSize: '8px' }}
                                            onClick={() => handleDelete(file.key, file.filename)}
                                        >
                                            🗑️ DEL
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
                <div>FEATURE EXTRA: PRESIGNED URL TTL = 60 MIN</div>
                <div>ALLOWED TYPES: PNG / SVG</div>
                <div>MAX SIZE: 6 MB</div>
                <div>STATUS: <span className="pixel-blink">ONLINE</span></div>
            </div>
        </div>
    );
}

export default App;