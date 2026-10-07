import React, { useState, useEffect } from 'react'
import {
  Bot,
  MessageSquare,
  Send,
  Users,
  Headphones,
  Wrench,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Check,
  Bell,
  Activity,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { chatbotService } from '@/services/chatbotService'

interface DashboardMetrics {
  total_sessions: number
  total_messages: number
  web_sessions: number
  telegram_sessions: number
  linked_telegram_users: number
  pending_support_requests: number
  total_support_requests: number
  tool_calls_count: number
  telegram_configured: boolean
}

interface ChatSession {
  id: number
  channel: string
  session_token: string
  contact_info?: string
  last_activity_at: string
  last_message_at?: string
  message_count?: number
  messages_count?: number
  customer?: { id: number; name: string }
  user?: {
    id: number
    name: string
    email: string
  }
  status?: string
  messages?: any[]
  [key: string]: any
}

interface SupportRequest {
  id: number
  name?: string
  customer_name?: string
  customer_contact?: string
  contact?: string
  channel: string
  message: string
  status: string
  admin_notes?: string
  created_at: string
  [key: string]: any
}

interface TelegramUser {
  id: number
  telegram_id?: string | number
  telegram_chat_id?: string
  telegram_username?: string
  username?: string
  first_name?: string
  last_name?: string
  is_active?: boolean
  created_at?: string
  linked_at?: string
  customer?: { id: number; name: string }
  user?: {
    id: number
    name: string
    email: string
    role: string
  }
  [key: string]: any
}

function ChatbotManagementPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'support' | 'telegram' | 'test'>('overview')
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([])
  const [telegramUsers, setTelegramUsers] = useState<TelegramUser[]>([])
  
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingSupport, setLoadingSupport] = useState(false)
  const [loadingTelegramUsers, setLoadingTelegramUsers] = useState(false)
  
  const [selectedSession, setSelectedSession] = useState<any | null>(null)
  const [sessionFilter, setSessionFilter] = useState('all')
  const [sessionSearch, setSessionSearch] = useState('')
  const [testNotificationType, setTestNotificationType] = useState('test_ping')
  const [sendingTest, setSendingTest] = useState(false)
  const [testStatus, setTestStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  useEffect(() => {
    if (activeTab === 'sessions') fetchSessions()
    if (activeTab === 'support') fetchSupportRequests()
    if (activeTab === 'telegram') fetchTelegramUsers()
  }, [activeTab, sessionFilter])

  const fetchDashboard = async () => {
    setLoadingMetrics(true)
    try {
      const response = await chatbotService.getDashboard()
      if (response.data?.metrics || response.metrics) {
        setMetrics(response.data?.metrics || response.metrics)
      }
    } catch (err) {
      console.error('Failed to load chatbot metrics:', err)
    } finally {
      setLoadingMetrics(false)
    }
  }

  const fetchSessions = async () => {
    setLoadingSessions(true)
    try {
      const params: any = {}
      if (sessionFilter !== 'all') params.channel = sessionFilter
      if (sessionSearch) params.search = sessionSearch

      const response = await chatbotService.getSessions(params)
      if (response.data?.data || response.data) {
        setSessions(response.data?.data || response.data)
      }
    } catch (err) {
      console.error('Failed to load chat sessions:', err)
    } finally {
      setLoadingSessions(false)
    }
  }

  const fetchSessionDetails = async (id: number) => {
    try {
      const response = await chatbotService.getSessionDetail(id)
      if (response.data || response) {
        setSelectedSession(response.data || response)
      }
    } catch (err) {
      console.error('Failed to load session details:', err)
    }
  }

  const fetchSupportRequests = async () => {
    setLoadingSupport(true)
    try {
      const response = await chatbotService.getSupportRequests()
      if (response.data?.data || response.data) {
        setSupportRequests(response.data?.data || response.data)
      }
    } catch (err) {
      console.error('Failed to load support requests:', err)
    } finally {
      setLoadingSupport(false)
    }
  }

  const handleUpdateSupportStatus = async (id: number, status: string) => {
    try {
      await chatbotService.updateSupportStatus(id, status)
      fetchSupportRequests()
    } catch (err) {
      console.error('Failed to update support status:', err)
    }
  }

  const fetchTelegramUsers = async () => {
    setLoadingTelegramUsers(true)
    try {
      const response = await chatbotService.getTelegramUsers()
      if (response.data?.data || response.data) {
        setTelegramUsers(response.data?.data || response.data)
      }
    } catch (err) {
      console.error('Failed to load telegram users:', err)
    } finally {
      setLoadingTelegramUsers(false)
    }
  }

  const handleSendTestNotification = async (type: string) => {
    setSendingTest(true)
    setTestStatus(null)
    try {
      const response = await chatbotService.sendTestNotification(type)
      setTestStatus(response.message || 'Test notification dispatched!')
    } catch (err: any) {
      setTestStatus('Failed to send test notification: ' + (err.response?.data?.message || err.message))
    } finally {
      setSendingTest(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>AI Chatbot & Telegram Hub</span>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md">
              Production Ready
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Multi-channel conversational commerce powered by OpenAI & Telegram Bot API
          </p>
        </div>

        {/* Refresh & Navigation tabs */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-px">
        {[
          { key: 'overview', label: 'Overview & KPIs', icon: Activity },
          { key: 'sessions', label: 'Conversations', icon: MessageSquare },
          { key: 'support', label: 'Support Escalations', icon: Headphones },
          { key: 'telegram', label: 'Telegram Users', icon: Send },
          { key: 'test', label: 'Alerts & Diagnostics', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Sessions</span>
                <MessageSquare className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {metrics?.total_sessions ?? 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Web: {metrics?.web_sessions ?? 0} • Telegram: {metrics?.telegram_sessions ?? 0}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Messages</span>
                <Sparkles className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {metrics?.total_messages ?? 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                AI Tool Executions: {metrics?.tool_calls_count ?? 0}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Telegram Users</span>
                <Send className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {metrics?.linked_telegram_users ?? 0}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                • Verified Account Links
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Support Requests</span>
                <Headphones className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {metrics?.pending_support_requests ?? 0}
              </div>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
                Pending Triage ({metrics?.total_support_requests ?? 0} total)
              </div>
            </div>
          </div>

          {/* Architecture Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-linear-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-800/40 dark:to-slate-900/40 border border-blue-100 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">AI Function Calling Engine</h3>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Active & Guarded</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                OpenAI tools connected via controlled Laravel services. Zero direct SQL queries or database tampering.
                Full isolation for cart, orders, and customer privacy.
              </p>
            </div>

            <div className="p-5 bg-linear-to-br from-sky-50/50 to-blue-50/50 dark:from-slate-800/40 dark:to-slate-900/40 border border-sky-100 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Telegram Bot & Notifications</h3>
                  <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                    Webhook Endpoint Ready
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Instant push alerts dispatched to Admin group for New Orders, Low Stock warnings, and Customer Support escalations with interactive deep links.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SESSIONS / CONVERSATIONS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Channel:</span>
              {(['all', 'web', 'telegram'] as const).map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => setSessionFilter(channel)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    sessionFilter === channel
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-72">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={sessionSearch}
                  onChange={(e) => setSessionSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchSessions()}
                  placeholder="Search token or customer..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-transparent rounded-xl focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={fetchSessions}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Sessions List & Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* List */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden max-h-[600px] overflow-y-auto">
              {loadingSessions ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading sessions...</div>
              ) : sessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No chat sessions found.</div>
              ) : (
                sessions.map((sess) => (
                  <button
                    key={sess.id}
                    type="button"
                    onClick={() => fetchSessionDetails(sess.id)}
                    className={`w-full p-3.5 text-left flex items-start justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      selectedSession?.id === sess.id ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                          sess.channel === 'telegram' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}>
                          {sess.channel}
                        </span>
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                          {sess.customer?.name || sess.session_token.slice(0, 16) + '...'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">
                        {sess.messages_count ?? 0} messages • {sess.last_message_at ? new Date(sess.last_message_at).toLocaleTimeString() : 'N/A'}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-2" />
                  </button>
                ))
              )}
            </div>

            {/* Transcript View */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 flex flex-col h-[600px] overflow-hidden">
              {selectedSession ? (
                <>
                  <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Session #{selectedSession.id} ({selectedSession.channel.toUpperCase()})
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedSession.session_token}
                      </span>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-md">
                      {selectedSession.status}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {selectedSession.messages?.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl text-xs ${
                          msg.role === 'user'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 ml-6 border border-blue-100 dark:border-blue-900'
                            : msg.role === 'tool'
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono text-[11px]'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mr-6'
                        }`}
                      >
                        <span className="font-bold uppercase tracking-wider text-[10px] block mb-1 opacity-70">
                          {msg.role} {msg.tool_name ? `• ${msg.tool_name}` : ''}
                        </span>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-400 text-xs">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                  <span>Select a conversation on the left to inspect transcript & tool calls.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPORT ESCALATIONS */}
      {activeTab === 'support' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Customer Support Requests
            </h3>
            <button
              type="button"
              onClick={fetchSupportRequests}
              className="text-xs text-blue-600 hover:underline"
            >
              Refresh Tickets
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Ticket #</th>
                  <th className="p-3.5">Customer / Contact</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Message / Issue</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingSupport ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">Loading support tickets...</td>
                  </tr>
                ) : supportRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">No support tickets found.</td>
                  </tr>
                ) : (
                  supportRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3.5 font-bold font-mono text-blue-600 dark:text-blue-400">
                        TKT-{String(req.id).padStart(5, '0')}
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                          {req.customer_name || 'Visitor'}
                        </span>
                        <span className="text-[11px] text-slate-400">{req.customer_contact || 'N/A'}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded uppercase bg-slate-100 dark:bg-slate-800">
                          {req.channel}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-md">
                        <p className="line-clamp-2 text-slate-700 dark:text-slate-300">
                          {req.message}
                        </p>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase ${
                          req.status === 'pending'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : req.status === 'in_progress'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={req.status}
                          onChange={(e) => handleUpdateSupportStatus(req.id, e.target.value)}
                          className="px-2 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TELEGRAM USERS */}
      {activeTab === 'telegram' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Linked Telegram Customers
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Telegram ID</th>
                  <th className="p-3.5">Username / Name</th>
                  <th className="p-3.5">Linked Customer Account</th>
                  <th className="p-3.5">Linked Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loadingTelegramUsers ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">Loading Telegram users...</td>
                  </tr>
                ) : telegramUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">No linked Telegram accounts yet.</td>
                  </tr>
                ) : (
                  telegramUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3.5 font-mono text-slate-600 dark:text-slate-400">
                        {u.telegram_id}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        {u.username ? `@${u.username}` : `${u.first_name || ''} ${u.last_name || ''}`}
                      </td>
                      <td className="p-3.5">
                        {u.customer ? (
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {u.customer.name} (ID #{u.customer.id})
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Guest Session</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {u.linked_at ? new Date(u.linked_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ALERTS & DIAGNOSTICS */}
      {activeTab === 'test' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span>Test Admin Telegram Notifications</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify that the Telegram Bot is sending instant alerts to your configured Admin Telegram Chat ID.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              disabled={sendingTest}
              onClick={() => handleSendTestNotification('general')}
              className="p-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1">
                <Bell className="w-4 h-4 text-blue-500" />
                <span>Test System Ping</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dispatches a basic health ping message to Telegram.
              </p>
            </button>

            <button
              type="button"
              disabled={sendingTest}
              onClick={() => handleSendTestNotification('order')}
              className="p-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Test Order Alert</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Simulates real-time New Order receipt with items and customer info.
              </p>
            </button>

            <button
              type="button"
              disabled={sendingTest}
              onClick={() => handleSendTestNotification('stock')}
              className="p-4 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-left transition-all group"
            >
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 mb-1">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                <span>Test Low Stock Alert</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Dispatches an inventory restock warning alert.
              </p>
            </button>
          </div>

          {testStatus && (
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold text-blue-900 dark:text-blue-300">
              {testStatus}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ChatbotManagementPage
