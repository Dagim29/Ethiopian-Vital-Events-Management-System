import React, { useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={closeOnOverlayClick ? onClose : () => {}}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      
      {/* Full-screen container to center the panel */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`w-full ${maxWidth} transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all max-h-[90vh] overflow-y-auto`}>
          {showCloseButton && (
            <div className="absolute top-4 right-4 z-10">
              <button
                type="button"
                className="rounded-lg bg-gray-100 p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
          
          <div className="p-6">
            {title && (
              <Dialog.Title className="text-2xl font-bold text-gray-900 mb-6 pr-10">
                {title}
              </Dialog.Title>
            )}
            <div>
              {children}
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default Modal;
