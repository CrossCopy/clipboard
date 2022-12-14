
# param (
#     [string]$content
# )
$stdin= Read-Host
Write-Output $stdin
[System.Windows.Forms.Clipboard]::SetText($stdin)