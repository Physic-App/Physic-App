@echo off
echo ========================================
echo PhysicsFlow PDF Copy Script
echo ========================================
echo.
echo This script will help you copy your PDFs to the correct location.
echo.
echo Please place your PDF files in the same directory as this script,
echo then run this script to copy them to the public/pdfs/ directory.
echo.

REM Create the pdfs directory if it doesn't exist
if not exist "public\pdfs" mkdir "public\pdfs"

echo Copying PDF files...
echo.

REM Copy each PDF file
copy "force and presure.pdf" "public\pdfs\" 2>nul && echo ✓ force and presure.pdf || echo ✗ force and presure.pdf not found
copy "friction.pdf" "public\pdfs\" 2>nul && echo ✓ friction.pdf || echo ✗ friction.pdf not found
copy "electric cuurent and its effects.pdf" "public\pdfs\" 2>nul && echo ✓ electric cuurent and its effects.pdf || echo ✗ electric cuurent and its effects.pdf not found
copy "motion.pdf" "public\pdfs\" 2>nul && echo ✓ motion.pdf || echo ✗ motion.pdf not found
copy "force and law of motion.pdf" "public\pdfs\" 2>nul && echo ✓ force and law of motion.pdf || echo ✗ force and law of motion.pdf not found
copy "gravitation.pdf" "public\pdfs\" 2>nul && echo ✓ gravitation.pdf || echo ✗ gravitation.pdf not found
copy "light-refection and refraction.pdf" "public\pdfs\" 2>nul && echo ✓ light-refection and refraction.pdf || echo ✗ light-refection and refraction.pdf not found
copy "electricity.pdf" "public\pdfs\" 2>nul && echo ✓ electricity.pdf || echo ✗ electricity.pdf not found
copy "manetice effects and electrric cuurent.pdf" "public\pdfs\" 2>nul && echo ✓ manetice effects and electrric cuurent.pdf || echo ✗ manetice effects and electrric cuurent.pdf not found
copy "work and energy.pdf" "public\pdfs\" 2>nul && echo ✓ work and energy.pdf || echo ✗ work and energy.pdf not found

echo.
echo ========================================
echo PDF Copy Complete!
echo ========================================
echo.
echo Your PDFs have been copied to: public\pdfs\
echo.
echo Now you can:
echo 1. Start your development server: npm run dev
echo 2. Go to the Chatbot page
echo 3. The system will automatically load your PDF content
echo.
echo If you need to reload the PDFs, use the "Reload PDFs" button in the chatbot.
echo.
pause
