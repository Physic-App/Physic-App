import { Component, Connection, CircuitData, Position } from '../types/circuit';

export const drawComponent = (
  ctx: CanvasRenderingContext2D,
  component: Component,
  isSimulating: boolean,
  circuitData: CircuitData
) => {
  const { x, y } = component.position;
  
  ctx.save();
  ctx.translate(x, y);
  
  switch (component.type) {
    case 'battery':
      drawBattery(ctx, component);
      break;
    case 'bulb':
      drawBulb(ctx, component, isSimulating);
      break;
    case 'resistor':
      drawResistor(ctx, component);
      break;
    case 'capacitor':
      drawCapacitor(ctx, component);
      break;
    case 'ammeter':
      drawAmmeter(ctx, component, isSimulating);
      break;
    case 'voltmeter':
      drawVoltmeter(ctx, component, isSimulating);
      break;
    case 'switch':
      drawSwitch(ctx, component);
      break;
    case 'fuse':
      drawFuse(ctx, component);
      break;
  }
  
  // Draw terminals
  drawTerminals(ctx, component);
  
  // Draw labels
  drawComponentLabel(ctx, component);
  
  ctx.restore();
};

const drawBattery = (ctx: CanvasRenderingContext2D, component: Component) => {
  // Battery symbol: long and short parallel lines
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 3;
  
  // Negative terminal (short line)
  ctx.beginPath();
  ctx.moveTo(-20, -10);
  ctx.lineTo(-20, 10);
  ctx.stroke();
  
  // Positive terminal (long line)
  ctx.beginPath();
  ctx.moveTo(20, -15);
  ctx.lineTo(20, 15);
  ctx.stroke();
  
  // Connection lines
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.lineTo(-20, 0);
  ctx.moveTo(20, 0);
  ctx.lineTo(30, 0);
  ctx.stroke();
  
  // Labels
  ctx.fillStyle = '#EF4444';
  ctx.font = 'bold 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('+', 25, -20);
  ctx.fillStyle = '#1F2937';
  ctx.fillText('−', -25, -20);
};

const drawBulb = (ctx: CanvasRenderingContext2D, component: Component, isSimulating: boolean) => {
  const brightness = component.properties.brightness || 0;
  const current = Math.abs(component.properties.current || 0);
  
  // Bulb circle
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Fill based on brightness and current
  if (isSimulating && brightness > 0 && current > 0.001) {
    // Enhanced glow effect with multiple layers
    const alpha = Math.max(0.4, brightness);
    
    // Outer glow
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 20 * brightness;
    ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, 2 * Math.PI);
    ctx.fill();
    
    // Inner glow
    ctx.shadowColor = '#FFF176';
    ctx.shadowBlur = 15 * brightness;
    ctx.fillStyle = `rgba(255, 235, 59, ${alpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, 2 * Math.PI);
    ctx.fill();
    
    // Core brightness
    ctx.shadowBlur = 0;
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, 2 * Math.PI);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = '#F3F4F6';
    ctx.fill();
  }
  
  // Filament - more visible when lit
  if (isSimulating && brightness > 0 && current > 0.001) {
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
  } else {
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 1;
  }
  
  ctx.beginPath();
  ctx.moveTo(-8, -8);
  ctx.lineTo(8, 8);
  ctx.moveTo(-8, 8);
  ctx.lineTo(8, -8);
  ctx.stroke();
  
  // Connection lines
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-15, 0);
  ctx.moveTo(15, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();
  
  // Power indicator
  if (isSimulating && brightness > 0) {
    const power = component.properties.power || 0;
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 8px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${power.toFixed(1)}W`, 0, 25);
  }
};

const drawResistor = (ctx: CanvasRenderingContext2D, component: Component) => {
  // Resistor zigzag pattern
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-15, 0);
  
  // Zigzag
  const zigzagPoints = [-15, -10, -5, 0, 5, 10, 15];
  const zigzagHeight = 8;
  
  for (let i = 0; i < zigzagPoints.length; i++) {
    const y = (i % 2 === 0) ? -zigzagHeight : zigzagHeight;
    ctx.lineTo(zigzagPoints[i], y);
  }
  
  ctx.lineTo(25, 0);
  ctx.stroke();
  
  // Resistance value
  const resistance = component.properties.resistance || 0;
  ctx.fillStyle = '#374151';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${resistance}Ω`, 0, 20);
};

const drawSwitch = (ctx: CanvasRenderingContext2D, component: Component) => {
  const isOn = component.properties.isOn || false;
  
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  
  // Connection points
  ctx.beginPath();
  ctx.arc(-15, 0, 3, 0, 2 * Math.PI);
  ctx.arc(15, 0, 3, 0, 2 * Math.PI);
  ctx.fill();
  
  // Switch lever
  ctx.beginPath();
  ctx.moveTo(-15, 0);
  if (isOn) {
    ctx.lineTo(15, 0); // Closed switch
  } else {
    ctx.lineTo(10, -8); // Open switch
  }
  ctx.stroke();
  
  // Connection lines
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-15, 0);
  ctx.moveTo(15, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();
  
  // Status indicator
  ctx.fillStyle = isOn ? '#10B981' : '#EF4444';
  ctx.beginPath();
  ctx.arc(0, -15, 3, 0, 2 * Math.PI);
  ctx.fill();
};

const drawFuse = (ctx: CanvasRenderingContext2D, component: Component) => {
  const isBlown = component.properties.isBlown || false;
  
  // Fuse rectangle
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.strokeRect(-12, -6, 24, 12);
  
  // Fill color based on state
  ctx.fillStyle = isBlown ? '#FEE2E2' : '#F3F4F6';
  ctx.fillRect(-12, -6, 24, 12);
  
  // Fuse wire
  if (!isBlown) {
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
  } else {
    // Broken wire
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-2, 0);
    ctx.moveTo(2, 0);
    ctx.lineTo(10, 0);
    ctx.stroke();
  }
  
  // Connection lines
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-12, 0);
  ctx.moveTo(12, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();
  
  // Current rating
  const maxCurrent = component.properties.maxCurrent || 5;
  ctx.fillStyle = '#374151';
  ctx.font = '8px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${maxCurrent}A`, 0, 18);
};

