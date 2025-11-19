# Get full response including error body
try {
    $headers = @{ "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345" }
    $response = Invoke-WebRequest -Uri "https://besthusbandever.com/api/cron/send-tomorrow-tips" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "Success! Response:"
    $response.Content
} catch {
    Write-Host "Error Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Error Message: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Response Body:"
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    $reader.Close()
    $stream.Close()
    $responseBody
}

