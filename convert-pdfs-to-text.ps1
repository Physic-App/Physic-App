# Convert PDFs to Text Files Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PDF to Text Converter for PhysicsFlow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you convert your PDFs to text files." -ForegroundColor Yellow
Write-Host "Since your PDFs are corrupted, we'll use text files instead." -ForegroundColor Yellow
Write-Host ""

# Create the texts directory if it doesn't exist
if (!(Test-Path "public\texts")) {
    New-Item -ItemType Directory -Path "public\texts" -Force | Out-Null
}

Write-Host "📁 Created public\texts directory" -ForegroundColor Green
Write-Host ""

# Define the text file mappings
$textFiles = @(
    @{ Original = "force and presure.pdf"; Text = "force-and-pressure.txt"; Title = "Force and Pressure" },
    @{ Original = "friction.pdf"; Text = "friction.txt"; Title = "Friction" },
    @{ Original = "electric cuurent and its effects.pdf"; Text = "electric-current.txt"; Title = "Electric Current and Its Effects" },
    @{ Original = "motion.pdf"; Text = "motion.txt"; Title = "Motion" },
    @{ Original = "force and law of motion.pdf"; Text = "force-and-laws.txt"; Title = "Force and Laws of Motion" },
    @{ Original = "gravitation.pdf"; Text = "gravitation.txt"; Title = "Gravitation" },
    @{ Original = "light-refection and refraction.pdf"; Text = "light-reflection.txt"; Title = "Light: Reflection and Refraction" },
    @{ Original = "electricity.pdf"; Text = "electricity.txt"; Title = "Electricity" },
    @{ Original = "manetice effects and electrric cuurent.pdf"; Text = "magnetic-effects.txt"; Title = "Magnetic Effects of Electric Current" },
    @{ Original = "work and energy.pdf"; Text = "work-and-energy.txt"; Title = "Work and Energy" }
)

Write-Host "📝 Creating text file templates..." -ForegroundColor Green
Write-Host ""

foreach ($file in $textFiles) {
    $textFilePath = "public\texts\$($file.Text)"
    
    # Create a template text file with the chapter title and instructions
    $templateContent = @"
# $($file.Title)

## Instructions:
1. Copy the text content from your PDF: $($file.Original)
2. Paste it below this line
3. Save this file
4. The chatbot will automatically load this content

## Content from PDF:
[Paste your PDF content here]

## Additional Notes:
- Make sure to include all important concepts, formulas, and examples
- You can format the text with markdown (use **bold** for important terms)
- Include mathematical formulas using LaTeX notation if needed
"@

    Set-Content -Path $textFilePath -Value $templateContent -Encoding UTF8
    Write-Host "✅ Created: $($file.Text)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Text Files Created Successfully!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Open each text file in public\texts\" -ForegroundColor White
Write-Host "2. Copy the content from your corresponding PDF" -ForegroundColor White
Write-Host "3. Paste it into the text file (replace the template content)" -ForegroundColor White
Write-Host "4. Save the text files" -ForegroundColor White
Write-Host "5. Refresh your chatbot - it will automatically load the text content!" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: You can open PDFs in Chrome and copy-paste the text content." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
