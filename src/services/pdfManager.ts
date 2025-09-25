/**
 * PDF Manager - Handles PDF loading and management
 */

import { browserPDFProcessor } from './browserPDFProcessor';
import { localStorageRAG } from './localStorageRAG';

export interface PDFInfo {
  filename: string;
  chapterId: string;
  chapterTitle: string;
  isLoaded: boolean;
  chunksCount?: number;
}

class PDFManager {
  private readonly PDF_MAPPING = {
    'force-and-pressure': { filename: 'force and presure.pdf', title: 'Force and Pressure' },
    'friction': { filename: 'friction.pdf', title: 'Friction' },
    'electric-current': { filename: 'electric cuurent and its effects.pdf', title: 'Electric Current and Its Effects' },
    'motion': { filename: 'motion.pdf', title: 'Motion' },
    'force-and-laws': { filename: 'force and law of motion.pdf', title: 'Force and Laws of Motion' },
    'gravitation': { filename: 'gravitation.pdf', title: 'Gravitation' },
    'light-reflection': { filename: 'light-refection and refraction.pdf', title: 'Light: Reflection and Refraction' },
    'electricity': { filename: 'electricity.pdf', title: 'Electricity' },
    'magnetic-effects': { filename: 'manetice effects and electrric cuurent.pdf', title: 'Magnetic Effects of Electric Current' },
    'work-and-energy': { filename: 'work and energy.pdf', title: 'Work and Energy' }
  };

  /**
   * Get all PDF information
   */
  getAllPDFs(): PDFInfo[] {
    return Object.entries(this.PDF_MAPPING).map(([chapterId, info]) => {
      const ragData = localStorageRAG.getChapterRAGData(chapterId);
      return {
        filename: info.filename,
        chapterId,
        chapterTitle: info.title,
        isLoaded: ragData !== null,
        chunksCount: ragData?.content.length || 0
      };
    });
  }

  /**
   * Load a specific PDF from public directory
   */
  async loadPDFFromPublic(chapterId: string): Promise<{ success: boolean; message: string }> {
    const pdfInfo = this.PDF_MAPPING[chapterId as keyof typeof this.PDF_MAPPING];
    if (!pdfInfo) {
      return { success: false, message: `Unknown chapter: ${chapterId}` };
    }

    try {
      console.log(`📄 Loading PDF: ${pdfInfo.filename}`);
      
      // Try to fetch PDF from public directory
      const response = await fetch(`/pdfs/${encodeURIComponent(pdfInfo.filename)}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      const file = new File([blob], pdfInfo.filename, { type: 'application/pdf' });

      // Process the PDF
      const result = await browserPDFProcessor.processPDFFile(file);
      
      return {
        success: result.success,
        message: result.message
      };

    } catch (error) {
      console.error(`Error loading PDF ${pdfInfo.filename}:`, error);
      return {
        success: false,
        message: `Failed to load ${pdfInfo.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Load all PDFs from public directory
   */
  async loadAllPDFsFromPublic(): Promise<{
    totalPDFs: number;
    successfulPDFs: number;
    failedPDFs: number;
    results: Array<{ chapterId: string; success: boolean; message: string }>;
  }> {
    const results: Array<{ chapterId: string; success: boolean; message: string }> = [];
    let successfulPDFs = 0;
    let failedPDFs = 0;

    for (const chapterId of Object.keys(this.PDF_MAPPING)) {
      const result = await this.loadPDFFromPublic(chapterId);
      results.push({ chapterId, ...result });
      
      if (result.success) {
        successfulPDFs++;
      } else {
        failedPDFs++;
      }
    }

    return {
      totalPDFs: Object.keys(this.PDF_MAPPING).length,
      successfulPDFs,
      failedPDFs,
      results
    };
  }

  /**
   * Check if PDFs are available in public directory
   */
  async checkPDFAvailability(): Promise<Record<string, boolean>> {
    const availability: Record<string, boolean> = {};

    for (const [chapterId, info] of Object.entries(this.PDF_MAPPING)) {
      try {
        const response = await fetch(`/pdfs/${encodeURIComponent(info.filename)}`, { method: 'HEAD' });
        availability[chapterId] = response.ok;
      } catch {
        availability[chapterId] = false;
      }
    }

    return availability;
  }

  /**
   * Get PDF status for all chapters
   */
  getPDFStatus(): {
    totalChapters: number;
    loadedChapters: number;
    availablePDFs: number;
    pdfs: PDFInfo[];
  } {
    const pdfs = this.getAllPDFs();
    const loadedChapters = pdfs.filter(pdf => pdf.isLoaded).length;
    
    return {
      totalChapters: pdfs.length,
      loadedChapters,
      availablePDFs: 0, // Will be updated by checkPDFAvailability
      pdfs
    };
  }
}

// Export singleton instance
export const pdfManager = new PDFManager();
