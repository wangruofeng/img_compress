import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { ProcessedImage, CompressionSettings } from './types';
import { generateId, formatFileSize } from './utils/helpers';
import { compressImage } from './utils/compressor';
import Header from './components/Header';
import Dropzone from './components/Dropzone';
import SettingsPanel from './components/SettingsPanel';
import ImageCard from './components/ImageCard';
import PreviewModal from './components/PreviewModal';
import { DownloadIcon, LoadingIcon, DeleteIcon, ArrowRightIcon, CompressIcon } from './components/Icon';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const STORAGE_KEY = 'img_compress_settings';
const DEFAULT_SETTINGS: CompressionSettings = {
  quality: 0.95,
  format: 'image/webp',
  maxWidth: 1920
};

const loadSettings = (): CompressionSettings => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to load settings from localStorage:', e);
  }
  return DEFAULT_SETTINGS;
};

const saveSettings = (settings: CompressionSettings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage:', e);
  }
};

function AppContent() {
  const { t } = useLanguage();
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [previewImage, setPreviewImage] = useState<ProcessedImage | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>(loadSettings);
  const [isProcessingGlobal, setIsProcessingGlobal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageCount, setImageCount] = useState(0);

  const handleSettingsChange = (newSettings: CompressionSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Debounced processing trigger when settings change
  useEffect(() => {
    if (images.length === 0) return;

    const timer = setTimeout(() => {
      processAllImages(images, settings);
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const processAllImages = async (currentImages: ProcessedImage[], currentSettings: CompressionSettings) => {
    setIsProcessingGlobal(true);
    setImages(prev => prev.map(img => ({ ...img, status: 'processing' })));

    const processed = await Promise.all(currentImages.map(async (img) => {
      try {
        const compressedBlob = await compressImage(img.originalFile, currentSettings);
        const originalSize = img.originalFile.size;
        const compressedSize = compressedBlob.size;
        const ratio = Math.round(((originalSize - compressedSize) / originalSize) * 100);

        if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
        const newUrl = URL.createObjectURL(compressedBlob);

        return {
          ...img,
          compressedBlob,
          compressedUrl: newUrl,
          status: 'done' as const,
          compressionRatio: ratio > 0 ? ratio : 0
        };
      } catch (error) {
        return { ...img, status: 'error' as const };
      }
    }));

    setImages(processed);
    setIsProcessingGlobal(false);
  };

  const handleFilesSelected = (files: File[]) => {
    const newImages: ProcessedImage[] = files.map(file => ({
      id: generateId(),
      originalFile: file,
      originalPreviewUrl: URL.createObjectURL(file),
      compressedBlob: null,
      compressedUrl: null,
      status: 'pending',
      compressionRatio: 0
    }));

    setImages(prev => {
        const updated = [...prev, ...newImages];
        processPendingImages(updated, settings);
        return updated;
    });
    setImageCount(prev => prev + newImages.length);
  };

  const processPendingImages = async (allImages: ProcessedImage[], currentSettings: CompressionSettings) => {
     setIsProcessingGlobal(true);
     const updatedImages = [...allImages];

     for (let i = 0; i < updatedImages.length; i++) {
         if (updatedImages[i].status === 'pending') {
             updatedImages[i].status = 'processing';
             setImages([...updatedImages]); 
             
             try {
                const compressedBlob = await compressImage(updatedImages[i].originalFile, currentSettings);
                const originalSize = updatedImages[i].originalFile.size;
                const compressedSize = compressedBlob.size;
                const ratio = Math.round(((originalSize - compressedSize) / originalSize) * 100);
                
                updatedImages[i].compressedBlob = compressedBlob;
                updatedImages[i].compressedUrl = URL.createObjectURL(compressedBlob);
                updatedImages[i].status = 'done';
                updatedImages[i].compressionRatio = ratio > 0 ? ratio : 0;
             } catch (e) {
                 updatedImages[i].status = 'error';
             }
             setImages([...updatedImages]);
         }
     }
     setIsProcessingGlobal(false);
  };

  const handleRemoveImage = (id: string) => {
    setImages(prev => {
        const target = prev.find(img => img.id === id);
        if (target) {
            URL.revokeObjectURL(target.originalPreviewUrl);
            if (target.compressedUrl) URL.revokeObjectURL(target.compressedUrl);
        }
        const updated = prev.filter(img => img.id !== id);
        setImageCount(updated.length);
        return updated;
    });
  };

  // 确认删除时真正清空
  const confirmClearAll = () => {
      images.forEach(img => {
          URL.revokeObjectURL(img.originalPreviewUrl);
          if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl);
      });
      setImages([]);
      setImageCount(0);
      setShowDeleteConfirm(false);
      setIsProcessingGlobal(false);
  };

  // 点击删除按钮 - 第一次点击显示确认，第二次确认删除
  const handleClearAll = () => {
      if (showDeleteConfirm) {
          confirmClearAll();
      } else {
          setShowDeleteConfirm(true);
      }
  };

  // 取消删除确认
  const cancelDelete = () => {
      setShowDeleteConfirm(false);
  };

  // 键盘事件 - 支持回车确认删除，ESC 取消
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!showDeleteConfirm) return;

          if (e.key === 'Enter') {
              confirmClearAll();
          } else if (e.key === 'Escape') {
              cancelDelete();
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteConfirm, images]);

  const handleDownloadAll = async () => {
      const completedImages = images.filter(img => img.status === 'done' && img.compressedBlob);

      if (completedImages.length === 0) return;

      if (completedImages.length === 1) {
          const img = completedImages[0];
          const link = document.createElement('a');
          link.href = img.compressedUrl!;
          const extension = img.compressedBlob?.type.split('/')[1] || 'jpg';
          const originalName = img.originalFile.name.substring(0, img.originalFile.name.lastIndexOf('.'));
          link.download = `${originalName}_compressed.${extension}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          return;
      }

      const zip = new JSZip();
      completedImages.forEach(img => {
          const extension = img.compressedBlob?.type.split('/')[1] || 'jpg';
          const originalName = img.originalFile.name.substring(0, img.originalFile.name.lastIndexOf('.'));
          const fileName = `${originalName}_compressed.${extension}`;
          zip.file(fileName, img.compressedBlob!);
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'compressed_images.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-20 noise-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4 animate-fade-in px-4">
                <h2 className="text-4xl md:text-5xl font-display font-bold gradient-text">{t('heroTitle')}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 text-lg leading-relaxed">{t('heroSubtitle')}</p>
            </div>

            <Dropzone onFilesSelected={handleFilesSelected} />
        </section>

        {images.length > 0 && (
          <div className="animate-slide-up space-y-6">
            {/* Settings and Stats combined */}
            <div className="max-w-4xl mx-auto">
                <SettingsPanel
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                    disabled={isProcessingGlobal}
                    stats={(() => {
                        const completedImages = images.filter(img => img.status === 'done' && img.compressedBlob);

                        if (completedImages.length === 0) return null;

                        let totalOriginal = 0;
                        let totalCompressed = 0;

                        for (const img of completedImages) {
                            const originalSize = Number(img.originalFile?.size);
                            const compressedSize = img.compressedBlob?.size;

                            if (!isNaN(originalSize) && originalSize > 0) {
                                totalOriginal += originalSize;
                            }
                            // Use compressedBlob.size if valid, otherwise calculate from compressionRatio
                            if (!isNaN(compressedSize) && compressedSize > 0) {
                                totalCompressed += compressedSize;
                            } else if (img.compressionRatio > 0 && originalSize > 0) {
                                // Fallback: calculate compressed size from compressionRatio
                                totalCompressed += Math.round(originalSize * (1 - img.compressionRatio / 100));
                            }
                        }

                        if (totalOriginal === 0) return null;

                        const savedBytes = totalOriginal - totalCompressed;
                        const savedPercent = Math.round((savedBytes / totalOriginal) * 100);

                        return {
                            totalOriginal,
                            totalCompressed,
                            savedBytes: Math.max(0, savedBytes),
                            savedPercent: isNaN(savedPercent) ? 0 : Math.max(0, savedPercent)
                        };
                    })()}
                />
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-300 dark:border-zinc-800">
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        {t('queueTitle')} <span className="text-zinc-500">({imageCount})</span>
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
                    {images.map((image, index) => (
                        <div key={image.id} className="animate-scale-in" style={{ animationDelay: `${index * 50}ms` }}>
                            <ImageCard
                                image={image}
                                onRemove={handleRemoveImage}
                                onPreview={setPreviewImage}
                            />
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
      </main>

      {previewImage && (
        <PreviewModal
          originalUrl={previewImage.originalPreviewUrl}
          compressedUrl={previewImage.compressedUrl}
          title={previewImage.originalFile.name}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* Floating Action Buttons */}
      {images.length > 0 && !showDeleteConfirm && (
        <div className="fixed right-6 bottom-6 z-40 flex flex-col gap-3">
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center gap-2 px-5 py-3 text-sm text-zinc-500 dark:text-zinc-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-zinc-300 dark:border-zinc-700 hover:border-red-500/50 glass-elevated shadow-lg"
            title={t('clearAll')}
          >
            <DeleteIcon className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownloadAll}
            disabled={isProcessingGlobal}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            title={t('downloadAll')}
          >
            {isProcessingGlobal ? (
              <LoadingIcon className="w-5 h-5 animate-spin" />
            ) : (
              <DownloadIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={cancelDelete}
        >
          <div
            className="glass-elevated rounded-2xl p-8 max-w-sm w-full mx-4 border border-red-500/30 shadow-2xl shadow-red-500/20 animate-in scale-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-5">
              <div className="w-16 h-16 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <DeleteIcon className="w-8 h-8 text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold text-zinc-900 dark:text-white">确认清空全部？</h3>
                <p className="text-zinc-400 text-sm">此操作将删除所有图片且无法撤销</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-5 py-3 text-sm text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-all duration-300 border border-zinc-700"
                >
                  取消
                </button>
                <button
                  onClick={confirmClearAll}
                  className="flex-1 px-5 py-3 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25"
                >
                  确认删除
                </button>
              </div>
              <p className="text-xs text-zinc-500">按 Enter 确认 / ESC 取消</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { ThemeProvider } from './contexts/ThemeContext';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
