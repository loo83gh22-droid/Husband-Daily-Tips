'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-emerald-500/90 border-emerald-400 text-white';
      case 'error':
        return 'bg-rose-500/90 border-rose-400 text-white';
      case 'warning':
        return 'bg-amber-500/90 border-amber-400 text-white';
      case 'info':
      default:
        return 'bg-primary-500/90 border-primary-400 text-slate-950';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${getStyles()} border-2 rounded-lg px-4 py-3 shadow-lg flex items-center gap-3 min-w-[300px] max-w-[500px]`}
    >
      <span className="text-xl font-bold flex-shrink-0">{getIcon()}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Close"
      >
        ✕
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-[10000] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for managing toasts
let toastIdCounter = 0;
const toastListeners: Array<(toasts: Toast[]) => void> = [];
let currentToasts: Toast[] = [];

export function useToast() {
  const addToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type, duration };
    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach((listener) => listener(currentToasts));
  };

  const removeToast = (id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    toastListeners.forEach((listener) => listener(currentToasts));
  };

  return { addToast, removeToast };
}

// Global toast functions for use anywhere
export const toast = {
  success: (message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type: 'success', duration };
    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach((listener) => listener(currentToasts));
  },
  error: (message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type: 'error', duration };
    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach((listener) => listener(currentToasts));
  },
  info: (message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type: 'info', duration };
    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach((listener) => listener(currentToasts));
  },
  warning: (message: string, duration?: number) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: Toast = { id, message, type: 'warning', duration };
    currentToasts = [...currentToasts, newToast];
    toastListeners.forEach((listener) => listener(currentToasts));
  },
};

// Provider component to manage toast state
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts);
    };
    toastListeners.push(listener);
    setToasts(currentToasts);

    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) {
        toastListeners.splice(index, 1);
      }
    };
  }, []);

  const removeToast = (id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    toastListeners.forEach((listener) => listener(currentToasts));
  };

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

