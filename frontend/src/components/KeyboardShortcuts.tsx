import React, { useEffect, useState } from 'react';
import { CommandLineIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface KeyboardShortcutsProps {
  onRunAnalysis?: () => void;
  onToggleView?: () => void;
  onSearch?: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  onRunAnalysis,
  onToggleView,
  onSearch
}) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || 
          (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
      }

      // Ctrl/Cmd + R for run analysis
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        onRunAnalysis?.();
      }

      // Ctrl/Cmd + V for toggle view
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        onToggleView?.();
      }

      // ? for help
      if (e.key === '?' && !e.shiftKey) {
        setShowHelp(prev => !prev);
      }

      // Escape to close help
      if (e.key === 'Escape') {
        setShowHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onRunAnalysis, onToggleView, onSearch]);

  return (
    <>
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-6 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-30"
        title="Keyboard Shortcuts (Press ?)"
      >
        <CommandLineIcon className="w-6 h-6" />
      </button>

      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">General</h3>
                <div className="space-y-2">
                  <ShortcutItem
                    keys={['?']}
                    description="Show/hide keyboard shortcuts"
                  />
                  <ShortcutItem
                    keys={['Esc']}
                    description="Close modals and dialogs"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions</h3>
                <div className="space-y-2">
                  <ShortcutItem
                    keys={['Ctrl', 'R']}
                    description="Run new analysis"
                  />
                  <ShortcutItem
                    keys={['Ctrl', 'K']}
                    description="Focus search"
                  />
                  <ShortcutItem
                    keys={['Ctrl', 'V']}
                    description="Toggle view mode (Grid/Table)"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Navigation</h3>
                <div className="space-y-2">
                  <ShortcutItem
                    keys={['↑', '↓']}
                    description="Navigate through documents"
                  />
                  <ShortcutItem
                    keys={['Enter']}
                    description="Open selected document"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Tip:</span> On Mac, use <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘</kbd> instead of <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl</kbd>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const ShortcutItem: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400 mx-1">+</span>}
            <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
              {key}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default KeyboardShortcuts;

