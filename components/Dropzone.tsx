import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icon';
import { useLanguage } from '../contexts/LanguageContext';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = (Array.from(e.dataTransfer.files) as File[]).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = (Array.from(e.target.files) as File[]).filter(file => 
        file.type.startsWith('image/')
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
    }
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300
        ${isDragging 
          ? 'border-emerald-500 bg-emerald-50 scale-[1.01]' 
          : 'border-gray-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/30'
        }
      `}
    >
      <input
        type="file"
        multiple
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      
      <div className="flex flex-col items-center justify-center gap-4">
        <div className={`
          p-4 rounded-full transition-colors duration-300
          ${isDragging ? 'bg-emerald-200' : 'bg-emerald-100 group-hover:bg-emerald-200'}
        `}>
          <UploadIcon className="w-8 h-8 text-emerald-600" />
        </div>
        
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('dropzoneTitle')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('dropzoneSub')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;
