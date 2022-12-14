# get clipboard image, convert to base64 string and output to stdout

$image = Get-Clipboard -format image

if ($null -eq $image) {
    Write-Output "NO_IMAGE"
} else {
    # Save the image to a temporary file
    $tempFile = [System.IO.Path]::GetTempFileName()
    $image.Save($tempFile)
    
    # Read the contents of the temporary file as a byte array
    $bytes = Get-Content -Path $tempFile -Encoding Byte
    
    # Convert the byte array to a base64 string
    $base64 = [System.Convert]::ToBase64String($bytes)
    
    # Delete the temporary file
    Remove-Item -Path $tempFile -Force
    
    # Output the base64 string
    Write-Output $base64
}