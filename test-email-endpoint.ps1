# Test Email Endpoint with Better Error Handling
# Run this script to see detailed error messages

$headers = @{
    "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345"
}

try {
    Write-Host "Testing email endpoint..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/cron/send-tomorrow-tips" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "`n✅ Success!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`n❌ Error occurred!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nError Details:" -ForegroundColor Yellow
        try {
            $errorJson = $responseBody | ConvertFrom-Json
            $errorJson | ConvertTo-Json -Depth 10
        } catch {
            Write-Host $responseBody
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

