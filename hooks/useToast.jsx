// src/hooks/useToast.jsx
import { useState } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 3000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const Toast = () => {
    if (!toast) return null;

    const typeStyles = {
      success: 'bg-green-100 border-green-500 text-green-700',
      error: 'bg-red-100 border-red-500 text-red-700',
      warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      info: 'bg-blue-100 border-blue-500 text-blue-700'
    };

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`${typeStyles[toast.type]} border-l-4 p-4 rounded shadow-lg animate-toast-popup`}>
          <div className="flex items-center">
            <span className="mr-2">
              {toast.type === 'success' && '✅'}
              {toast.type === 'error' && '❌'}
              {toast.type === 'warning' && '⚠️'}
              {toast.type === 'info' && 'ℹ️'}
            </span>
            <p>{toast.message}</p>
          </div>
        </div>
      </div>
    );
  };

  return { Toast, showToast };
}
