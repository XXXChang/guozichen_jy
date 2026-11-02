$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceDirectory = Join-Path $projectRoot 'assets\gzc_jy_Img\AlbumImg\EatTog'
$targetDirectory = Join-Path $sourceDirectory 'Thumbnails'
$maxWidth = 640
$maxHeight = 480
$jpegQuality = 72L

New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
Add-Type -AssemblyName System.Drawing

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq 'image/jpeg' }
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
    [System.Drawing.Imaging.Encoder]::Quality,
    $jpegQuality
)

$generated = 0
try {
    Get-ChildItem -LiteralPath $sourceDirectory -File |
        Where-Object { $_.Extension -match '^\.(?:jpe?g|png)$' } |
        ForEach-Object {
            $destination = Join-Path $targetDirectory ($_.BaseName + '.jpg')
            if ((Test-Path -LiteralPath $destination) -and
                (Get-Item -LiteralPath $destination).LastWriteTimeUtc -ge $_.LastWriteTimeUtc) {
                return
            }

            $image = [System.Drawing.Image]::FromFile($_.FullName)
            try {
                $scale = [Math]::Min(
                    1.0,
                    [Math]::Min($maxWidth / $image.Width, $maxHeight / $image.Height)
                )
                $width = [Math]::Max(1, [int][Math]::Round($image.Width * $scale))
                $height = [Math]::Max(1, [int][Math]::Round($image.Height * $scale))
                $bitmap = [System.Drawing.Bitmap]::new($width, $height)
                try {
                    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
                    try {
                        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                        $graphics.DrawImage($image, 0, 0, $width, $height)
                    } finally {
                        $graphics.Dispose()
                    }
                    $bitmap.Save($destination, $codec, $parameters)
                    $generated++
                } finally {
                    $bitmap.Dispose()
                }
            } finally {
                $image.Dispose()
            }
        }
} finally {
    $parameters.Dispose()
}

Write-Output "Generated or updated $generated album thumbnails."
