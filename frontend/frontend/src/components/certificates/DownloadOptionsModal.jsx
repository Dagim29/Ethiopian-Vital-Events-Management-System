import React, { useState } from 'react';
import { 
  XMarkIcon, 
  PrinterIcon, 
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { DOWNLOAD_METHODS, getRecommendedMethod } from '../../utils/certificateDownload';

/**
 * Modal for selecting certificate download method
 */
const DownloadOptionsModal = ({ isOpen, onClose, onSelectMethod, certificateType }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const recommended = getRecommendedMethod();

  if (!isOpen) return null;

  const methods = [
    {
      id: DOWNLOAD_METHODS.PRINT_TO_PDF,
      name: 'Browser Print to PDF',
      icon: PrinterIcon,
      description: 'Use your browser\'s print dialog to save as PDF',
      pros: [
        'Perfect quality - exact copy of what you see',
        'Vector-based output (scalable)',
        'All colors and fonts preserved',
        'No external libraries needed',
        'Works on all browsers'
      ],
      cons: [
        'Requires one extra step (selecting "Save as PDF")',
        'User must enable "Background graphics"'
      ],
      recommended: recommended.method === DOWNLOAD_METHODS.PRINT_TO_PDF,
      difficulty: 'Easy',
      quality: 'Excellent',
    },
    {
      id: DOWNLOAD_METHODS.HTML2CANVAS,
      name: 'Direct PDF Download',
      icon: ArrowDownTrayIcon,
      description: 'Automatically generate and download PDF file',
      pros: [
        'One-click download',
        'No user interaction needed',
        'High quality output (3x resolution)',
        'Automatic filename generation'
      ],
      cons: [
        'Slightly larger file size',
        'May have minor rendering differences',
        'Requires JavaScript libraries'
      ],
      recommended: recommended.method === DOWNLOAD_METHODS.HTML2CANVAS,
      difficulty: 'Very Easy',
      quality: 'Very Good',
    },
  ];

  const handleSelect = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handleConfirm = () => {
    if (selectedMethod) {
      onSelectMethod(selectedMethod);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Download Certificate</h2>
              <p className="text-sm text-gray-600 mt-1">Choose your preferred download method</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Recommended Method Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900">Recommended for your browser</p>
                <p className="text-sm text-blue-700 mt-1">{recommended.reason}</p>
              </div>
            </div>

            {/* Method Options */}
            <div className="space-y-4">
              {methods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                
                return (
                  <div
                    key={method.id}
                    onClick={() => handleSelect(method.id)}
                    className={`
                      relative border-2 rounded-lg p-5 cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-green-500 bg-green-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }
                    `}
                  >
                    {/* Recommended Badge */}
                    {method.recommended && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                          <CheckCircleIcon className="h-3 w-3" />
                          Recommended
                        </span>
                      </div>
                    )}

                    {/* Method Header */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`
                        p-3 rounded-lg
                        ${isSelected ? 'bg-green-100' : 'bg-gray-100'}
                      `}>
                        <Icon className={`h-6 w-6 ${isSelected ? 'text-green-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        
                        {/* Quality Indicators */}
                        <div className="flex gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            <span className="font-semibold">Difficulty:</span> {method.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            <span className="font-semibold">Quality:</span> {method.quality}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pros and Cons */}
                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                      {/* Pros */}
                      <div>
                        <p className="text-xs font-semibold text-green-700 mb-2">✓ Advantages</p>
                        <ul className="space-y-1">
                          {method.pros.map((pro, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-green-500 mt-0.5">•</span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Cons */}
                      <div>
                        <p className="text-xs font-semibold text-orange-700 mb-2">⚠ Considerations</p>
                        <ul className="space-y-1">
                          {method.cons.map((con, idx) => (
                            <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                              <span className="text-orange-500 mt-0.5">•</span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-3 left-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircleIcon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Instructions for Print Method */}
            {selectedMethod === DOWNLOAD_METHODS.PRINT_TO_PDF && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-900 mb-2">📋 Quick Instructions:</p>
                <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                  <li>Print dialog will open</li>
                  <li>Select <strong>"Save as PDF"</strong> as destination</li>
                  <li>Enable <strong>"Background graphics"</strong></li>
                  <li>Set margins to <strong>"None"</strong> or <strong>"Minimum"</strong></li>
                  <li>Click <strong>"Save"</strong></li>
                </ol>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedMethod}
              className={`
                px-6 py-2 rounded-lg font-medium transition-all
                ${selectedMethod
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {selectedMethod === DOWNLOAD_METHODS.PRINT_TO_PDF ? 'Open Print Dialog' : 'Download PDF'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadOptionsModal;
