import React, { useState, useRef, useEffect } from 'react';
import { ImageIconRef, GlobeIcon, SunIcon, MoonIcon } from './Icon';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { Language } from '../locales/translations';

const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'zh', label: '简体中文', flag: '🇨🇳' },
    { code: 'zh-hk', label: '繁體中文', flag: '🇭🇰' },
  ];

  return (
    <header className="glass sticky top-0 z-50 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg shadow-primary/20">
                <ImageIconRef className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-accent rounded-xl blur opacity-30"></div>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-zinc-900 dark:text-white">{t('appTitle')}</h1>
              <p className="text-xs text-primary-dark dark:text-primary-light font-medium hidden sm:block">{t('appSubtitle')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex items-center gap-4">
              <a
                href="https://github.com/wangruofeng/img-compress/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-primary-dark hover:text-primary-light transition-colors"
              >
                {t('documentation')}
              </a>
              <a
                href="https://github.com/wangruofeng/img-compress/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-primary-dark hover:text-primary-light transition-colors"
              >
                {t('github')}
              </a>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-primary-dark dark:hover:text-primary-light hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center gap-2 h-9 px-3 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-300 dark:border-zinc-700"
              >
                <GlobeIcon className="w-4 h-4 text-primary-dark dark:text-primary-light" />
                <span className="hidden sm:inline">
                  {languages.find(l => l.code === language)?.label}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 glass-elevated rounded-xl shadow-2xl py-1 overflow-hidden animate-scale-in border border-zinc-200 dark:border-zinc-700/50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 flex items-center gap-3 ${
                        language === lang.code
                          ? 'bg-primary/20 text-primary-dark dark:text-primary-light font-medium'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
