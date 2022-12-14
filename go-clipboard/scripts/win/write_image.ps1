# save image from db to a tmp file on disk first, get path from arg
# $imagePath = "C:\path\to\your\image.png"
param (
    [string]$imagePath
)
Write-Output $imagePath
# # Load the image into a System.Drawing.Image object
$image = [System.Drawing.Image]::FromFile($imagePath)

# # Write the image to the clipboard
# https://learn.microsoft.com/en-us/dotnet/api/system.windows.forms.clipboard?view=windowsdesktop-7.0
[System.Windows.Forms.Clipboard]::SetData("PNG", $image)
[System.Windows.Forms.Clipboard]::SetImage($image)
