# PowerShell script to send test email via API endpoint
# Usage: .\scripts\send-test-email.ps1 -Secret "your-cron-secret"

param(
    [Parameter(Mandatory=$true)]
    [string]$Secret
)

$body = @{username = "Thommer22"} | ConvertTo-Json
$uri = "https://besthusbandever.com/api/email/test?secret=$Secret"

Write-Host "Sending test email..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $uri -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host ""
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Message: $($result.message)" -ForegroundColor Green
    Write-Host "Email sent to: $($result.user.email)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Check your inbox for the new tone email!" -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
    
    exit 1
}

