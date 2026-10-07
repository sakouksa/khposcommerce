import React, { useMemo, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  X,
  Sparkles,
  ShoppingCart,
  Zap,
  ArrowRight,
  Trash2,
  Cpu,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type VoiceLanguageCode, type VoiceLanguageOption } from '../hooks/useVoiceSearch'
import {
  matchProductsWithAI,
  analyzeVoiceSpeech,
  type AIMatchResult,
  type AISpeechAnalysis,
} from '../utils/aiProductMatcher'
import type { Product } from '../types/pos.types'
import { sound } from '../../../utils/sound'

interface POSVoiceSearchPopoverProps {
  isOpen: boolean
  onClose: () => void
  isListening: boolean
  transcript: string
  interimTranscript: string
  detectedLangInfo: { langCode: VoiceLanguageCode; langName: string; flag: string }
  statusMessage: string
  hasError: boolean
  products: Product[]
  currentSearchValue?: string
  selectedLang?: VoiceLanguageCode
  availableLanguages?: VoiceLanguageOption[]
  onSelectLanguage?: (lang: VoiceLanguageCode) => void
  onToggleListening: () => void
  onStartListening: () => void
  onClearSearch: () => void
  onSelectQuery: (query: string) => void
  onAddToCart: (product: Product) => void
}

