import { ReactNode, useEffect } from 'react';
import { FocusTrap } from "focus-trap-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll - works on iOS too
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll and position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
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
    <FocusTrap
      focusTrapOptions={{
        allowOutsideClick: true,
        escapeDeactivates: false,
      }}
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose}
      >
        <button
          onClick={onClose}
          className="fixed top-5 right-5 z-[60] w-11 h-11 flex items-center justify-center bg-white/90 hover:bg-blue-600 hover:text-white border-2 border-blue-600 text-blue-600 rounded-full text-2xl shadow-md backdrop-blur-sm transition-colors md:top-20 md:right-24"
          style={{ top: 'max(1.25rem, env(safe-area-inset-top))', right: 'max(1.25rem, env(safe-area-inset-right))' }}
          aria-label="Close modal"
        >
          &times;
        </button>

        <div
          className="fixed inset-0 md:relative md:inset-auto bg-white rounded-none md:rounded-lg w-full h-full md:w-[90%] md:max-w-[500px] md:max-h-[80vh] overflow-y-auto shadow-xl"
          style={{
            paddingTop: 'max(3.5rem, env(safe-area-inset-top) + 3.5rem)',
            paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom) + 2.5rem)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-5">
            {children}
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}
