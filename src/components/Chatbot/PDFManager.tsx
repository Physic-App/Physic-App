import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { pdfManager } from '../../services/pdfManager';
import { PDFInfo } from '../../services/pdfManager';

export const PDFManager: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDFInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    loadPDFStatus();
  }, []);

  const loadPDFStatus = () => {
    const status = pdfManager.getPDFStatus();
    setPdfs(status.pdfs);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setUploadStatus('');

    try {
      // Process uploaded files
      const results = [];
      for (const file of Array.from(files)) {
        if (file.type === 'application/pdf') {
          const result = await pdfManager.loadPDFFromPublic(file.name);
          results.push({ filename: file.name, ...result });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      setUploadStatus(`Uploaded ${successful} PDFs successfully${failed > 0 ? `, ${failed} failed` : ''}`);
      loadPDFStatus();
    } catch (error) {
      setUploadStatus(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReloadPDFs = async () => {
    setIsLoading(true);
    setUploadStatus('');

    try {
      const results = await pdfManager.loadAllPDFsFromPublic();
      setUploadStatus(`Loaded ${results.successfulPDFs}/${results.totalPDFs} PDFs from public directory`);
      loadPDFStatus();
    } catch (error) {
      setUploadStatus(`Reload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <FileText size={20} />
          PDF Manager
        </h3>
        <button
          onClick={handleReloadPDFs}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          Reload PDFs
        </button>
      </div>

      {/* Upload Status */}
      {uploadStatus && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm text-blue-700 dark:text-blue-300">
          {uploadStatus}
        </div>
      )}

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Upload PDFs to public/pdfs/ directory
        </label>
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileUpload}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Place your PDFs in the public/pdfs/ directory and click "Reload PDFs"
        </p>
      </div>

      {/* PDF Status List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">PDF Status:</h4>
        {pdfs.map((pdf) => (
          <div
            key={pdf.chapterId}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border"
          >
            <div className="flex items-center gap-3">
              {pdf.isLoaded ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <XCircle size={16} className="text-red-500" />
              )}
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {pdf.chapterTitle}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {pdf.filename}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {pdf.isLoaded ? `${pdf.chunksCount} chunks` : 'Not loaded'}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-sm text-yellow-700 dark:text-yellow-300">
        <strong>Instructions:</strong>
        <ol className="list-decimal list-inside mt-1 space-y-1">
          <li>Copy your PDF files to the <code>public/pdfs/</code> directory</li>
          <li>Make sure filenames match exactly (case-sensitive)</li>
          <li>Click "Reload PDFs" to load them into the system</li>
          <li>The chatbot will automatically use the PDF content for better responses</li>
        </ol>
      </div>
    </div>
  );
};
