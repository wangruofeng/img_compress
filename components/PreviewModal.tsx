import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CloseIcon } from './Icon';

interface PreviewModalProps {
  originalUrl: string;
  compressedUrl: string | null;
  onClose: () => void;
  title: string;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ originalUrl, compressedUrl, onClose, title }) => {
  const [splitPosition, setSplitPosition] = useState(50); // 默认中间位置 (50%)
  const [isDragging, setIsDragging] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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

  const updateSplitPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPosition(percentage);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    updateSplitPosition(e.clientX);
  }, [isDragging, updateSplitPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    if (e.touches[0]) {
      updateSplitPosition(e.touches[0].clientX);
    }
  }, [updateSplitPosition]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging) return;
    if (e.touches[0]) {
      updateSplitPosition(e.touches[0].clientX);
    }
  }, [isDragging, updateSplitPosition]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // 监听图片加载完成，更新尺寸
  useEffect(() => {
    const handleImageLoad = () => {
      if (imageRef.current) {
        setImageSize({
          width: imageRef.current.offsetWidth,
          height: imageRef.current.offsetHeight
        });
      }
    };

    const img = imageRef.current;
    if (img) {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
        return () => img.removeEventListener('load', handleImageLoad);
      }
    }
  }, [originalUrl, compressedUrl]);

  // 如果没有压缩图，只显示原图
  if (!compressedUrl) {
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
            src={originalUrl} 
            alt={title} 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
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
        ref={containerRef}
        className="relative max-w-full max-h-[90vh] flex items-center justify-center rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
        style={{ cursor: isDragging ? 'col-resize' : 'default' }}
      >
        {/* 图片容器 - 确保两张图片尺寸一致 */}
        <div className="relative flex items-center justify-center">
          {/* 原图（完整显示，作为背景） */}
          <img 
            src={originalUrl} 
            alt={`${title} - 原图`}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain block"
            ref={imageRef}
          />

          {/* 压缩图（左侧裁剪显示，覆盖在原图上） */}
          <img 
            src={compressedUrl} 
            alt={`${title} - 压缩后`}
            className="absolute top-0 left-0 max-w-full max-h-[90vh] w-auto h-auto object-contain block"
            style={{ 
              clipPath: `inset(0 ${100 - splitPosition}% 0 0)`,
              pointerEvents: 'none',
              width: imageSize?.width || imageRef.current?.width || 'auto',
              height: imageSize?.height || imageRef.current?.height || 'auto'
            }}
          />
        </div>

        {/* 分割线 */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-20 transition-opacity"
          style={{ 
            left: `${splitPosition}%`,
            opacity: isDragging ? 1 : 0.8,
            cursor: 'col-resize',
            transform: 'translateX(-50%)',
            height: imageSize?.height || imageRef.current?.height || '100%'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* 拖拽手柄 */}
          <div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            style={{ cursor: 'col-resize' }}
          >
            <div className="flex gap-1">
              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-4 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 标签提示 */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10 z-30">
          压缩后
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium border border-white/10 z-30">
          原图
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