const drawCapacitor = (ctx: CanvasRenderingContext2D, component: Component) => {
  // Capacitor symbol: two parallel plates
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 3;
  
  // Left plate
  ctx.beginPath();
  ctx.moveTo(-5, -15);
  ctx.lineTo(-5, 15);
  ctx.stroke();
  
  // Right plate
  ctx.beginPath();
  ctx.moveTo(5, -15);
  ctx.lineTo(5, 15);
  ctx.stroke();
  
  // Connection lines
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-5, 0);
  ctx.moveTo(5, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();
  
  // Capacitance value
  const capacitance = component.properties.capacitance || 0;
  ctx.fillStyle = '#374151';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${capacitance}µF`, 0, 25);
};

const drawAmmeter = (ctx: CanvasRenderingContext2D, component: Component, isSimulating: boolean) => {
  // Ammeter circle
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#F3F4F6';
  ctx.fill();
  
  // 'A' symbol
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('A', 0, 4);
  
  // Connection lines
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-15, 0);
  ctx.moveTo(15, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();
  
  // Reading display
  if (isSimulating) {
    const reading = component.properties.reading || 0;
    ctx.fillStyle = '#DC2626';
    ctx.font = '8px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${reading.toFixed(3)}A`, 0, -22);
  }
};

const drawVoltmeter = (ctx: CanvasRenderingContext2D, component: Component, isSimulating: boolean) => {
  // Voltmeter circle
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.fillStyle = '#F3F4F6';
  ctx.fill();
  
  // 'V' symbol
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('V', 0, 4);
  
  // Connection lines
  ctx.strokeStyle = '#1F2937';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-15, 0);
  ctx.moveTo(15, 0);
  ctx.lineTo(25, 0);
  ctx.stroke();
  
  // Reading display
  if (isSimulating) {
    const reading = component.properties.reading || 0;
    ctx.fillStyle = '#DC2626';
    ctx.font = '8px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${reading.toFixed(2)}V`, 0, -22);
  }
};

const drawTerminals = (ctx: CanvasRenderingContext2D, component: Component) => {
  ctx.fillStyle = '#3B82F6';
  
  component.terminals.forEach(terminal => {
    ctx.beginPath();
    ctx.arc(terminal.x, terminal.y, 2, 0, 2 * Math.PI);
    ctx.fill();
  });
};

const drawComponentLabel = (ctx: CanvasRenderingContext2D, component: Component) => {
  ctx.fillStyle = '#6B7280';
  ctx.font = '10px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  
  const labelMap: Record<string, string> = {
    ammeter: 'Ammeter',
    voltmeter: 'Voltmeter'
  };
  const label = labelMap[component.type] || component.type.charAt(0).toUpperCase() + component.type.slice(1);
  ctx.fillText(label, 0, -25);
};

export const drawConnection = (
  ctx: CanvasRenderingContext2D,
  fromComponent: Component,
  toComponent: Component,
  connection: Connection,
  isActive: boolean
) => {
  const fromPos = fromComponent.terminals[connection.fromTerminal] || fromComponent.position;
  const toPos = toComponent.terminals[connection.toTerminal] || toComponent.position;
  
  ctx.strokeStyle = isActive ? '#DC2626' : '#374151';
  ctx.lineWidth = isActive ? 3 : 2;
  
  ctx.beginPath();
  ctx.moveTo(fromPos.x, fromPos.y);
  ctx.lineTo(toPos.x, toPos.y);
  ctx.stroke();
};

export const drawCurrentFlow = (
  ctx: CanvasRenderingContext2D,
  fromComponent: Component,
  toComponent: Component,
  animationFrame: number,
  current: number
) => {
  const fromPos = fromComponent.terminals[0] || fromComponent.position;
  const toPos = toComponent.terminals[0] || toComponent.position;
  
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) return;
  
  const unitX = dx / length;
  const unitY = dy / length;
  
  // Draw animated arrows along the wire
  const arrowSpacing = 40;
  const speed = 2;
  const offset = (animationFrame * speed) % arrowSpacing;
  
  ctx.fillStyle = '#DC2626';
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 2;
  
  for (let distance = offset; distance < length; distance += arrowSpacing) {
    const x = fromPos.x + unitX * distance;
    const y = fromPos.y + unitY * distance;
    
    // Draw arrow
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.atan2(dy, dx));
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-8, -4);
    ctx.lineTo(-8, 4);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }
};
