// Content converter utility to transform plain text to structured markdown/HTML

export interface ContentSection {
  type: 'intro' | 'formula' | 'example' | 'derivation' | 'misconception' | 'summary';
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export class ContentConverter {
  /**
   * Convert plain text content to structured sections
   */
  static convertToStructuredContent(plainText: string): ContentSection[] {
    const sections: ContentSection[] = [];
    const lines = plainText.split('\n').filter(line => line.trim());
    
    let currentSection: ContentSection | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect section headers
      if (this.isSectionHeader(line)) {
        // Save previous section
        if (currentSection) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = this.createSectionFromHeader(line);
      } else if (currentSection) {
        // Add content to current section
        currentSection.content += (currentSection.content ? '\n' : '') + line;
      }
    }
    
    // Add final section
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  /**
   * Convert structured content to markdown
   */
  static convertToMarkdown(sections: ContentSection[]): string {
    return sections.map(section => this.sectionToMarkdown(section)).join('\n\n---\n\n');
  }

  /**
   * Convert structured content to HTML
   */
  static convertToHTML(sections: ContentSection[]): string {
    return sections.map(section => this.sectionToHTML(section)).join('\n\n');
  }

  private static isSectionHeader(line: string): boolean {
    const headerPatterns = [
      /^(basic|key|main)\s+(formula|formulae|equation|equations)/i,
      /^(solved\s+)?example\s+\d+/i,
      /^derivation/i,
      /^proof/i,
      /^additional\s+(useful\s+)?formula/i,
      /^common\s+misconception/i,
      /^mistake/i,
      /^warning/i,
      /^summary/i,
      /^conclusion/i
    ];
    
    return headerPatterns.some(pattern => pattern.test(line));
  }

  private static createSectionFromHeader(header: string): ContentSection {
    const lowerHeader = header.toLowerCase();
    
    if (lowerHeader.includes('formula') || lowerHeader.includes('equation')) {
      return {
        type: 'formula',
        title: header,
        content: '',
        metadata: { isCollapsible: true }
      };
    } else if (lowerHeader.includes('example') || lowerHeader.includes('problem')) {
      return {
        type: 'example',
        title: header,
        content: '',
        metadata: { isCollapsible: true, hasProgress: true }
      };
    } else if (lowerHeader.includes('derivation') || lowerHeader.includes('proof')) {
      return {
        type: 'derivation',
        title: header,
        content: '',
        metadata: { isCollapsible: true }
      };
    } else if (lowerHeader.includes('misconception') || lowerHeader.includes('mistake') || lowerHeader.includes('warning')) {
      return {
        type: 'misconception',
        title: header,
        content: '',
        metadata: { severity: 'medium' }
      };
    } else if (lowerHeader.includes('summary') || lowerHeader.includes('conclusion')) {
      return {
        type: 'summary',
        title: header,
        content: '',
        metadata: { isCollapsible: false }
      };
    } else {
      return {
        type: 'intro',
        title: header,
        content: '',
        metadata: { isCollapsible: false }
      };
    }
  }

  private static sectionToMarkdown(section: ContentSection): string {
    const { type, title, content } = section;
    
    let markdown = `## ${title}\n\n`;
    
    switch (type) {
      case 'formula':
        markdown += this.formatFormulas(content);
        break;
      case 'example':
        markdown += this.formatExample(content);
        break;
      case 'derivation':
        markdown += this.formatDerivation(content);
        break;
      case 'misconception':
        markdown += this.formatMisconception(content);
        break;
      default:
        markdown += content;
    }
    
    return markdown;
  }

  private static sectionToHTML(section: ContentSection): string {
    const { type, title, content, metadata } = section;
    
    let html = `<div class="content-section ${type}-section">`;
    
    if (metadata?.isCollapsible) {
      html += `<div class="collapsible-section">`;
      html += `<div class="collapsible-header">`;
      html += `<button class="collapsible-button">`;
      html += `<h3>${title}</h3>`;
      html += `</button>`;
      html += `</div>`;
      html += `<div class="collapsible-content">`;
    } else {
      html += `<h2 class="section-title">${title}</h2>`;
    }
    
    switch (type) {
      case 'formula':
        html += this.formatFormulasHTML(content);
        break;
      case 'example':
        html += this.formatExampleHTML(content);
        break;
      case 'derivation':
        html += this.formatDerivationHTML(content);
        break;
      case 'misconception':
        html += this.formatMisconceptionHTML(content);
        break;
      default:
        html += `<div class="section-content">${content}</div>`;
    }
    
    if (metadata?.isCollapsible) {
      html += `</div></div>`;
    }
    
    html += `</div>`;
    return html;
  }

  private static formatFormulas(content: string): string {
    return content
      .split('\n')
      .map(line => {
        if (line.includes('=') && (line.includes('P') || line.includes('F') || line.includes('A'))) {
          return `\`${line}\``;
        }
        return line;
      })
      .join('\n');
  }

  private static formatExample(content: string): string {
    const lines = content.split('\n');
    let formatted = '';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('solution:')) {
        formatted += `**Solution:**\n`;
      } else if (line.includes('=') && line.includes('/')) {
        formatted += `\`${line}\`\n`;
      } else {
        formatted += `${line}\n`;
      }
    }
    
    return formatted;
  }

  private static formatDerivation(content: string): string {
    return content
      .split('\n')
      .map((line) => {
        if (line.includes('Step') || line.includes('Consider') || line.includes('Therefore')) {
          return `**${line}**`;
        }
        return line;
      })
      .join('\n');
  }

  private static formatMisconception(content: string): string {
    return `> **⚠️ Common Misconception:** ${content}`;
  }

  private static formatFormulasHTML(content: string): string {
    return content
      .split('\n')
      .map(line => {
        if (line.includes('=') && (line.includes('P') || line.includes('F') || line.includes('A'))) {
          return `<div class="formula-highlight">${line}</div>`;
        }
        return `<p>${line}</p>`;
      })
      .join('');
  }

  private static formatExampleHTML(content: string): string {
    const lines = content.split('\n');
    let html = '<div class="example-content">';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('solution:')) {
        html += `<h4>Solution:</h4>`;
      } else if (line.includes('=') && line.includes('/')) {
        html += `<div class="formula-highlight">${line}</div>`;
      } else {
        html += `<p>${line}</p>`;
      }
    }
    
    html += '</div>';
    return html;
  }

  private static formatDerivationHTML(content: string): string {
    return content
      .split('\n')
      .map((line) => {
        if (line.includes('Step') || line.includes('Consider') || line.includes('Therefore')) {
          return `<div class="step-by-step">${line}</div>`;
        }
        return `<p>${line}</p>`;
      })
      .join('');
  }

  private static formatMisconceptionHTML(content: string): string {
    return `<div class="misconception-alert">${content}</div>`;
  }
}

export default ContentConverter;
