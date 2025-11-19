# Get Debug Response from 401 Error

## 🔍 The Issue
When you get a 401 error, PowerShell shows an error, but the response body (with debug info) is still there. We need to see it!

---

## ✅ Solution: Catch the Error and Read Response

Run this command instead:

```powershell
try {
    $headers = @{ "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345" }
    $response = Invoke-WebRequest -Uri "https://besthusbandever.com/api/cron/send-tomorrow-tips" -Method GET -Headers $headers
    $response.Content
} catch {
    $_.Exception.Response
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $reader.BaseStream.Position = 0
    $reader.DumpResponse = $reader.ReadToEnd()
    $reader.DumpResponse
}
```

**Or this simpler version:**

```powershell
try {
    $headers = @{ "Authorization" = "Bearer 08f1a63aad04279af8722f158d22d12cb8440e42949be73acde14726d2bf5345" }
    $response = Invoke-WebRequest -Uri "https://besthusbandever.com/api/cron/send-tomorrow-tips" -Method GET -Headers $headers -ErrorAction Stop
    $response.Content
} catch {
    $stream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($stream)
    $responseBody = $reader.ReadToEnd()
    $responseBody
}
```

---

## 🎯 What We're Looking For

The debug response should show:
```json
{
  "error": "Unauthorized",
  "debug": {
    "hasHeader": true/false,
    "hasSecret": true/false,
    "headerLength": 123,
    "expectedLength": 123
  }
}
```

This will tell us:
- ✅ Is the header being received?
- ✅ Is CRON_SECRET in the environment?
- ✅ Are the lengths matching? (whitespace issue?)

---

**Run the try/catch command above to see the debug response!**

