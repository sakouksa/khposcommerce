import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { sound } from '../../../utils/sound'

export type VoiceLanguageCode = 'auto' | 'km-KH' | 'en-US'

export interface VoiceLanguageOption {
  code: VoiceLanguageCode
  name: string
  nativeName: string
  flag: string
  shortLabel: string
}

export const VOICE_LANGUAGES: VoiceLanguageOption[] = [
  { code: 'auto', name: 'AI Auto-Detect', nativeName: '✨ AI Auto', flag: '⚡', shortLabel: 'AI' },
  { code: 'km-KH', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭', shortLabel: 'KM' },
  { code: 'en-US', name: 'English', nativeName: 'English (US)', flag: '🇺🇸', shortLabel: 'EN' },
]

// Automatic Language Detector from spoken characters
export function detectLanguageFromText(text: string): { langCode: VoiceLanguageCode; langName: string; flag: string } {
  if (!text || !text.trim()) {
    return { langCode: 'auto', langName: 'AI Multi-Language', flag: '⚡' }
  }

  // Khmer Unicode Range: 1780-17FF
  if (/[\u1780-\u17FF]/.test(text)) {
    return { langCode: 'km-KH', langName: 'ភាសាខ្មែរ (Khmer)', flag: '🇰🇭' }
  }

  return { langCode: 'en-US', langName: 'English', flag: '🇺🇸' }
}

interface UseVoiceSearchOptions {
  onResult?: (transcript: string) => void
  onInterim?: (interim: string) => void
  onError?: (errorMessage: string) => void
  initialLang?: VoiceLanguageCode
}

export function useVoiceSearch(options: UseVoiceSearchOptions = {}) {
  const { onResult, onInterim, onError, initialLang = 'auto' } = options
  const { i18n } = useTranslation()

  const [selectedLang, setSelectedLang] = useState<VoiceLanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pos_voice_language') as VoiceLanguageCode
      if (saved && VOICE_LANGUAGES.some(l => l.code === saved)) {
        return saved
      }
    }
    return initialLang
  })

  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [detectedLangInfo, setDetectedLangInfo] = useState({ langCode: 'auto' as VoiceLanguageCode, langName: 'AI Auto-Detect', flag: '⚡' })
  const [isSupported, setIsSupported] = useState(true)
  const [statusMessage, setStatusMessage] = useState<string>('')
  const [hasError, setHasError] = useState(false)

  const recognitionRef = useRef<any>(null)
  const isManuallyStoppedRef = useRef(false)
  const onResultRef = useRef(onResult)
  const onInterimRef = useRef(onInterim)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onResultRef.current = onResult
    onInterimRef.current = onInterim
    onErrorRef.current = onError
  }, [onResult, onInterim, onError])

  const setLanguage = useCallback((newLang: VoiceLanguageCode) => {
    setSelectedLang(newLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('pos_voice_language', newLang)
    }
  }, [])

  const resolveRecognitionLanguage = useCallback((target: VoiceLanguageCode): string => {
    if (target !== 'auto') {
      return target
    }

    const appLocale = (i18n.language || 'en').toLowerCase()
    if (appLocale.startsWith('km')) return 'km-KH'
    if (appLocale.startsWith('zh')) return 'zh-CN'
    if (appLocale.startsWith('th')) return 'th-TH'
    if (appLocale.startsWith('vi')) return 'vi-VN'
    if (appLocale.startsWith('en')) return 'en-US'

    return 'en-US' 
  }, [i18n.language])

  const getRecognition = useCallback((requestedLang?: VoiceLanguageCode) => {
    const win = typeof window !== 'undefined' ? (window as any) : null
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition

    if (!SpeechRecognitionClass) {
      setIsSupported(false)
      return null
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // ignore
      }
    }

    const recognition = new SpeechRecognitionClass()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 3

    const targetLang = requestedLang || selectedLang
    recognition.lang = resolveRecognitionLanguage(targetLang)

    recognition.onstart = () => {
      setIsListening(true)
      setIsProcessing(false)
      setHasError(false)
      setStatusMessage('')
    }

    recognition.onresult = (event: any) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i]
        if (item && item[0]) {
          if (item.isFinal) {
            final += item[0].transcript
          } else {
            interim += item[0].transcript
          }
        }
      }

      const activeText = (final || interim).trim()
      if (activeText) {
        const detected = detectLanguageFromText(activeText)
        setDetectedLangInfo(detected)
      }

      if (interim) {
        setInterimTranscript(interim)
        onInterimRef.current?.(interim.trim())
      }

      if (final) {
        const cleaned = final.trim()
        setTranscript(cleaned)
        setInterimTranscript('')
        setIsProcessing(true)
        sound.playSuccess()
        setStatusMessage('')
        onResultRef.current?.(cleaned)
      }
    }

    recognition.onerror = (event: any) => {
      if (isManuallyStoppedRef.current) return

      const err = event.error
      setIsListening(false)
      setIsProcessing(false)

      if (err === 'no-speech') {
        setStatusMessage('')
        return
      }

      if (err === 'aborted') {
        return
      }

      setHasError(true)
      let userFriendlyMsg = 'Voice search service is currently unavailable'

      if (err === 'not-allowed' || err === 'service-not-allowed') {
        userFriendlyMsg = 'Please grant microphone access in your browser to use voice search'
      } else if (err === 'network') {
        userFriendlyMsg = 'Network connection issue. Searching POS inventory locally instead...'
      } else if (err === 'language-not-supported') {
        userFriendlyMsg = 'AI is switching to Multi-Language Speech Engine...'
      }

      setStatusMessage(userFriendlyMsg)
      onErrorRef.current?.(userFriendlyMsg)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    return recognition
  }, [selectedLang, resolveRecognitionLanguage])

  const startListening = useCallback((overrideLang?: VoiceLanguageCode) => {
    isManuallyStoppedRef.current = false
    const rec = getRecognition(overrideLang)
    if (!rec) {
      setIsSupported(false)
      setStatusMessage('Voice recognition is not supported on this device. You can use Text Search instead.')
      return
    }

    try {
      setTranscript('')
      setInterimTranscript('')
      setHasError(false)
      setIsProcessing(false)
      rec.start()
      sound.playClick()
    } catch {
      try {
        rec.abort()
        setTimeout(() => {
          try {
            rec.start()
          } catch {
            // ignore
          }
        }, 150)
      } catch {
        // ignore
      }
    }
  }, [getRecognition])

  const stopListening = useCallback(() => {
    isManuallyStoppedRef.current = true
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }
    }
    sound.playClick()
    setIsListening(false)
    setIsProcessing(false)
  }, [])

  const toggleListening = useCallback((overrideLang?: VoiceLanguageCode) => {
    if (isListening) {
      stopListening()
    } else {
      startListening(overrideLang)
    }
  }, [isListening, startListening, stopListening])

  const resetVoiceSearch = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setHasError(false)
    setIsProcessing(false)
    setStatusMessage('')
    setDetectedLangInfo({ langCode: 'auto', langName: 'AI Auto-Detect', flag: '⚡' })
  }, [])

  return {
    isListening,
    isProcessing,
    transcript,
    interimTranscript,
    detectedLangInfo,
    isSupported,
    statusMessage,
    hasError,
    selectedLang,
    setLanguage,
    startListening,
    stopListening,
    toggleListening,
    resetVoiceSearch,
    availableLanguages: VOICE_LANGUAGES,
  }
}