export const POSVoiceSearchPopover: React.FC<POSVoiceSearchPopoverProps> = ({
  isOpen,
  onClose,
  isListening,
  transcript,
  interimTranscript,
  detectedLangInfo,
  statusMessage,
  hasError,
  products,
  currentSearchValue = '',
  selectedLang = 'auto',
  availableLanguages = [],
  onSelectLanguage,
  onToggleListening,
  onStartListening,
  onClearSearch,
  onSelectQuery,
  onAddToCart,
}) => {
  const { t } = useTranslation('pos')
  const popoverRef = useRef<HTMLDivElement>(null)

  const activeSpokenText = (transcript || interimTranscript || currentSearchValue).trim()

  // Deep AI Speech Analysis
  const aiAnalysis: AISpeechAnalysis | null = useMemo(() => {
    if (!activeSpokenText) return null
    return analyzeVoiceSpeech(activeSpokenText, products)
  }, [activeSpokenText, products])

  // Real Quick Suggestions generated dynamically from real products in catalog
  const dynamicQuickPrompts = useMemo(() => {
    if (!products || products.length === 0) {
      return [
        { label: 'Apple Smartphone', query: 'Apple' },
        { label: 'Xiaomi Laptop', query: 'Laptop' },
        { label: 'Dell Camera', query: 'Dell Camera' },
        { label: 'JBL Monitor', query: 'JBL' },
        { label: 'Sony Watch', query: 'Sony' },
        { label: 'Keyboard', query: 'Keyboard' },
      ]
    }

    const brandNames = Array.from(new Set(products.map(p => p.brand?.name).filter(Boolean))).slice(0, 3)
    const catNames = Array.from(new Set(products.map(p => p.category?.name).filter(Boolean))).slice(0, 4)
    const topItems = products.slice(0, 3).map(p => ({ label: p.name, query: p.name }))

    const suggestions: { label: string; query: string }[] = []
    brandNames.forEach(b => {
      suggestions.push({ label: b as string, query: b as string })
    })
    catNames.forEach(c => {
      suggestions.push({ label: c as string, query: c as string })
    })
    topItems.forEach(item => {
      if (!suggestions.some(s => s.query === item.query)) {
        suggestions.push(item)
      }
    })

    return suggestions.slice(0, 8)
  }, [products])

  // Real-time AI Fuzzy & Semantic Product Matching
  const aiMatches: AIMatchResult[] = useMemo(() => {
    if (!activeSpokenText) return []
    const queryToSearch = aiAnalysis?.resolvedKeyword || activeSpokenText
    return matchProductsWithAI(queryToSearch, products, 0.25)
  }, [activeSpokenText, aiAnalysis, products])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const displayLangFlag = aiAnalysis?.detectedLanguage?.flag || detectedLangInfo.flag
  const displayLangName = aiAnalysis?.detectedLanguage?.nativeName || detectedLangInfo.langName

  return (
    <AnimatePresence>
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, y: -6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, scale: 0.98 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        className="absolute top-full left-0 right-0 mt-2 z-40 bg-card/98 backdrop-blur-2xl rounded-3xl border border-primary/30 shadow-2xl shadow-primary/10 overflow-hidden flex flex-col"
      >
        {/* Sleek Header Bar with 5 Languages Indicator */}
        <div className="px-4 py-2.5 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <Sparkles size={13} />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-foreground">
                {t('aiVoiceSearchTitle', 'AI Real-Time Voice Search')}
              </span>
              {availableLanguages.length > 0 && onSelectLanguage && (
                <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-lg border border-border/40">
                  {availableLanguages.map((lang) => {
                    const isSelected = selectedLang === lang.code
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          sound.playClick()
                          onSelectLanguage(lang.code)
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer flex items-center gap-0.5 ${
                          isSelected
                            ? 'bg-primary text-primary-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground hover:bg-card/70'
                        }`}
                        title={lang.name}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.shortLabel}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activeSpokenText && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick()
                  onClearSearch()
                }}
                className="text-[10px] font-semibold text-muted-foreground hover:text-destructive flex items-center gap-1 px-2 py-0.5 rounded-lg bg-muted/60 hover:bg-destructive/10 transition-colors cursor-pointer"
              >
                <Trash2 size={11} />
                <span>{t('clear', 'Clear')}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer & Direct Interactive Mic Strip */}
        <div
          onClick={() => {
            if (!isListening) {
              onStartListening()
            } else {
              onToggleListening()
            }
          }}
          className={`p-3.5 flex items-center gap-3.5 transition-all cursor-pointer select-none border-b border-border/50 ${
            isListening ? 'bg-primary/5 hover:bg-primary/10' : 'bg-muted/15 hover:bg-muted/30'
          }`}
        >
          {/* Animated Pulsing Mic */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all shrink-0 ${
              isListening
                ? 'bg-red-500 text-white shadow-red-500/30 ring-4 ring-red-500/20 animate-pulse'
                : 'bg-primary text-primary-foreground shadow-primary/20'
            }`}
          >
            {isListening ? <MicOff size={19} /> : <Mic size={19} />}
          </div>

          {/* Real-time Dynamic Equalizer & Transcript Display */}
          <div className="flex-1 min-w-0">
            {isListening ? (
              <div className="flex items-center gap-1 h-4 mb-1">
                {[0.4, 0.9, 1.4, 0.6, 1.7, 0.8, 1.3, 0.7, 1.2, 0.5, 1.0, 0.6].map((factor, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scaleY: [0.2 * factor, 1.2 * factor, 0.2 * factor],
                    }}
                    transition={{
                      duration: 0.4 + (i % 4) * 0.12,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-1 bg-gradient-to-t from-primary to-purple-500 rounded-full origin-center"
                    style={{ height: '16px' }}
                  />
                ))}
                <span className="text-[11px] font-bold text-primary ml-2 animate-pulse">
                  {t('aiListening', 'AI is listening & analyzing speech (5 Languages)...')}
                </span>
              </div>
            ) : (
              <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {activeSpokenText ? t('readyToListen', 'Click here to speak again') : t('tapMicToSpeak', 'Tap to start speaking (Khmer, English, Chinese, Thai, Vietnamese)')}
              </div>
            )}

            {/* Live Spoken Text & AI Breakdown */}
            <p className="text-xs font-bold text-foreground truncate mt-0.5">
              {activeSpokenText ? (
                <span className="text-primary font-mono font-extrabold">"{activeSpokenText}"</span>
              ) : (
                <span className="text-muted-foreground font-normal text-[11px]">
                  {statusMessage || t('speakFreelyPrompt', 'Speak product name (e.g. "Apple Keyboard 75" or "Dell Camera 97")')}
                </span>
              )}
            </p>

            {/* AI Real-time Neural Analysis Pill */}
            {aiAnalysis && activeSpokenText && (
              <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground font-medium flex-wrap">
                <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-bold flex items-center gap-0.5">
                  <Cpu size={10} />
                  {t('aiAnalysisEngine', 'AI Analyzed:')}
                </span>
                {aiAnalysis.extractedBrand && (
                  <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                    {t('brandLabel', 'Brand:')} {aiAnalysis.extractedBrand}
                  </span>
                )}
                {aiAnalysis.extractedCategory && (
                  <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold">
                    {t('typeLabel', 'Type:')} {aiAnalysis.extractedCategory}
                  </span>
                )}
                {aiAnalysis.extractedDigits && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                    {t('modelLabel', 'Model:')} {aiAnalysis.extractedDigits}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Real-time AI Matched Products Preview List */}
        {aiMatches.length > 0 && (
          <div className="p-3 bg-card border-b border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <Sparkles size={13} className="text-primary" />
                {t('aiFuzzyMatches', 'AI Matched Products')}:
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {aiMatches.length} {t('itemsFound', 'found')}
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
              {aiMatches.slice(0, 4).map(({ product, score, matchedReason }) => {
                const matchPercent = Math.round(score * 100)
                return (
                  <div
                    key={product.id}
                    onClick={() => {
                      sound.playClick()
                      onSelectQuery(product.name)
                      onClose()
                    }}
                    className="p-2 rounded-xl bg-muted/30 hover:bg-muted/70 border border-border/70 hover:border-primary/40 flex items-center justify-between gap-2.5 transition-all cursor-pointer"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground truncate">
                          {product.name}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                          matchPercent >= 85
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            : 'bg-primary/15 text-primary'
                        }`}>
                          {matchPercent}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                        <span>SKU: {product.sku}</span>
                        <span>•</span>
                        <span className="font-bold text-foreground">${Number(product.selling_price || 0).toFixed(2)}</span>
                        <span>•</span>
                        <span className="text-primary/80 truncate max-w-[120px]">{matchedReason}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          sound.playSuccess()
                          onAddToCart(product)
                          onClose()
                        }}
                        className="btn-primary text-[11px] py-1 px-2.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart size={12} />
                        {t('add', 'Add')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          sound.playClick()
                          onSelectQuery(product.name)
                          onClose()
                        }}
                        className="p-1.5 rounded-lg bg-muted hover:bg-card text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Filter POS"
                      >
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Quick Voice Suggestions Chips */}
        <div className="p-2.5 bg-muted/20 flex flex-wrap items-center gap-1">
          <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 mr-1">
            <Zap size={11} className="text-amber-500" />
            {t('quickVoiceQueries', 'Quick Voice Suggestions')}:
          </span>
          {dynamicQuickPrompts.map((q) => (
            <button
              key={q.query}
              type="button"
              onClick={() => {
                sound.playSuccess()
                onSelectQuery(q.query)
                onClose()
              }}
              className="px-2 py-0.8 rounded-lg bg-card hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/60 text-[10px] font-medium transition-all text-foreground/90 cursor-pointer"
            >
              {q.label}
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
