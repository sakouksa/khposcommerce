import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  RefreshCw,
  Check,
  AlertTriangle,
  ShoppingCart,
  Zap,
  Tag,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type VoiceLanguageCode } from '../hooks/useVoiceSearch'
import { matchProductsWithAI, type AIMatchResult } from '../utils/aiProductMatcher'
import type { Product } from '../types/pos.types'
import { sound } from '../../../utils/sound'

interface POSVoiceSearchModalProps {
  isOpen: boolean
  onClose: () => void
  isListening: boolean
  transcript: string
  interimTranscript: string
  detectedLangInfo: { langCode: VoiceLanguageCode; langName: string; flag: string }
  statusMessage: string
  hasError: boolean
  products: Product[]
  onToggleListening: () => void
  onSelectQuery: (query: string) => void
  onAddToCart: (product: Product) => void
}

const QUICK_AI_PROMPTS = [
  { label: 'Apple iPhone', query: 'Apple Smartphone' },
  { label: 'Dell Laptop', query: 'Xiaomi Laptop' },
  { label: 'Digital Camera', query: 'Dell Camera' },
  { label: 'JBL Monitor', query: 'JBL Monitor' },
  { label: 'Sony Smartwatch', query: 'Sony Smartwatch' },
  { label: 'Gaming Keyboard', query: 'Xiaomi Keyboard' },
  { label: 'Fast Charger', query: 'Samsung Charger' },
  { label: 'Wireless Audio', query: 'Xiaomi Audio' },
]

