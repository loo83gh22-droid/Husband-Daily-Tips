'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface Guide {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  time: string;
  excerpt: string;
  content: string;
}

interface HowToGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  guideSlug: string | null;
}

export default function HowToGuideModal({ isOpen, onClose, guideSlug }: HowToGuideModalProps) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && guideSlug) {
      setIsLoading(true);
      setError(null);
      fetch(`/api/guides/${guideSlug}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error('Failed to load guide');
          }
          return res.json();
        })
        .then((data) => {
          setGuide(data.guide);
        })
        .catch((err) => {
          console.error('Error loading guide:', err);
          setError('Failed to load guide. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setGuide(null);
    }
  }, [isOpen, guideSlug]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) {
    return null;
  }

  const renderContent = (content: string) => {
    return content.split('\n\n').map((section: string, idx: number) => {
      if (section.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-2xl font-bold text-slate-50 mt-8 mb-4 first:mt-0">
            {section.replace('## ', '')}
          </h2>
        );
      }
      if (section.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-xl font-bold text-slate-50 mt-6 mb-3">
            {section.replace('### ', '')}
          </h3>
        );
      }
      if (section.startsWith('- ')) {
        const items = section.split('\n').filter((l) => l.startsWith('- '));
        return (
          <ul key={idx} className="list-disc list-inside mb-4 space-y-2 ml-4">
            {items.map((item, i) => (
              <li key={i} className="text-slate-200">
                {item.replace('- ', '')}
              </li>
            ))}
          </ul>
        );
      }
      // Regular paragraph
      const lines = section.split('\n');
      return (
        <div key={idx} className="mb-6">
          {lines.map((line, i) => {
            if (line.trim() === '') return null;
            if (line.startsWith('**') && line.endsWith('**')) {
              return (
                <p key={i} className="font-bold text-slate-100 mt-4 mb-2">
                  {line.replace(/\*\*/g, '')}
                </p>
              );
            }
            return (
              <p key={i} className="text-slate-200 mb-3 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      );
    });
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800 flex-shrink-0">
              <div className="flex-1">
                {guide && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-block px-3 py-1 bg-primary-500/10 text-primary-300 text-xs font-semibold rounded-full">
                        {guide.category}
                      </span>
                      <span className="text-xs text-slate-500">
                        {guide.difficulty} • {guide.time}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-50">{guide.title}</h2>
                    {guide.excerpt && (
                      <p className="text-sm md:text-base text-slate-300 mt-2 leading-relaxed">{guide.excerpt}</p>
                    )}
                  </>
                )}
                {isLoading && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                    <span className="text-slate-300">Loading guide...</span>
                  </div>
                )}
                {error && (
                  <div className="text-red-400">{error}</div>
                )}
              </div>
              <button
                onClick={onClose}
                className="ml-4 text-slate-400 hover:text-slate-200 transition-colors p-2 hover:bg-slate-800 rounded-lg"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {guide && (
                <div className="prose prose-invert prose-lg max-w-none">
                  {renderContent(guide.content)}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

