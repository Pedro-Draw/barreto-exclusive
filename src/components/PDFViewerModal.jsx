// src/components/PDFViewerModal.jsx
import React from 'react';
import { X } from 'lucide-react';

export default function PDFViewerModal({ pdfUrl, isOpen, onClose }) {
  if (!isOpen || !pdfUrl) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: 'white',
          width: '90%',
          maxWidth: '900px',
          height: '90vh',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            background: 'rgba(0,0,0,0.5)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={24} />
        </button>

        <iframe
          src={pdfUrl}
          title="Contrato Barreto Exclusive"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
}