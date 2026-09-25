/**
 * Enterprise Geofencing & Multi-Factor Attendance Security Engine
 * Zero Hardware Cost validation helper: GPS Geofencing, Wi-Fi signature & Device Binding
 */

export interface BranchLocation {
  latitude: number
  longitude: number
  name: string
  radius_meters: number
  allowed_wifi_ssid?: string
  allowed_wifi_bssid?: string
  allowed_public_ip?: string
}

export interface AttendanceSecurityCheckInput {
  userLatitude: number
  userLongitude: number
  branch: BranchLocation
  currentWifiSsid?: string
  currentPublicIp?: string
  deviceId?: string
  boundDeviceId?: string
}

export interface AttendanceSecurityCheckResult {
  isValid: boolean
  distanceMeters: number
  isWithinRadius: boolean
  isWifiValid: boolean
  isDeviceValid: boolean
  failureReasons: string[]
}

/**
 * Calculates distance in meters between two GPS coordinates using the Haversine formula
 */
export function calculateGpsDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Earth's radius in meters
  const rad = Math.PI / 180
  const dLat = (lat2 - lat1) * rad
  const dLon = (lon2 - lon1) * rad

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

/**
 * Comprehensive Multi-Factor Attendance Security Verifier
 */
export function verifyAttendanceSecurity(
  input: AttendanceSecurityCheckInput
): AttendanceSecurityCheckResult {
  const {
    userLatitude,
    userLongitude,
    branch,
    currentWifiSsid,
    currentPublicIp,
    deviceId,
    boundDeviceId,
  } = input

  const distanceMeters = calculateGpsDistanceMeters(
    userLatitude,
    userLongitude,
    branch.latitude,
    branch.longitude
  )

  const isWithinRadius = distanceMeters <= branch.radius_meters

  // Wi-Fi validation (Optional check if configured)
  const isWifiValid =
    !branch.allowed_wifi_ssid ||
    (!!currentWifiSsid &&
      currentWifiSsid.toLowerCase() === branch.allowed_wifi_ssid.toLowerCase()) ||
    (!branch.allowed_public_ip || currentPublicIp === branch.allowed_public_ip)

  // Device ID Binding validation
  const isDeviceValid =
    !boundDeviceId || !deviceId || deviceId === boundDeviceId

  const failureReasons: string[] = []

  if (!isWithinRadius) {
    failureReasons.push(
      `ក្រៅបរិវេណក្រុមហ៊ុន (ចម្ងាយ ${distanceMeters}m លើសពីកម្រិតអនុញ្ញាត ${branch.radius_meters}m)`
    )
  }

  if (!isWifiValid && branch.allowed_wifi_ssid) {
    failureReasons.push(
      `មិនបានភ្ជាប់ Wi-Fi ក្រុមហ៊ុន (តម្រូវ Wi-Fi: "${branch.allowed_wifi_ssid}")`
    )
  }

  if (!isDeviceValid && boundDeviceId) {
    failureReasons.push(
      `ឧបករណ៍ទូរស័ព្ទមិនត្រូវគ្នាជាមួយគណនី (Device ID មិនត្រឹមត្រូវ)`
    )
  }

  const isValid = isWithinRadius && isWifiValid && isDeviceValid

  return {
    isValid,
    distanceMeters,
    isWithinRadius,
    isWifiValid,
    isDeviceValid,
    failureReasons,
  }
}
