import React from 'react';

const PixelModal = ({ title, message, onClose }) => {
    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#333333',
            border: '3px solid #3a6399',
            padding: '20px',
            zIndex: 1000,
            minWidth: '300px',
            boxShadow: '6px 6px 0px 0px #00324d'
        }}>
            <div style={{
                color: '#c9402e',
                marginBottom: '10px',
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '12px'
            }}>
                 ✦ {title} ✦ 
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
                    border: '2px solid #3a6399',
                    color: '#3a6399',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '10px',
                    padding: '8px 16px',
                    cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                    e.target.style.background = '#c9402e';
                    e.target.style.color = '#000';
                }}
                onMouseOut={(e) => {
                    e.target.style.background = '#000';
                    e.target.style.color = '#3a6399';
                }}
            >
                [ OK ]
            </button>
        </div>
    );
};

export default PixelModal;