export const POSVoiceSearchModal: React.FC<POSVoiceSearchModalProps> = ({
  isOpen,
  onClose,
  isListening,
  transcript,
  interimTranscript,
  detectedLangInfo,
  statusMessage,
  hasError,
  products,
  onToggleListening,
  onSelectQuery,
  onAddToCart,
}) => {
  const { t } = useTranslation('pos')

  const activeSpokenText = (transcript || interimTranscript).trim()

  // Real-time AI Fuzzy & Semantic Product Matching
  const aiMatches: AIMatchResult[] = useMemo(() => {
    if (!activeSpokenText) return []
    return matchProductsWithAI(activeSpokenText, products, 0.3)
  }, [activeSpokenText, products])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl rounded-3xl border border-border/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-gradient-to-r from-primary/10 via-purple-500/10 to-transparent">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span>{t('aiVoiceSearchTitle', 'AI Real-Time Voice Search')}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded-full">
                    <Zap size={11} className="fill-primary" />
                    AI Auto-Detect
                  </span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('aiVoiceSubtitle', 'Speak freely in any language — AI analyzes & matches products instantly')}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* AI Auto-Language Detection Indicator */}
          <div className="px-4 py-2 bg-muted/20 border-b border-border/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('aiAnalysisEngine', 'AI Neural Engine:')}</span>
              <span className="font-bold text-foreground">
                {detectedLangInfo.flag} {detectedLangInfo.langName}
              </span>
            </div>

            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {t('fuzzyMatchActive', 'Fuzzy & Semantic Active')}
            </span>
          </div>

          {/* Main Visualizer & Live Mic Area */}
          <div className="p-5 flex flex-col items-center justify-center text-center overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Pulsing Mic Circle Button */}
            <div className="relative my-2">
              {isListening && (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -inset-3 rounded-full bg-primary/20 border border-primary/40 pointer-events-none"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                    className="absolute -inset-6 rounded-full bg-purple-500/20 border border-purple-500/30 pointer-events-none"
                  />
                </>
              )}

              <button
                type="button"
                onClick={onToggleListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white shadow-red-500/40 ring-4 ring-red-500/20'
                    : 'bg-primary text-primary-foreground shadow-primary/30 hover:scale-105'
                }`}
                title={isListening ? t('stopListening', 'Click to stop') : t('startListening', 'Click to speak')}
              >
                {isListening ? (
                  <MicOff size={32} className="animate-pulse" />
                ) : (
                  <Mic size={32} />
                )}
              </button>
            </div>

            {/* Live Audio Equalizer Waveform */}
            {isListening ? (
              <div className="flex items-center justify-center gap-1.5 h-8 my-2">
                {[0.4, 0.8, 1.3, 0.6, 1.6, 0.9, 1.4, 0.7, 1.2, 0.5].map((factor, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scaleY: [0.2 * factor, 1.2 * factor, 0.25 * factor],
                    }}
                    transition={{
                      duration: 0.5 + (i % 3) * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="w-1.5 bg-gradient-to-t from-primary to-purple-500 rounded-full origin-center"
                    style={{ height: '26px' }}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium my-2">
                <Volume2 size={15} className="text-primary" />
                <span>{t('speakFreelyPrompt', 'Speak product name clearly in Khmer or English (e.g. "Apple iPhone" or "Dell Laptop")')}</span>
              </div>
            )}

            {/* Status Message */}
            <p className={`text-xs font-semibold px-4 mb-2 max-w-sm transition-colors ${
              hasError ? 'text-amber-500 flex items-center justify-center gap-1.5' : isListening ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {hasError && <AlertTriangle size={14} className="shrink-0" />}
              {statusMessage || (isListening ? t('aiListening', '⚡ AI is listening & analyzing speech...') : t('readyToListen', 'Ready to listen'))}
            </p>

            {/* Live Spoken Text Display */}
            {activeSpokenText && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-3 rounded-2xl bg-muted/40 border border-border/80 text-foreground font-semibold text-sm mb-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-primary text-xs uppercase font-bold tracking-wider">AI Heard:</span>
                  <span className="truncate">"{activeSpokenText}"</span>
                </div>
                {transcript && <Check size={16} className="text-emerald-500 shrink-0 ml-2" />}
              </motion.div>
            )}

            {/* AI Real-time Matched Products Results */}
            {aiMatches.length > 0 && (
              <div className="w-full text-left my-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary" />
                    {t('aiFuzzyMatches', 'AI Matched Products')}:
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {aiMatches.length} {t('itemsFound', 'found')}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                  {aiMatches.slice(0, 3).map(({ product, score, matchedReason }) => {
                    const matchPercent = Math.round(score * 100)
                    return (
                      <div
                        key={product.id}
                        className="p-2.5 rounded-2xl bg-card border border-border/90 hover:border-primary/50 shadow-xs flex items-center justify-between gap-3 transition-all"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground truncate">
                              {product.name}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              matchPercent >= 85
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-primary/15 text-primary'
                            }`}>
                              {matchPercent}% Match
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span>SKU: {product.sku}</span>
                            <span>•</span>
                            <span className="font-bold text-foreground">${Number(product.selling_price || 0).toFixed(2)}</span>
                            <span>•</span>
                            <span className="text-[10px] text-primary/80 truncate max-w-[130px]">{matchedReason}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              sound.playSuccess()
                              onAddToCart(product)
                              onClose()
                            }}
                            className="btn-primary text-xs py-1.5 px-2.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <ShoppingCart size={13} />
                            {t('add', 'Add')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              sound.playClick()
                              onSelectQuery(product.name)
                              onClose()
                            }}
                            className="p-1.5 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Filter POS"
                          >
                            <Tag size={13} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Quick Multi-lingual AI Search Prompts */}
            <div className="w-full mt-3 pt-3 border-t border-border/60 text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-500" />
                  {t('quickVoiceQueries', 'Quick AI Voice Samples')}:
                </span>
                {hasError && (
                  <button
                    type="button"
                    onClick={onToggleListening}
                    className="text-[10px] text-primary font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <RefreshCw size={11} /> {t('retry', 'Retry')}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_AI_PROMPTS.map((q) => (
                  <button
                    key={q.query}
                    type="button"
                    onClick={() => {
                      sound.playSuccess()
                      onSelectQuery(q.query)
                      onClose()
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30 border border-border/60 text-[11px] font-medium transition-all text-foreground/90 text-left truncate cursor-pointer"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
