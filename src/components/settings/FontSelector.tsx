import { useState, useRef, useEffect } from 'react';
import { Type, Check } from 'lucide-react';
import { FONTS, loadFont, type FontOption } from '../../lib/fonts';
import { UI } from '../../lib/constants';
import { IconButton } from '../ui/IconButton';

interface FontSelectorProps {
  currentFontId: string | null;
  onSelect: (fontId: string) => void;
}

export function FontSelector({ currentFontId, onSelect }: FontSelectorProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentFont = FONTS.find((f) => f.id === currentFontId) || FONTS[0];

  useEffect(() => {
    if (!open) return;
    // Preload all fonts when menu opens
    FONTS.forEach(loadFont);
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <IconButton label={UI.font} size="sm" onClick={() => setOpen(!open)}>
        <Type size={16} />
      </IconButton>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50 max-h-80 overflow-y-auto animate-fade-in">
          {FONTS.map((font) => (
            <button
              key={font.id}
              onClick={() => {
                onSelect(font.id);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span
                className="text-sm text-gray-700 dark:text-gray-300 flex-1"
                style={{ fontFamily: font.family }}
              >
                {font.name}
              </span>
              <span className="text-xs text-gray-400">{font.category}</span>
              {font.id === (currentFontId || FONTS[0].id) && (
                <Check size={14} className="text-plume-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
