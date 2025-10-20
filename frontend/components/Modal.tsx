'use client';

import { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-[60] w-11 h-11 flex items-center justify-center bg-white/90 hover:bg-blue-600 hover:text-white border-2 border-blue-600 text-blue-600 rounded-full text-2xl shadow-md backdrop-blur-sm transition-colors md:top-20 md:right-24"
        aria-label="Close modal"
      >
        &times;
      </button>

      <div className="fixed inset-0 md:relative md:inset-auto bg-white rounded-none md:rounded-lg w-full h-full md:w-[90%] md:max-w-[500px] md:max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="p-5 pt-10 pb-10 md:pt-5 md:pb-5">
          {children}
        </div>
      </div>
    </div>
  );
}