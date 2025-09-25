# PhysicsFlow PDF Copy Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PhysicsFlow PDF Copy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you copy your PDFs to the correct location." -ForegroundColor Yellow
Write-Host ""
Write-Host "Please place your PDF files in the same directory as this script," -ForegroundColor Yellow
Write-Host "then run this script to copy them to the public/pdfs/ directory." -ForegroundColor Yellow
Write-Host ""

# Create the pdfs directory if it doesn't exist
if (!(Test-Path "public\pdfs")) {
    New-Item -ItemType Directory -Path "public\pdfs" -Force | Out-Null
}

Write-Host "Copying PDF files..." -ForegroundColor Green
Write-Host ""

# Define PDF files to copy
$pdfFiles = @(
    "force and presure.pdf",
    "friction.pdf", 
    "electric cuurent and its effects.pdf",
    "motion.pdf",
    "force and law of motion.pdf",
    "gravitation.pdf",
    "light-refection and refraction.pdf",
    "electricity.pdf",
    "manetice effects and electrric cuurent.pdf",
    "work and energy.pdf"
)

# Copy each PDF file
foreach ($pdfFile in $pdfFiles) {
    if (Test-Path $pdfFile) {
        Copy-Item $pdfFile "public\pdfs\" -Force
        Write-Host "✓ $pdfFile" -ForegroundColor Green
    } else {
        Write-Host "✗ $pdfFile not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PDF Copy Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your PDFs have been copied to: public\pdfs\" -ForegroundColor Yellow
Write-Host ""
Write-Host "Now you can:" -ForegroundColor Yellow
Write-Host "1. Start your development server: npm run dev" -ForegroundColor White
Write-Host "2. Go to the Chatbot page" -ForegroundColor White
Write-Host "3. The system will automatically load your PDF content" -ForegroundColor White
Write-Host ""
Write-Host "If you need to reload the PDFs, use the 'Reload PDFs' button in the chatbot." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
