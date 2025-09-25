import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({
  content,
  title,
  position = 'top',
  children,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = 0;
    let y = 0;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.top - tooltipRect.height - 8;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        y = triggerRect.bottom + 8;
        break;
      case 'left':
        x = triggerRect.left - tooltipRect.width - 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        x = triggerRect.right + 8;
        y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Keep tooltip within viewport
    x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
    y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));

    setTooltipPosition({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition);
      };
    }
  }, [isVisible, position]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`inline-block ${className}`}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-slate-800/95 backdrop-blur-sm border border-slate-600 rounded-lg p-3 shadow-2xl max-w-xs animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              {title && (
                <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
              )}
              <p className="text-xs text-slate-300 leading-relaxed">{content}</p>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          {/* Arrow */}
          <div
            className={`absolute w-2 h-2 bg-slate-800 border-slate-600 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-r border-b' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-l border-t' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-t border-r' :
              'left-[-4px] top-1/2 -translate-y-1/2 border-b border-l'
            }`}
          />
        </div>
      )}
    </>
  );
};
