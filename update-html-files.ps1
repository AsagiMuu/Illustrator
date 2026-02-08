# update-html-files.ps1
# Script to update all HTML files to use components.js

$files = @(
    "gallery.html",
    "about.html",
    "pricing.html",
    "pricing-corporate.html",
    "terms.html",
    "workflow.html",
    "form.html",
    "faq.html",
    "contact.html",
    "links.html"
)

$workDir = "c:/Users/holyl/OneDrive/デスクトップ/asagimuu_portfolio_ver0.9.6_Antigravity"

foreach ($file in $files) {
    $filePath = Join-Path $workDir $file
    
    if (Test-Path $filePath) {
        Write-Host "Processing $file..." -ForegroundColor Cyan
        
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # 1. Add components.js script tag before </head>
        if ($content -notmatch 'components\.js') {
            $content = $content -replace '(\s*<script src="common\.js" defer></script>)', "`$1`r`n    <script src=`"components.js`"></script>"
        }
        
        # 2. Remove navigation HTML (from <!-- Navigation --> to </nav>)
        $content = $content -replace '(?s)\s*<!-- Navigation -->.*?</nav>', "`r`n    <!-- Navigation and Mobile Menu will be injected by components.js -->"
        
        # 3. Remove mobile menu HTML (from <!-- Mobile Menu --> to the closing </div> with close-menu button)
        $content = $content -replace '(?s)\s*<!-- Mobile Menu -->.*?<button id="close-menu".*?</button>\s*</div>', ''
        
        # 4. Remove footer HTML
        $content = $content -replace '(?s)\s*<footer[^>]*>.*?</footer>', "`r`n    <!-- Footer will be injected by components.js -->"
        
        # Save the updated content
        Set-Content $filePath $content -Encoding UTF8 -NoNewline
        
        Write-Host "✓ Updated $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Green
