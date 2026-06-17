// frontend/src/components/PixelModal.jsx
import React from 'react';

const PixelModal = ({ title, message, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#000',
            border: '3px solid #ff0000',
            padding: '20px',
            zIndex: 1000,
            minWidth: '300px',
            boxShadow: '6px 6px 0px 0px #ff0000'
        }}>
            <div style={{
                color: '#ff0000',
                marginBottom: '10px',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '12px'
            }}>
                ⚠ ERROR: {title}
            </div>
            <div style={{
                color: '#ffffff',
                marginBottom: '20px',
                fontFamily: 'monospace',
                fontSize: '11px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
            }}>
                {message}
            </div>
            <button 
                className="pixel-button" 
                onClick={onClose}
                style={{
                    background: '#000',
                    border: '2px solid #ff0000',
                    color: '#ff0000',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '10px',
                    padding: '8px 16px',
                    cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                    e.target.style.background = '#ff0000';
                    e.target.style.color = '#000';
                }}
                onMouseOut={(e) => {
                    e.target.style.background = '#000';
                    e.target.style.color = '#ff0000';
                }}
            >
                [ OK ]
            </button>
        </div>
    );
};

export default PixelModal;