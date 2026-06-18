import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
});

export const getPresignedUrl = async (fileName, fileType) => {
    const response = await api.post('/upload/presigned-url', { file_name: fileName, file_type: fileType });
    return response.data;
};

export const uploadToS3 = async (url, file) => {
    return await axios.put(url, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            return percentCompleted;
        }
    });
};

export const listFiles = async () => {
    const response = await api.get('/files');
    return response.data;
};

export const deleteFile = async (key) => {
    const response = await api.delete(`/files/${encodeURIComponent(key)}`);
    return response.data;
};

export const getDownloadUrl = async (key) => {
    const response = await api.get(`/files/download/${encodeURIComponent(key)}`);
    return response.data;
};