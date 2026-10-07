// Helper utility for generating high-resolution (300 DPI) Standee & Sticker PNGs
// Designed with a Clean, Standard, Professional aesthetic

export type StandeeTheme = 'standard' | 'ink-saver'
export type StandeeFormat = 'a4' | 'a5' | 'sticker'

export interface StandeeCanvasLabels {
  checkpointSubtitle?: string
  locationPrefix?: string
  scanInstruction?: string
  securityKeyLabel?: string
  step1?: string
  step2?: string
  step3?: string
  requirementPrefix?: string
  gpsConditionPrefix?: string
  metersUnit?: string
  deviceIdBound?: string
  systemSuffix?: string
}

export interface StandeeCanvasOptions {
  theme: StandeeTheme
  sizeFormat: StandeeFormat
  companyName: string
  branchName: string
  titleKh: string
  titleEn: string
  shiftText?: string
  wifiSsid: string
  radiusMeters: number
  qrToken: string
  qrSourceCanvas: HTMLCanvasElement | null
  labels?: StandeeCanvasLabels
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill = true,
  stroke = false
) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  if (fill) ctx.fill()
  if (stroke) ctx.stroke()
}

export async function generateStandeeCanvas(options: StandeeCanvasOptions): Promise<HTMLCanvasElement> {
  const {
    theme,
    sizeFormat,
    companyName,
    branchName,
    titleKh,
    titleEn,
    shiftText,
    wifiSsid,
    radiusMeters,
    qrToken,
    qrSourceCanvas,
    labels,
  } = options

  // Ensure fonts are loaded before canvas drawing
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready
    } catch {
      // Proceed if fonts ready fails
    }
  }

  // True High-Resolution Dimensions (300 DPI Equivalent)
  let width = 1240
  let height = 1754
  if (sizeFormat === 'a5') {
    width = 1050
    height = 1485
  } else if (sizeFormat === 'sticker') {
    width = 1200
    height = 1200
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not get canvas context')

  const isInkSaver = theme === 'ink-saver'
  const primaryColor = isInkSaver ? '#000000' : '#0f172a'
  const secondaryColor = isInkSaver ? '#222222' : '#334155'
  const accentColor = isInkSaver ? '#000000' : '#1e3a8a'
  const mutedColor = isInkSaver ? '#444444' : '#64748b'
  const borderColor = isInkSaver ? '#000000' : '#e2e8f0'
  const cardBg = '#ffffff'
  const boxBg = isInkSaver ? '#ffffff' : '#f8fafc'

  // 1. Pure White Background
  ctx.fillStyle = cardBg
  ctx.fillRect(0, 0, width, height)

  // Outer Border (Clean Crisp Line)
  ctx.strokeStyle = borderColor
  ctx.lineWidth = isInkSaver ? 3.5 : 2
  drawRoundedRect(ctx, 30, 30, width - 60, height - 60, 24, false, true)

  // Top Minimal Accent Line
  ctx.fillStyle = isInkSaver ? '#000000' : '#0f172a'
  ctx.fillRect(30, 30, width - 60, 8)

  // 2. Proportional Vertical Layout
  if (sizeFormat === 'sticker') {
    // ─── STICKER FORMAT (SQUARE 1:1) ───
    let y = 95

    // Company Name
    ctx.fillStyle = primaryColor
    ctx.font = 'bold 28px "Kantumruy Pro", system-ui, -apple-system, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(companyName.toUpperCase(), width / 2, y)
    y += 28

    // Subtitle
    ctx.fillStyle = mutedColor
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif'
    ctx.fillText(labels?.checkpointSubtitle || 'OFFICIAL ATTENDANCE CHECKPOINT', width / 2, y)
    y += 28

    // Branch location
    ctx.fillStyle = secondaryColor
    ctx.font = '600 17px "Kantumruy Pro", system-ui, sans-serif'
    ctx.fillText(`${labels?.locationPrefix || 'Location:'} ${branchName}`, width / 2, y)
    y += 34

    // Main Title
    ctx.fillStyle = primaryColor
    ctx.font = 'bold 42px "Kantumruy Pro", system-ui, sans-serif'
    ctx.fillText(titleKh, width / 2, y)
    y += 32

    ctx.fillStyle = accentColor
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif'
    ctx.fillText(titleEn, width / 2, y)
    y += 36

    // Large Square QR Box (580 x 580)
    const qrBoxSize = 580
    const qrBoxX = width / 2 - qrBoxSize / 2
    const qrBoxY = y

    ctx.fillStyle = boxBg
    ctx.strokeStyle = borderColor
    ctx.lineWidth = isInkSaver ? 2.5 : 1.5
    drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 20, true, true)

    // Inner QR Canvas
    const qrInnerSize = 480
    const qrInnerX = width / 2 - qrInnerSize / 2
    const qrInnerY = qrBoxY + 36

    ctx.fillStyle = '#ffffff'
    drawRoundedRect(ctx, qrInnerX - 12, qrInnerY - 12, qrInnerSize + 24, qrInnerSize + 24, 14, true, false)

    if (qrSourceCanvas) {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(qrSourceCanvas, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize)
      ctx.imageSmoothingEnabled = true
    }

    // Corner L-Brackets
    drawCornerBrackets(ctx, qrInnerX, qrInnerY, qrInnerSize, isInkSaver ? '#000000' : '#1e293b')

    // Caption under QR
    ctx.fillStyle = isInkSaver ? '#000000' : '#334155'
    ctx.font = 'bold 15px "Kantumruy Pro", system-ui, sans-serif'
    ctx.fillText(labels?.scanInstruction || 'Scan this QR code with Mobile App to record attendance', width / 2, qrInnerY + qrInnerSize + 32)
    y += qrBoxSize + 36

    // Verification Info
    ctx.fillStyle = mutedColor
    ctx.font = '600 15px "Kantumruy Pro", system-ui, sans-serif'
    const gpsPrefix = labels?.gpsConditionPrefix || 'GPS <'
    const unit = labels?.metersUnit || 'm'
    ctx.fillText(`${gpsPrefix} ${radiusMeters}${unit}   •   Wi-Fi: ${wifiSsid}`, width / 2, y)

    // Footer
    ctx.fillStyle = mutedColor
    ctx.font = '12px system-ui, -apple-system, sans-serif'
    ctx.fillText(`${companyName} • ${labels?.systemSuffix || 'Enterprise Attendance System'}`, width / 2, height - 44)

  } else {
    // ─── A4 & A5 POSTER / STANDEE FORMAT (1:1.414) ───
    const isA4 = sizeFormat === 'a4'

    let y = isA4 ? 120 : 100

    // 1. Company Name
    ctx.fillStyle = primaryColor
    ctx.font = `bold ${isA4 ? 32 : 28}px "Kantumruy Pro", system-ui, -apple-system, sans-serif`
    ctx.textAlign = 'center'
    // Shrink font if company name is very long
    if (companyName.length > 35) {
      ctx.font = `bold ${isA4 ? 26 : 22}px "Kantumruy Pro", system-ui, -apple-system, sans-serif`
    }
    ctx.fillText(companyName.toUpperCase(), width / 2, y)
    y += isA4 ? 30 : 26

    // Subtitle
    ctx.fillStyle = mutedColor
    ctx.font = `bold ${isA4 ? 14 : 12}px system-ui, -apple-system, sans-serif`
    ctx.letterSpacing = '1px'
    ctx.fillText(labels?.checkpointSubtitle || 'OFFICIAL ATTENDANCE CHECKPOINT', width / 2, y)
    ctx.letterSpacing = '0px'
    y += isA4 ? 30 : 26

    // Branch & Shift line
    ctx.fillStyle = secondaryColor
    ctx.font = `600 ${isA4 ? 18 : 16}px "Kantumruy Pro", system-ui, sans-serif`
    const locPrefix = labels?.locationPrefix || 'Location:'
    const locationText = shiftText ? `${locPrefix} ${branchName}  (${shiftText})` : `${locPrefix} ${branchName}`
    ctx.fillText(locationText, width / 2, y)
    y += isA4 ? 32 : 28

    // Divider Line
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(width / 2 - 160, y)
    ctx.lineTo(width / 2 + 160, y)
    ctx.stroke()
    y += isA4 ? 36 : 30

    // 2. Main Title
    ctx.fillStyle = primaryColor
    ctx.font = `bold ${isA4 ? 44 : 38}px "Kantumruy Pro", system-ui, sans-serif`
    ctx.fillText(titleKh, width / 2, y)
    y += isA4 ? 36 : 32

    ctx.fillStyle = accentColor
    ctx.font = `bold ${isA4 ? 22 : 18}px system-ui, -apple-system, sans-serif`
    ctx.fillText(titleEn, width / 2, y)
    y += isA4 ? 40 : 34

    // 3. QR Code Box (Large & High Contrast)
    // 3. QR Code Box (Large & High Contrast)
    const qrBoxSize = isA4 ? 640 : 540
    const qrBoxX = width / 2 - qrBoxSize / 2
    const qrBoxY = y

    ctx.fillStyle = boxBg
    ctx.strokeStyle = borderColor
    ctx.lineWidth = isInkSaver ? 2.5 : 1.5
    drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 22, true, true)

    const qrInnerSize = isA4 ? 530 : 450
    const qrInnerX = width / 2 - qrInnerSize / 2
    const qrInnerY = qrBoxY + (isA4 ? 36 : 30)

    ctx.fillStyle = '#ffffff'
    drawRoundedRect(ctx, qrInnerX - 12, qrInnerY - 12, qrInnerSize + 24, qrInnerSize + 24, 14, true, false)

    if (qrSourceCanvas) {
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(qrSourceCanvas, qrInnerX, qrInnerY, qrInnerSize, qrInnerSize)
      ctx.imageSmoothingEnabled = true
    }

    // Corner L-Brackets
    drawCornerBrackets(ctx, qrInnerX, qrInnerY, qrInnerSize, isInkSaver ? '#000000' : '#1e293b')

    // Caption under QR
    ctx.fillStyle = isInkSaver ? '#000000' : '#334155'
    ctx.font = `bold ${isA4 ? 18 : 15}px "Kantumruy Pro", system-ui, sans-serif`
    ctx.fillText(labels?.scanInstruction || 'Scan this QR code with Mobile App to record attendance', width / 2, qrInnerY + qrInnerSize + (isA4 ? 36 : 30))

    y += qrBoxSize + (isA4 ? 48 : 36)

    // 4. Verification Details
    ctx.fillStyle = mutedColor
    ctx.font = `600 ${isA4 ? 18 : 15}px "Kantumruy Pro", system-ui, sans-serif`
    const gpsPrefix = labels?.gpsConditionPrefix || 'GPS <'
    const unit = labels?.metersUnit || 'm'
    ctx.fillText(`${gpsPrefix} ${radiusMeters}${unit}   •   Wi-Fi: ${wifiSsid}`, width / 2, y)

    // 5. Bottom System Signature
    ctx.fillStyle = mutedColor
    ctx.font = `${isA4 ? 14 : 12}px system-ui, -apple-system, sans-serif`
    ctx.fillText(`${companyName} • ${labels?.systemSuffix || 'Enterprise Attendance System'}`, width / 2, height - 44)
  }

  return canvas
}

