import React from 'react';
import { ProcessedImage } from '../types';
import { formatFileSize } from '../utils/helpers';
import { DownloadIcon, DeleteIcon, LoadingIcon, ArrowIcon } from './Icon';
import { useLanguage } from '../contexts/LanguageContext';

interface ImageCardProps {
  image: ProcessedImage;
  onRemove: (id: string) => void;
  onPreview: (image: ProcessedImage) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onRemove, onPreview }) => {
  const { t } = useLanguage();
  
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (image.compressedUrl) {
      const link = document.createElement('a');
      link.href = image.compressedUrl;
      const extension = image.compressedBlob?.type.split('/')[1] || 'jpg';
      const originalName = image.originalFile.name.substring(0, image.originalFile.name.lastIndexOf('.'));
      link.download = `${originalName}_compressed.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300">
      {/* Preview Area */}
      <div 
        className="h-48 bg-gray-100 relative overflow-hidden group cursor-zoom-in"
        onClick={() => onPreview(image)}
      >
        <img 
          src={image.originalPreviewUrl} 
          alt="Preview" 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
           <span className="text-white font-medium bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
             {t('previewLabel')}
           </span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-gray-500 hover:text-red-500 hover:bg-white transition-colors shadow-sm"
          title="Remove"
        >
          <DeleteIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Info Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 truncate mb-3" title={image.originalFile.name}>
            {image.originalFile.name}
          </p>
          
          <div className="flex items-center justify-between text-sm bg-gray-50 rounded-lg p-3">
             <div className="text-center">
                <span className="block text-xs text-gray-500 uppercase">{t('originalLabel')}</span>
                <span className="font-semibold text-gray-700">{formatFileSize(image.originalFile.size)}</span>
             </div>
             <ArrowIcon className="w-4 h-4 text-gray-400" />
             <div className="text-center">
                <span className="block text-xs text-gray-500 uppercase">{t('compressedLabel')}</span>
                {image.status === 'done' && image.compressedBlob ? (
                   <span className="font-semibold text-emerald-600">{formatFileSize(image.compressedBlob.size)}</span>
                ) : (
                   <span className="text-gray-400 animate-pulse">...</span>
                )}
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-2">
            {image.status === 'done' && (
                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                   -{image.compressionRatio}%
                </div>
            )}
            
            {image.status === 'processing' ? (
                <button disabled className="flex items-center gap-2 w-full justify-center bg-gray-100 text-gray-400 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
                    <LoadingIcon className="w-4 h-4 animate-spin" />
                    {t('statusCompressing')}
                </button>
            ) : image.status === 'error' ? (
                 <span className="text-xs text-red-500 font-medium w-full text-center py-2">{t('statusFailed')}</span>
            ) : (
                <button 
                    onClick={handleDownload}
                    className="flex-1 ml-4 flex items-center justify-center gap-2 bg-gray-900 hover:bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <DownloadIcon className="w-4 h-4" />
                    {t('downloadBtn')}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
