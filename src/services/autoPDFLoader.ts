import { browserPDFProcessor } from './browserPDFProcessor';
import { pdfManager } from './pdfManager';
import { textFileProcessor } from './textFileProcessor';

export class AutoPDFLoader {
  private static instance: AutoPDFLoader;
  private isLoaded = false;
  private loadingPromise: Promise<void> | null = null;

  static getInstance(): AutoPDFLoader {
    if (!AutoPDFLoader.instance) {
      AutoPDFLoader.instance = new AutoPDFLoader();
    }
    return AutoPDFLoader.instance;
  }

  async loadAllPDFs(): Promise<void> {
    if (this.isLoaded || this.loadingPromise) {
      return this.loadingPromise || Promise.resolve();
    }

    this.loadingPromise = this.performLoad();
    await this.loadingPromise;
    return this.loadingPromise;
  }

  private async performLoad(): Promise<void> {
    try {
      console.log('🚀 Auto-loading physics content...');
      
      // First try to load text files (since PDFs are corrupted)
      try {
        const textResults = await textFileProcessor.loadAllTextFiles();
        console.log(`📄 Loaded ${textResults.successfulFiles}/${textResults.totalFiles} text files from public directory`);
        
        if (textResults.successfulFiles > 0) {
          console.log('✅ Auto-loaded actual text content');
          this.isLoaded = true;
          return;
        }
      } catch (textError) {
        console.warn('⚠️ Could not load text files from public directory:', textError);
      }
      
      // Second try: Load actual PDFs from public directory
      try {
        const pdfResults = await pdfManager.loadAllPDFsFromPublic();
        console.log(`📄 Loaded ${pdfResults.successfulPDFs}/${pdfResults.totalPDFs} PDFs from public directory`);
        
        if (pdfResults.successfulPDFs > 0) {
          console.log('✅ Auto-loaded actual PDF content');
          this.isLoaded = true;
          return;
        }
      } catch (pdfError) {
        console.warn('⚠️ Could not load PDFs from public directory:', pdfError);
      }
      
      // Final fallback: Load sample data (works without any files)
      console.log('📝 Loading sample physics content as fallback...');
      browserPDFProcessor.loadSampleData();
      console.log('✅ Auto-loaded sample physics content for all 10 chapters');
      
      this.isLoaded = true;
    } catch (error) {
      console.error('❌ Error auto-loading content:', error);
      // Don't throw - let the app continue
    }
  }

  isContentLoaded(): boolean {
    return this.isLoaded;
  }

  getChapterCount(): number {
    return pdfManager.getPDFStatus().totalChapters;
  }

  /**
   * Get PDF loading status
   */
  getPDFStatus() {
    return pdfManager.getPDFStatus();
  }

  /**
   * Check if actual PDFs are available
   */
  async checkPDFAvailability() {
    return await pdfManager.checkPDFAvailability();
  }
}

// Export singleton instance
export const autoPDFLoader = AutoPDFLoader.getInstance();