function drawCornerBrackets(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const len = 30
  const thick = 3.5
  ctx.strokeStyle = color
  ctx.lineWidth = thick
  ctx.lineCap = 'square'

  // Top Left
  ctx.beginPath()
  ctx.moveTo(x - 8, y - 8 + len)
  ctx.lineTo(x - 8, y - 8)
  ctx.lineTo(x - 8 + len, y - 8)
  ctx.stroke()

  // Top Right
  ctx.beginPath()
  ctx.moveTo(x + size + 8 - len, y - 8)
  ctx.lineTo(x + size + 8, y - 8)
  ctx.lineTo(x + size + 8, y - 8 + len)
  ctx.stroke()

  // Bottom Left
  ctx.beginPath()
  ctx.moveTo(x - 8, y + size + 8 - len)
  ctx.lineTo(x - 8, y + size + 8)
  ctx.lineTo(x - 8 + len, y + size + 8)
  ctx.stroke()

  // Bottom Right
  ctx.beginPath()
  ctx.moveTo(x + size + 8 - len, y + size + 8)
  ctx.lineTo(x + size + 8, y + size + 8)
  ctx.lineTo(x + size + 8, y + size + 8 - len)
  ctx.stroke()
}

function drawStepNumberBadge(ctx: CanvasRenderingContext2D, x: number, y: number, num: string, isInkSaver: boolean) {
  ctx.save()
  ctx.fillStyle = isInkSaver ? '#000000' : '#0f172a'
  ctx.beginPath()
  ctx.arc(x, y - 4, 11, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 11px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(num, x, y - 3.5)
  ctx.restore()
}

export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 'image/png')
}
