import React, { useEffect } from 'react';
import { CloseIcon } from './Icon';

interface PreviewModalProps {
  imageUrl: string;
  onClose: () => void;
  title: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ imageUrl, onClose, title }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <h3 className="text-white text-sm font-medium hidden sm:block bg-black/50 px-3 py-1 rounded-full border border-white/10">
          {title}
        </h3>
        <button 
          onClick={onClose}
          className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors border border-white/20"
        >
          <CloseIcon className="w-6 h-6" />
        </button>
      </div>

      <div 
        className="max-w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={imageUrl} 
          alt={title} 
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
        />
      </div>
    </div>
  );
};

export default PreviewModal;
