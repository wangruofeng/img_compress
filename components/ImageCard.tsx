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
    <div className="glass-elevated rounded-2xl overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 group hover:border-primary/30 border border-transparent">
      {/* Preview Area */}
      <div
        className="h-48 bg-zinc-200 dark:bg-zinc-800/50 relative overflow-hidden group cursor-zoom-in"
        onClick={() => onPreview(image)}
      >
        <img
          src={image.originalPreviewUrl}
          alt="Preview"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
           <span className="text-white font-medium bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
             {t('previewLabel')}
           </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(image.id);
          }}
          className="absolute top-3 right-3 p-2 bg-black/40 dark:bg-black/40 backdrop-blur-sm rounded-full text-zinc-300 dark:text-zinc-400 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-500/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
          title="Remove"
        >
          <DeleteIcon className="w-4 h-4" />
        </button>

        {/* Status Badge */}
        {image.status === 'processing' && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-medium text-white flex items-center gap-2">
            <LoadingIcon className="w-3 h-3 animate-spin" />
            {t('statusCompressing')}
          </div>
        )}
        {image.status === 'error' && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500/90 backdrop-blur-sm rounded-full text-xs font-medium text-white">
            {t('statusFailed')}
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate mb-3" title={image.originalFile.name}>
            {image.originalFile.name}
          </p>

          <div className="flex items-center justify-between text-sm bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-200 dark:border-zinc-700/50">
             <div className="text-center">
                <span className="block text-xs text-zinc-500 uppercase tracking-wider">{t('originalLabel')}</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatFileSize(image.originalFile.size)}</span>
             </div>
             <ArrowIcon className="w-4 h-4 text-zinc-400" />
             <div className="text-center">
                <span className="block text-xs text-zinc-500 uppercase tracking-wider">{t('compressedLabel')}</span>
                {image.status === 'done' && image.compressedBlob ? (
                   <span className="font-semibold text-primary-dark dark:text-primary-light">{formatFileSize(image.compressedBlob.size)}</span>
                ) : (
                   <span className="text-zinc-500 animate-pulse">...</span>
                )}
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-2">
            {image.status === 'done' && (
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                   -{image.compressionRatio}%
                </div>
            )}

            {image.status === 'processing' ? (
                <button disabled className="flex items-center gap-2 w-full justify-center bg-zinc-200 dark:bg-zinc-800 text-zinc-500 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed border border-zinc-300 dark:border-zinc-700">
                    <LoadingIcon className="w-4 h-4 animate-spin" />
                    {t('statusCompressing')}
                </button>
            ) : image.status === 'error' ? (
                 <span className="text-xs text-red-500 dark:text-red-400 font-medium w-full text-center py-2 bg-red-500/10 rounded-lg border border-red-500/20">{t('statusFailed')}</span>
            ) : (
                <button
                    onClick={handleDownload}
                    className="flex-1 ml-3 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
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
