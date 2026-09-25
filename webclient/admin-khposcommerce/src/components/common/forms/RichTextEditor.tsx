import React, { useState, useRef, useEffect } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Sparkles,
  HelpCircle,
  Check,
  AlertCircle,
  Info,
  Minus,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface RichTextEditorProps {
  value: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
  articleTitle?: string
  featuredImage?: string
  authorName?: string
  publishDate?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Write full article body text...',
  minHeight = '320px',
  className = '',
  articleTitle,
  featuredImage,
  authorName = 'Admin Editorial',
  publishDate,
}) => {
  const { t } = useTranslation(['cms', 'common'])
  const [activeTab, setActiveTab] = useState<'visual' | 'code' | 'preview'>('visual')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)

  // Synchronize content to contentEditable when value changes or when switching to visual mode
  useEffect(() => {
    if (editorRef.current && activeTab === 'visual') {
      const isFocused = document.activeElement === editorRef.current
      if (!isFocused && editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value, activeTab])

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML
      onChange(html === '<p><br></p>' || html === '<br>' ? '' : html)
    }
  }

  // Execute standard formatting command
  const execCmd = (command: string, arg?: string) => {
    if (activeTab !== 'visual') setActiveTab('visual')
    document.execCommand(command, false, arg)
    handleInput()
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  // Format block elements (h1, h2, h3, blockquote, p)
  const formatBlock = (tag: string) => {
    execCmd('formatBlock', `<${tag}>`)
  }

  // Insert custom HTML snippet
  const insertHTML = (html: string) => {
    if (activeTab !== 'visual') {
      onChange(value + html)
      return
    }
    execCmd('insertHTML', html)
  }

  // Insert Link
  const handleInsertLink = () => {
    if (!linkUrl.trim()) return
    const textToUse = linkText.trim() || linkUrl.trim()
    const linkHTML = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-primary underline font-medium hover:text-primary/80">${textToUse}</a> `
    insertHTML(linkHTML)
    setLinkUrl('')
    setLinkText('')
    setShowLinkModal(false)
  }

  // Insert Image
  const handleInsertImage = () => {
    if (!imageUrl.trim()) return
    const imgHTML = `<figure class="my-4"><img src="${imageUrl}" alt="${imageAlt || 'Article image'}" class="rounded-xl max-w-full h-auto border border-border shadow-sm mx-auto" />${imageAlt ? `<figcaption class="text-center text-xs text-muted-foreground mt-1.5">${imageAlt}</figcaption>` : ''}</figure><p><br></p>`
    insertHTML(imgHTML)
    setImageUrl('')
    setImageAlt('')
    setShowImageModal(false)
  }

  // Insert Alert Callout
  const insertCallout = (type: 'info' | 'tip' | 'warning') => {
    let calloutHTML = ''
    if (type === 'info') {
      calloutHTML = `<div class="p-4 my-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-900 dark:text-blue-200 text-sm"><strong class="font-bold flex items-center gap-1.5 mb-1">📌 Info Note</strong><p>Important update or explanation details go here.</p></div><p><br></p>`
    } else if (type === 'tip') {
      calloutHTML = `<div class="p-4 my-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-sm"><strong class="font-bold flex items-center gap-1.5 mb-1">💡 Pro Tip</strong><p>Helpful advice or best practice recommendation.</p></div><p><br></p>`
    } else {
      calloutHTML = `<div class="p-4 my-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-sm"><strong class="font-bold flex items-center gap-1.5 mb-1">⚠️ Notice</strong><p>Crucial cautionary note or policy requirement.</p></div><p><br></p>`
    }
    insertHTML(calloutHTML)
  }

  // Insert Table
  const insertTable = () => {
    const tableHTML = `
      <table class="w-full my-4 border-collapse border border-border rounded-lg overflow-hidden text-sm">
        <thead>
          <tr class="bg-muted/60">
            <th class="border border-border p-2.5 text-left font-bold">Header 1</th>
            <th class="border border-border p-2.5 text-left font-bold">Header 2</th>
            <th class="border border-border p-2.5 text-left font-bold">Header 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-border p-2.5">Sample data A</td>
            <td class="border border-border p-2.5">Sample data B</td>
            <td class="border border-border p-2.5">Sample data C</td>
          </tr>
          <tr>
            <td class="border border-border p-2.5">Sample data D</td>
            <td class="border border-border p-2.5">Sample data E</td>
            <td class="border border-border p-2.5">Sample data F</td>
          </tr>
        </tbody>
      </table>
      <p><br></p>
    `
    insertHTML(tableHTML)
  }

  // Word and reading stats
  const textOnly = value ? value.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim() : ''
  const wordCount = textOnly ? textOnly.split(' ').filter(Boolean).length : 0
  const charCount = textOnly.length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const toolBtnCls =
    'p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer flex items-center justify-center shrink-0 text-xs font-semibold'

  return (
    <div
      className={`rounded-2xl border border-border/80 dark:border-slate-800 bg-card dark:bg-slate-900 shadow-xs overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl bg-card' : ''
      } ${className}`}
    >
      {/* ─── Top View Mode Tabs & Stats ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-border/80 dark:border-slate-800 bg-muted/30 dark:bg-slate-900/60">
        <div className="flex items-center gap-1 p-1 bg-muted/60 dark:bg-slate-800/80 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'visual'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{t('cms.tabVisual', 'Visual WYSIWYG')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'code'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{t('cms.tabHtml', 'HTML Source')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-card text-foreground shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{t('cms.tabPreview', 'Website Live Preview')}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px]">
            <span>{wordCount} {t('cms.words', 'words')}</span>
            <span>•</span>
            <span>{charCount} {t('cms.chars', 'chars')}</span>
            <span>•</span>
            <span className="text-primary font-semibold">~{readingTime} {t('cms.minRead', 'min read')}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* ─── Interactive WYSIWYG Toolbar (Visual Mode) ─── */}
      {activeTab === 'visual' && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/80 dark:border-slate-800 bg-card dark:bg-slate-900">
          {/* History */}
          <div className="flex items-center gap-0.5 pr-1.5 border-r border-border/70">
            <button
              type="button"
              onClick={() => execCmd('undo')}
              className={toolBtnCls}
              title="Undo (Ctrl+Z)"
            >
              <Undo size={14} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('redo')}
              className={toolBtnCls}
              title="Redo (Ctrl+Y)"
            >
              <Redo size={14} />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-border/70">
            <button
              type="button"
              onClick={() => formatBlock('p')}
              className={`${toolBtnCls} font-mono px-2`}
              title="Paragraph"
            >
              P
            </button>
            <button
              type="button"
              onClick={() => formatBlock('h1')}
              className={toolBtnCls}
              title="Heading 1"
            >
              <Heading1 size={15} />
            </button>
            <button
              type="button"
              onClick={() => formatBlock('h2')}
              className={toolBtnCls}
              title="Heading 2"
            >
              <Heading2 size={15} />
            </button>
            <button
              type="button"
              onClick={() => formatBlock('h3')}
              className={toolBtnCls}
              title="Heading 3"
            >
              <Heading3 size={15} />
            </button>
          </div>

          {/* Inline Styles */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-border/70">
            <button
              type="button"
              onClick={() => execCmd('bold')}
              className={toolBtnCls}
              title="Bold (Ctrl+B)"
            >
              <Bold size={14} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              className={toolBtnCls}
              title="Italic (Ctrl+I)"
            >
              <Italic size={14} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              className={toolBtnCls}
              title="Underline (Ctrl+U)"
            >
              <Underline size={14} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('strikeThrough')}
              className={toolBtnCls}
              title="Strikethrough"
            >
              <Strikethrough size={14} />
            </button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-border/70">
            <button
              type="button"
              onClick={() => execCmd('justifyLeft')}
              className={toolBtnCls}
              title="Align Left"
            >
              <AlignLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyCenter')}
              className={toolBtnCls}
              title="Align Center"
            >
              <AlignCenter size={14} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyRight')}
              className={toolBtnCls}
              title="Align Right"
            >
              <AlignRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyFull')}
              className={toolBtnCls}
              title="Justify"
            >
              <AlignJustify size={14} />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-0.5 px-1.5 border-r border-border/70">
            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              className={toolBtnCls}
              title="Bullet List"
            >
              <List size={14} />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              className={toolBtnCls}
              title="Numbered List"
            >
              <ListOrdered size={14} />
            </button>
            <button
              type="button"
              onClick={() => formatBlock('blockquote')}
              className={toolBtnCls}
              title="Quote Block"
            >
              <Quote size={14} />
            </button>
            <button
              type="button"
              onClick={() => formatBlock('pre')}
              className={toolBtnCls}
              title="Code Block"
            >
              <Code size={14} />
            </button>
          </div>

          {/* Insert Media & Elements */}
          <div className="flex items-center gap-1 pl-1.5">
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              className={toolBtnCls}
              title="Insert Link"
            >
              <LinkIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              className={toolBtnCls}
              title="Insert Image"
            >
              <ImageIcon size={14} />
            </button>
            <button
              type="button"
              onClick={insertTable}
              className={toolBtnCls}
              title="Insert Table"
            >
              <TableIcon size={14} />
            </button>
            <button
              type="button"
              onClick={() => insertHTML('<hr class="my-6 border-t border-border" /><p><br></p>')}
              className={toolBtnCls}
              title="Divider Line"
            >
              <Minus size={14} />
            </button>

            {/* Quick Callout Dropdown */}
            <div className="flex items-center gap-1 ml-1 pl-1.5 border-l border-border/70">
              <button
                type="button"
                onClick={() => insertCallout('info')}
                className="px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800 rounded text-[11px] font-medium cursor-pointer transition-colors border border-border/60"
                title="Insert Info Box"
              >
                + Info
              </button>
              <button
                type="button"
                onClick={() => insertCallout('tip')}
                className="px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800 rounded text-[11px] font-medium cursor-pointer transition-colors border border-border/60"
                title="Insert Tip Box"
              >
                + Tip
              </button>
              <button
                type="button"
                onClick={() => insertCallout('warning')}
                className="px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-slate-800 rounded text-[11px] font-medium cursor-pointer transition-colors border border-border/60"
                title="Insert Warning Box"
              >
                + Warning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Mode 1: Visual WYSIWYG Editor ─── */}
      {activeTab === 'visual' && (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          style={{ minHeight }}
          className="p-5 sm:p-6 outline-none text-foreground dark:text-slate-100 text-sm leading-relaxed overflow-y-auto max-h-[650px] font-sans selection:bg-primary/20"
          data-placeholder={placeholder}
        />
      )}

      {/* ─── Mode 2: HTML Source Code ─── */}
      {activeTab === 'code' && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ minHeight }}
          placeholder="<h1>Article Title</h1><p>Enter HTML markup directly...</p>"
          className="w-full p-5 sm:p-6 outline-none bg-muted/20 dark:bg-slate-950 text-foreground dark:text-slate-200 font-mono text-xs leading-relaxed resize-none border-0"
        />
      )}

      {/* ─── Mode 3: Website Live Preview (Storefront Simulation) ─── */}
      {activeTab === 'preview' && (
        <div
          style={{ minHeight }}
          className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-950/80 overflow-y-auto max-h-[700px]"
        >
          {/* Website Article Preview Container */}
          <article className="max-w-3xl mx-auto bg-card dark:bg-slate-900 border border-border/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-6">
            {/* Header / Meta */}
            <div className="space-y-4 pb-6 border-b border-border/70">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-wider">
                  Storefront Article
                </span>
                <span className="text-xs text-muted-foreground">• {readingTime} min read</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground dark:text-white leading-tight tracking-tight">
                {articleTitle || 'Untitled Article Headline'}
              </h1>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    {authorName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{authorName}</p>
                    <p className="text-[11px] text-muted-foreground">{publishDate || new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Image if present */}
            {featuredImage && (
              <div className="rounded-2xl overflow-hidden border border-border my-4 shadow-xs">
                <img src={featuredImage} alt={articleTitle || 'Cover'} className="w-full max-h-[380px] object-cover" />
              </div>
            )}

            {/* Rendered HTML Content */}
            {value ? (
              <div
                className="text-foreground dark:text-slate-200 text-[15px] leading-relaxed space-y-4 prose dark:prose-invert max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-xl [&_pre]:font-mono [&_pre]:text-xs [&_img]:rounded-xl [&_img]:border [&_img]:border-border [&_table]:border-collapse [&_table]:w-full"
                dangerouslySetInnerHTML={{ __html: value }}
              />
            ) : (
              <div className="py-12 text-center text-muted-foreground text-sm italic">
                {t('cms.previewEmpty', 'No content written yet. Switch to Visual Editor to add content.')}
              </div>
            )}
          </article>
        </div>
      )}

      {/* ─── Modal: Insert Link ─── */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card dark:bg-slate-900 border border-border rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <LinkIcon size={16} className="text-primary" /> {t('cms.insertLink', 'Insert Hyperlink')}
              </h4>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {t('cms.linkUrl', 'Target URL')} <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com/promo"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {t('cms.linkText', 'Link Display Text (Optional)')}
                </label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Click here to learn more"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-muted text-muted-foreground cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                {t('cms.insert', 'Insert Link')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Insert Image ─── */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card dark:bg-slate-900 border border-border rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-500" /> {t('cms.insertImage', 'Insert Image by URL')}
              </h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {t('cms.imageUrl', 'Image URL')} <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  {t('cms.imageAlt', 'Alt Caption / Description')}
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Infographic diagram"
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-border hover:bg-muted text-muted-foreground cursor-pointer"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
              >
                {t('cms.insert', 'Insert Image')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
