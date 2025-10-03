import { useRef, useCallback } from 'react';

interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  gridColor?: string;
  gridSize?: number;
}

export const useCanvas = (config: CanvasConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    return { canvas, ctx };
  }, []);

  const clearCanvas = useCallback(() => {
    const context = getContext();
    if (!context) return;
    
    const { canvas, ctx } = context;
    ctx.fillStyle = config.backgroundColor || '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, [getContext, config.backgroundColor]);

  const drawGrid = useCallback(() => {
    const context = getContext();
    if (!context) return;
    
    const { canvas, ctx } = context;
    const gridSize = config.gridSize || 40;
    const gridColor = config.gridColor || '#1e293b';
    
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }, [getContext, config.gridSize, config.gridColor]);

  const drawAxes = useCallback(() => {
    const context = getContext();
    if (!context) return;
    
    const { canvas, ctx } = context;
    
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    
    // Horizontal axis
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // Vertical axis
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
  }, [getContext]);

  const drawCircle = useCallback((
    x: number, 
    y: number, 
    radius: number, 
    color: string, 
    strokeColor?: string,
    strokeWidth?: number
  ) => {
    const context = getContext();
    if (!context) return;
    
    const { ctx } = context;
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 3, y + 3, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Main circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Stroke
    if (strokeColor) {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth || 2;
      ctx.stroke();
    }
  }, [getContext]);

  const drawArrow = useCallback((
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: string,
    lineWidth: number = 3
  ) => {
    const context = getContext();
    if (!context) return;
    
    const { ctx } = context;
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrowhead
    const angle = Math.atan2(endY - startY, endX - startX);
    const arrowLength = 12;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle - Math.PI / 6),
      endY - arrowLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      endX - arrowLength * Math.cos(angle + Math.PI / 6),
      endY - arrowLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  }, [getContext]);

  const drawText = useCallback((
    text: string,
    x: number,
    y: number,
    color: string = '#ffffff',
    fontSize: string = '12px',
    fontFamily: string = 'sans-serif',
    textAlign: CanvasTextAlign = 'center'
  ) => {
    const context = getContext();
    if (!context) return;
    
    const { ctx } = context;
    
    ctx.fillStyle = color;
    ctx.font = `${fontSize} ${fontFamily}`;
    ctx.textAlign = textAlign;
    ctx.fillText(text, x, y);
  }, [getContext]);

  return {
    canvasRef,
    getContext,
    clearCanvas,
    drawGrid,
    drawAxes,
    drawCircle,
    drawArrow,
    drawText
  };
};
