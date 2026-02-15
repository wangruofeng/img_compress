import React from 'react';
import { CompressionSettings } from '../types';
import { SettingsIcon, ArrowRightIcon, CompressIcon } from './Icon';
import { useLanguage } from '../contexts/LanguageContext';
import { formatFileSize } from '../utils/helpers';

interface StatsData {
  totalOriginal: number;
  totalCompressed: number;
  savedBytes: number;
  savedPercent: number;
}

interface SettingsPanelProps {
  settings: CompressionSettings;
  onSettingsChange: (newSettings: CompressionSettings) => void;
  disabled: boolean;
  stats?: StatsData | null;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, disabled, stats }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = React.useState(false);

  const handleQualityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...settings,
      quality: parseFloat(e.target.value)
    });
  };

  const handleMouseDown = () => {
    if (!disabled) setIsDragging(true);
  };

  React.useEffect(() => {
    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchend', handleEnd);
      return () => {
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging, disabled]);

  const getQualityLabel = (q: number) => {
    if (q >= 0.8) return t('qualityHigh');
    if (q >= 0.5) return t('qualityMed');
    return t('qualityLow');
  };

  return (
    <div className="glass-elevated rounded-2xl border border-zinc-200 dark:border-zinc-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-700/50 bg-zinc-100 dark:bg-zinc-800/30">
        <div className="p-1.5 bg-primary/20 rounded-lg">
          <SettingsIcon className="w-4 h-4 text-primary-light" />
        </div>
        <h2 className="font-display font-semibold text-zinc-800 dark:text-white">{t('settingsTitle')}</h2>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quality Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('qualityLabel')}</label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                ${settings.quality >= 0.8 ? 'bg-emerald-500/20 text-emerald-600' :
                  settings.quality >= 0.5 ? 'bg-amber-500/20 text-amber-600' :
                  'bg-red-500/20 text-red-600'}`}>
                {Math.round(settings.quality * 100)}%
              </span>
            </div>

            <div className="relative group">
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${((settings.quality - 0.1) / (1.0 - 0.1)) * 100}%`,
                    background: settings.quality >= 0.8
                      ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
                      : settings.quality >= 0.5
                      ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
                      : 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)'
                  }}
                />
              </div>

              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.quality}
                onChange={handleQualityChange}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                disabled={disabled}
                className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
                style={{
                  background: 'transparent',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />

              <div
                className="absolute top-1/2 transform -translate-y-1/2 bg-white dark:bg-white rounded-full shadow pointer-events-none transition-all duration-200"
                style={{
                  left: `calc(${((settings.quality - 0.1) / (1.0 - 0.1)) * 100}% - 6px)`,
                  width: '12px',
                  height: '12px',
                  border: `2px solid ${settings.quality >= 0.8 ? '#10b981' : settings.quality >= 0.5 ? '#f59e0b' : '#ef4444'}`
                }}
              />
            </div>

            <div className="flex justify-between text-xs text-zinc-500">
              <span>{t('lowSize')}</span>
              <span>{t('bestQuality')}</span>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">{t('outputFormat')}</label>
            <div className="grid grid-cols-3 gap-2">
               <button
                  onClick={() => onSettingsChange({...settings, format: 'image/jpeg'})}
                  className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                    settings.format === 'image/jpeg'
                      ? 'border-primary bg-primary/20 text-primary-light font-medium'
                      : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
               >
                 JPG
               </button>
               <button
                  onClick={() => onSettingsChange({...settings, format: 'image/png'})}
                  className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                    settings.format === 'image/png'
                      ? 'border-primary bg-primary/20 text-primary-light font-medium'
                      : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
               >
                 PNG
               </button>
               <button
                  onClick={() => onSettingsChange({...settings, format: 'image/webp'})}
                  className={`py-2 px-3 text-sm rounded-lg border transition-all ${
                    settings.format === 'image/webp'
                      ? 'border-primary bg-primary/20 text-primary-light font-medium'
                      : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
               >
                 WebP
               </button>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 mt-3 border-t border-zinc-200 dark:border-zinc-700/50">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">{t('originalLabel')}:</span>
              <span className="text-zinc-800 dark:text-white font-medium">{formatFileSize(stats.totalOriginal)}</span>
              <ArrowRightIcon className="w-4 h-4 text-zinc-400" />
              <span className="text-zinc-500 dark:text-zinc-400">{t('compressedLabel')}:</span>
              <span className="text-primary-dark dark:text-primary-light font-medium">{formatFileSize(stats.totalCompressed)}</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2 px-3 py-2 sm:py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <CompressIcon className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">-{stats.savedPercent}%</span>
              </div>
              <span className="text-zinc-500 text-xs">节省 {formatFileSize(stats.savedBytes)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
