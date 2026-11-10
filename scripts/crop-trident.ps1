Add-Type -AssemblyName System.Drawing
$file = "C:\DRIVE D\EMPIRIAL\Main Website\public\images\ads\lucid-trident-bg.png"
$src = [System.Drawing.Bitmap]::FromFile($file)
Write-Host "Source dimensions:" $src.Width "x" $src.Height

# We want the trident head (from around x=420 to width)
$startX = 420
$width = $src.Width - $startX
$height = $src.Height

$rect = New-Object System.Drawing.Rectangle($startX, 0, $width, $height)
$crop = $src.Clone($rect, $src.PixelFormat)
$crop.Save("C:\DRIVE D\EMPIRIAL\Main Website\public\images\ads\lucid-trident-head.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Also let's create a square emblem version centered on the prongs
$emblemSize = [Math]::Min($src.Height, $width)
$emblemRect = New-Object System.Drawing.Rectangle(($src.Width - $emblemSize), 0, $emblemSize, $emblemSize)
$emblem = $src.Clone($emblemRect, $src.PixelFormat)
$emblem.Save("C:\DRIVE D\EMPIRIAL\Main Website\public\images\ads\lucid-trident-emblem.png", [System.Drawing.Imaging.ImageFormat]::Png)

$src.Dispose()
$crop.Dispose()
$emblem.Dispose()
Write-Host "Cropped images generated successfully!"

