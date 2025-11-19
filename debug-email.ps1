# Debug Email Service - Check What Happened
# Run this while your dev server is running

Write-Host "Testing email endpoint..." -ForegroundColor Yellow
Write-Host ""

$headers = @{
    "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/cron/send-tomorrow-tips" -Method GET -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ Request successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response:" -ForegroundColor Cyan
    $json = $response.Content | ConvertFrom-Json
    $json | ConvertTo-Json -Depth 10
    
    Write-Host ""
    Write-Host "Summary:" -ForegroundColor Yellow
    Write-Host "  Total users: $($json.total)"
    Write-Host "  Emails sent: $($json.sent)"
    Write-Host "  Errors: $($json.errors)"
    
    if ($json.sent -eq 0) {
        Write-Host ""
        Write-Host "⚠️  No emails were sent!" -ForegroundColor Red
        Write-Host "Possible reasons:" -ForegroundColor Yellow
        Write-Host "  1. No users in database"
        Write-Host "  2. Users don't have email addresses"
        Write-Host "  3. Email sending failed (check dev server terminal)"
        Write-Host ""
        Write-Host "Check the terminal where 'npm run dev' is running for error messages."
    }
    
} catch {
    Write-Host "❌ Request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host ""
        Write-Host "Error Details:" -ForegroundColor Yellow
        try {
            $errorJson = $responseBody | ConvertFrom-Json
            $errorJson | ConvertTo-Json -Depth 10
        } catch {
            Write-Host $responseBody
        }
    }
}

