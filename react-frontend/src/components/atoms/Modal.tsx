import { ReactNode, useEffect } from 'react';
import ReactModal from 'react-modal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

// Set app element for screen readers
if (typeof document !== 'undefined') {
  ReactModal.setAppElement('#root');
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      const rootElement = document.getElementById('root');
      if (!rootElement) return;

      // Prevent scroll and interactions on main app - works on iOS too
      const scrollY = window.scrollY;
      rootElement.style.position = 'fixed';
      rootElement.style.top = `-${scrollY}px`;
      rootElement.style.width = '100%';
      rootElement.style.overflow = 'hidden';
      rootElement.style.pointerEvents = 'none';
      rootElement.style.userSelect = 'none';

      return () => {
        // Restore scroll and interactions
        rootElement.style.position = '';
        rootElement.style.top = '';
        rootElement.style.width = '';
        rootElement.style.overflow = '';
        rootElement.style.pointerEvents = '';
        rootElement.style.userSelect = '';

        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      className="fixed inset-0 md:relative md:inset-auto bg-white rounded-none md:rounded-lg w-full h-full md:w-[90%] md:max-w-[500px] md:max-h-[80vh] overflow-y-auto shadow-xl outline-none"
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      style={{
        overlay: {
          touchAction: 'none',
        },
        content: {
          paddingTop: 'max(3.5rem, env(safe-area-inset-top) + 3.5rem)',
          paddingBottom: 'max(2.5rem, env(safe-area-inset-bottom) + 2.5rem)',
          touchAction: 'auto',
          WebkitTapHighlightColor: 'transparent',
        }
      }}
    >
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-[60] w-11 h-11 flex items-center justify-center bg-white/90 hover:bg-blue-600 hover:text-white border-2 border-blue-600 text-blue-600 rounded-full text-2xl shadow-md backdrop-blur-sm transition-colors md:top-20 md:right-24 cursor-pointer"
        style={{
          top: 'max(1.25rem, env(safe-area-inset-top))',
          right: 'max(1.25rem, env(safe-area-inset-right))',
          touchAction: 'manipulation',
          WebkitTapHighlightColor: 'rgba(0, 0, 0, 0.1)',
        }}
        aria-label="Close modal"
      >
        &times;
      </button>

      <div
        className="p-5"
        style={{ touchAction: 'manipulation' }}
      >
        {children}
      </div>
    </ReactModal>
  );
}
