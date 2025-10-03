import React from 'react';
import { ForceDiagram, CircuitDiagram, WaveDiagram } from './Diagrams';

interface DiagramData {
  type: 'force' | 'circuit' | 'wave';
  data: Record<string, unknown>;
  id: string;
}

interface DiagramRendererProps {
  content: string;
  className?: string;
}

const DiagramRenderer: React.FC<DiagramRendererProps> = ({ content, className = '' }) => {
  // Parse diagram data from content
  const parseDiagrams = (content: string): DiagramData[] => {
    const diagrams: DiagramData[] = [];
    
    // Look for diagram blocks in the format: [DIAGRAM:type:data]
    const diagramRegex = /\[DIAGRAM:(\w+):(.*?)\]/g;
    let match;
    
    while ((match = diagramRegex.exec(content)) !== null) {
      const [, type, dataString] = match;
      try {
        const data = JSON.parse(dataString);
        diagrams.push({
          type: type as 'force' | 'circuit' | 'wave',
          data,
          id: `diagram-${diagrams.length}`
        });
      } catch {
        // Skip invalid diagram data
      }
    }
    
    return diagrams;
  };

  // Replace diagram placeholders with rendered components
  const renderContentWithDiagrams = (content: string) => {
    const diagrams = parseDiagrams(content);
    let processedContent = content;
    
    diagrams.forEach((diagram, index) => {
      const placeholder = `[DIAGRAM:${diagram.type}:${JSON.stringify(diagram.data)}]`;
      const diagramId = `diagram-${index}`;
      
      // Create a placeholder div that we'll replace with the actual diagram
      const diagramPlaceholder = `<div id="${diagramId}" class="diagram-placeholder"></div>`;
      processedContent = processedContent.replace(placeholder, diagramPlaceholder);
    });
    
    return { processedContent, diagrams };
  };

  const { processedContent, diagrams } = renderContentWithDiagrams(content);

  // Render individual diagram components
  const renderDiagram = (diagram: DiagramData) => {
    const commonProps = {
      key: diagram.id,
      className: "my-6"
    };

    switch (diagram.type) {
      case 'force':
        return <ForceDiagram {...commonProps} {...diagram.data} />;
      case 'circuit':
        return <CircuitDiagram {...commonProps} {...diagram.data} />;
      case 'wave':
        return <WaveDiagram {...commonProps} {...diagram.data} />;
      default:
        return null;
    }
  };

  return (
    <div className={`diagram-renderer ${className}`}>
      <div 
        dangerouslySetInnerHTML={{ __html: processedContent }}
        className="lesson-content"
      />
      {diagrams.length > 0 && (
        <div className="diagrams-container">
          {diagrams.map(renderDiagram)}
        </div>
      )}
    </div>
  );
};

export default DiagramRenderer;
