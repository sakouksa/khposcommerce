import React from 'react'
import { useTranslation } from 'react-i18next'

// ─── Status Types ──────────────────────────────────────────────────────────────

export type StatusValue = string | boolean | number | null | undefined

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'muted'

export type SupportedLanguage = 'km' | 'en' | 'zh' | 'th' | 'vi'

export interface StatusBadgeProps {
  status: StatusValue
  label?: React.ReactNode           // override display text
  variant?: BadgeVariant            // manual override of badge color style
  size?: 'xs' | 'sm' | 'md'         // defaults to 'sm'
  rounded?: 'sm' | 'md' | 'lg' | 'full' | 'none'
  className?: string                // extra classes
}

export const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20',
  danger:  'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20',
  info:    'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20',
  purple:  'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20',
  muted:   'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20',
}

// ─── Status to Variant Mapping ─────────────────────────────────────────────────

const STATUS_VARIANT_MAP: Record<string, BadgeVariant> = {
  // Positive / Success / Additions
  active:           'success',
  true:             'success',
  '1':              'success',
  approved:         'success',
  completed:        'success',
  done:             'success',
  reconciled:       'success',
  paid:             'success',
  received:         'success',
  delivered:        'success',
  published:        'success',
  in_stock:         'success',
  present:          'success',
  running:          'success',
  success:          'success',
  verified:         'success',
  enabled:          'success',
  read:             'success',
  open:             'success',
  addition:         'success',
  typeaddition:     'success',
  type_addition:    'success',
  stock_in:         'success',
  in:               'success',

  // Warning / In-progress / Pending
  pending:          'warning',
  processing:       'warning',
  partial:          'warning',
  partially_paid:   'warning',
  ordered:          'warning',
  low_stock:        'warning',
  late:             'warning',
  on_leave:         'warning',
  leave:            'warning',
  upcoming:         'warning',
  scheduled:        'warning',
  in_transit:       'warning',
  paused:           'warning',
  unread:           'warning',
  draft:            'muted',

  // Info
  shipped:          'info',
  confirmed:        'info',
  in_progress:      'info',
  half_day:         'info',
  info:             'info',
  recount:          'info',
  typerecount:      'info',
  type_recount:     'info',
  transfer:         'info',

  // Purple
  refunded:         'purple',
  adjustment:       'purple',

  // Negative / Danger / Subtractions
  inactive:         'danger',
  false:            'danger',
  '0':              'danger',
  rejected:         'danger',
  cancelled:        'danger',
  unpaid:           'danger',
  out_of_stock:     'danger',
  absent:           'danger',
  resigned:         'danger',
  terminated:       'danger',
  expired:          'danger',
  ended:            'danger',
  failed:           'danger',
  banned:           'danger',
  blocked:          'danger',
  deleted:          'danger',
  danger:           'danger',
  subtraction:      'danger',
  typesubtraction:  'danger',
  type_subtraction: 'danger',
  stock_out:        'danger',
  out:              'danger',
  closed:           'muted',
}

export const getStatusVariant = (status: StatusValue): BadgeVariant => {
  if (status === true || status === 1 || status === '1') return 'success'
  if (status === false || status === 0 || status === '0') return 'danger'
  if (!status) return 'muted'
  const key = String(status).toLowerCase().trim().replace(/\s+/g, '_')
  return STATUS_VARIANT_MAP[key] ?? 'muted'
}

export const getStatusBadgeClass = (status: StatusValue, variantOverride?: BadgeVariant): string => {
  const variant = variantOverride ?? getStatusVariant(status)
  return `px-2 py-0.5 text-xs font-semibold rounded ${BADGE_VARIANT_CLASSES[variant]}`
}

// ─── 5-Language Dictionaries ──────────────────────────────────────────────────

// 1. Khmer (🇰🇭 ភាសាខ្មែរ)
const KHMER_STATUS_LABELS: Record<string, string> = {
  active:           'សកម្ម',
  inactive:         'អសកម្ម',
  approved:         'បានអនុម័ត',
  completed:        'បានបញ្ចប់',
  done:             'បានបញ្ចប់',
  reconciled:       'បានផ្ទៀងផ្ទាត់',
  paid:             'បានបង់ប្រាក់',
  unpaid:           'មិនទាន់បង់',
  partial:          'បង់មួយផ្នែក',
  partially_paid:   'បង់មួយផ្នែក',
  pending:          'រង់ចាំ',
  processing:       'កំពុងដំណើរការ',
  ordered:          'បានបញ្ជាទិញ',
  received:         'បានទទួល',
  delivered:        'បានដឹកជញ្ជូន',
  shipped:          'បានផ្ញើចេញ',
  in_transit:       'កំពុងដឹកជញ្ជូន',
  cancelled:        'បានបោះបង់',
  rejected:         'បានបដិសេធ',
  draft:            'សេចក្តីព្រាង',
  published:        'បានផ្សព្វផ្សាយ',
  in_stock:         'មានក្នុងស្តុក',
  low_stock:        'ស្តុកទាប',
  out_of_stock:     'អស់ពីស្តុក',
  present:          'មានវត្តមាន',
  absent:           'អវត្តមាន',
  late:             'មកយឺត',
  half_day:         'កន្លះថ្ងៃ',
  on_leave:         'សុំច្បាប់',
  leave:            'សុំច្បាប់',
  resigned:         'លាលែង',
  terminated:       'បញ្ឈប់',
  expired:          'ផុតកំណត់',
  ended:            'បានបញ្ចប់',
  upcoming:         'គ្រោងទុក',
  scheduled:        'គ្រោងទុក',
  running:          'កំពុងដំណើរការ',
  refunded:         'បានបង្វិលសង',
  unread:           'មិនទាន់អាន',
  read:             'បានអាន',
  paused:           'ផ្អាក',
  open:             'បើក',
  closed:           'បិទ',
  success:          'ជោគជ័យ',
  failed:           'បរាជ័យ',
  verified:         'បានផ្ទៀងផ្ទាត់',
  banned:           'ត្រូវបានហាមឃាត់',
  blocked:          'ត្រូវបានរារាំង',
  deleted:          'បានលុប',
  addition:         'បន្ថែម (+)',
  typeaddition:     'បន្ថែម (+)',
  type_addition:    'បន្ថែម (+)',
  subtraction:      'ដកចេញ (-)',
  typesubtraction:  'ដកចេញ (-)',
  type_subtraction: 'ដកចេញ (-)',
  recount:          'រាប់ឡើងវិញ',
  typerecount:      'រាប់ឡើងវិញ',
  type_recount:     'រាប់ឡើងវិញ',
  stock_in:         'ស្តុកចូល',
  stock_out:        'ស្តុកចេញ',
  in:               'ស្តុកចូល',
  out:              'ស្តុកចេញ',
  transfer:         'ផ្ទេរស្តុក',
  adjustment:       'កែសម្រួលស្តុក',
}

// 2. English (🇺🇸 English)
const ENGLISH_STATUS_LABELS: Record<string, string> = {
  active:           'Active',
  inactive:         'Inactive',
  approved:         'Approved',
  completed:        'Completed',
  done:             'Completed',
  reconciled:       'Reconciled',
  paid:             'Paid',
  unpaid:           'Unpaid',
  partial:          'Partial',
  partially_paid:   'Partially Paid',
  pending:          'Pending',
  processing:       'Processing',
  ordered:          'Ordered',
  received:         'Received',
  delivered:        'Delivered',
  shipped:          'Shipped',
  in_transit:       'In Transit',
  cancelled:        'Cancelled',
  rejected:         'Rejected',
  draft:            'Draft',
  published:        'Published',
  in_stock:         'In Stock',
  low_stock:        'Low Stock',
  out_of_stock:     'Out of Stock',
  present:          'Present',
  absent:           'Absent',
  late:             'Late',
  half_day:         'Half Day',
  on_leave:         'On Leave',
  leave:            'On Leave',
  resigned:         'Resigned',
  terminated:       'Terminated',
  expired:          'Expired',
  ended:            'Ended',
  upcoming:         'Upcoming',
  scheduled:        'Scheduled',
  running:          'Running',
  refunded:         'Refunded',
  unread:           'Unread',
  read:             'Read',
  paused:           'Paused',
  open:             'Open',
  closed:           'Closed',
  success:          'Success',
  failed:           'Failed',
  verified:         'Verified',
  banned:           'Banned',
  blocked:          'Blocked',
  deleted:          'Deleted',
  addition:         'Addition (+)',
  typeaddition:     'Addition (+)',
  type_addition:    'Addition (+)',
  subtraction:      'Subtraction (-)',
  typesubtraction:  'Subtraction (-)',
  type_subtraction: 'Subtraction (-)',
  recount:          'Recount',
  typerecount:      'Recount',
  type_recount:     'Recount',
  stock_in:         'Stock In',
  stock_out:        'Stock Out',
  in:               'Stock In',
  out:              'Stock Out',
  transfer:         'Transfer',
  adjustment:       'Adjustment',
}

// 3. Chinese (🇨🇳 中文 - 简体)
const CHINESE_STATUS_LABELS: Record<string, string> = {
  active:           '已启用',
  inactive:         '已禁用',
  approved:         '已批准',
  completed:        '已完成',
  done:             '已完成',
  reconciled:       '已核对',
  paid:             '已付款',
  unpaid:           '未付款',
  partial:          '部分付款',
  partially_paid:   '部分付款',
  pending:          '待处理',
  processing:       '处理中',
  ordered:          '已订购',
  received:         '已收货',
  delivered:        '已送达',
  shipped:          '已发货',
  in_transit:       '运输中',
  cancelled:        '已取消',
  rejected:         '已拒绝',
  draft:            '草稿',
  published:        '已发布',
  in_stock:         '有库存',
  low_stock:        '低库存',
  out_of_stock:     '缺货',
  present:          '出勤',
  absent:           '缺勤',
  late:             '迟到',
  half_day:         '半天',
  on_leave:         '请假',
  leave:            '请假',
  resigned:         '已离职',
  terminated:       '已解雇',
  expired:          '已过期',
  ended:            '已结束',
  upcoming:         '即将开始',
  scheduled:        '已排期',
  running:          '运行中',
  refunded:         '已退款',
  unread:           '未读',
  read:             '已读',
  paused:           '已暂停',
  open:             '已开启',
  closed:           '已关闭',
  success:          '成功',
  failed:           '失败',
  verified:         '已验证',
  banned:           '已封禁',
  blocked:          '已阻止',
  deleted:          '已删除',
  addition:         '增加 (+)',
  typeaddition:     '增加 (+)',
  type_addition:    '增加 (+)',
  subtraction:      '减少 (-)',
  typesubtraction:  '减少 (-)',
  type_subtraction: '减少 (-)',
  recount:          '重新盘点',
  typerecount:      '重新盘点',
  type_recount:     '重新盘点',
  stock_in:         '入库',
  stock_out:        '出库',
  in:               '入库',
  out:              '出库',
  transfer:         '调拨',
  adjustment:       '库存调整',
}

// 4. Thai (🇹🇭 ภาษาไทย)
const THAI_STATUS_LABELS: Record<string, string> = {
  active:           'ใช้งานอยู่',
  inactive:         'ปิดใช้งาน',
  approved:         'อนุมัติแล้ว',
  completed:        'เสร็จสมบูรณ์',
  done:             'เสร็จสิ้น',
  reconciled:       'กระทบยอดแล้ว',
  paid:             'ชำระเงินแล้ว',
  unpaid:           'ยังไม่ชำระ',
  partial:          'ชำระบางส่วน',
  partially_paid:   'ชำระบางส่วน',
  pending:          'รอดำเนินการ',
  processing:       'กำลังดำเนินการ',
  ordered:          'สั่งซื้อแล้ว',
  received:         'ได้รับแล้ว',
  delivered:        'จัดส่งแล้ว',
  shipped:          'ส่งออกแล้ว',
  in_transit:       'กำลังขนส่ง',
  cancelled:        'ยกเลิกแล้ว',
  rejected:         'ปฏิเสธแล้ว',
  draft:            'ฉบับร่าง',
  published:        'เผยแพร่แล้ว',
  in_stock:         'มีสินค้า',
  low_stock:        'สินค้าใกล้หมด',
  out_of_stock:     'สินค้าหมด',
  present:          'มาทำงาน',
  absent:           'ขาดงาน',
  late:             'มาสาย',
  half_day:         'ครึ่งวัน',
  on_leave:         'ลาพักงาน',
  leave:            'ลา',
  resigned:         'ลาออก',
  terminated:       'เลิกจ้าง',
  expired:          'หมดอายุ',
  ended:            'สิ้นสุดแล้ว',
  upcoming:         'เร็วๆ นี้',
  scheduled:        'กำหนดการ',
  running:          'กำลังทำงาน',
  refunded:         'คืนเงินแล้ว',
  unread:           'ยังไม่ได้อ่าน',
  read:             'อ่านแล้ว',
  paused:           'หยุดชั่วคราว',
  open:             'เปิด',
  closed:           'ปิด',
  success:          'สำเร็จ',
  failed:           'ล้มเหลว',
  verified:         'ยืนยันแล้ว',
  banned:           'ถูกแบน',
  blocked:          'ถูกบล็อก',
  deleted:          'ลบแล้ว',
  addition:         'เพิ่ม (+)',
  typeaddition:     'เพิ่ม (+)',
  type_addition:    'เพิ่ม (+)',
  subtraction:      'ลด (-)',
  typesubtraction:  'ลด (-)',
  type_subtraction: 'ลด (-)',
  recount:          'นับใหม่',
  typerecount:      'นับใหม่',
  type_recount:     'นับใหม่',
  stock_in:         'รับเข้าสต็อก',
  stock_out:        'เบิกออกสต็อก',
  in:               'รับเข้าสต็อก',
  out:              'เบิกออกสต็อก',
  transfer:         'โอนย้าย',
  adjustment:       'ปรับปรุงสต็อก',
}

// 5. Vietnamese (🇻🇳 Tiếng Việt)
const VIETNAMESE_STATUS_LABELS: Record<string, string> = {
  active:           'Hoạt động',
  inactive:         'Không hoạt động',
  approved:         'Đã duyệt',
  completed:        'Đã hoàn thành',
  done:             'Hoàn thành',
  reconciled:       'Đã đối soát',
  paid:             'Đã thanh toán',
  unpaid:           'Chưa thanh toán',
  partial:          'Thanh toán một phần',
  partially_paid:   'Thanh toán một phần',
  pending:          'Đang chờ xử lý',
  processing:       'Đang xử lý',
  ordered:          'Đã đặt hàng',
  received:         'Đã nhận',
  delivered:        'Đã giao hàng',
  shipped:          'Đã gửi hàng',
  in_transit:       'Đang vận chuyển',
  cancelled:        'Đã hủy',
  rejected:         'Đã từ chối',
  draft:            'Bản nháp',
  published:        'Đã xuất bản',
  in_stock:         'Còn hàng',
  low_stock:        'Sắp hết hàng',
  out_of_stock:     'Hết hàng',
  present:          'Có mặt',
  absent:           'Vắng mặt',
  late:             'Đi muộn',
  half_day:         'Nửa ngày',
  on_leave:         'Nghỉ phép',
  leave:            'Nghỉ phép',
  resigned:         'Đã nghỉ việc',
  terminated:       'Đã sa thải',
  expired:          'Hết hạn',
  ended:            'Đã kết thúc',
  upcoming:         'Sắp diễn ra',
  scheduled:        'Đã lên lịch',
  running:          'Đang chạy',
  refunded:         'Đã hoàn tiền',
  unread:           'Chưa đọc',
  read:             'Đã đọc',
  paused:           'Tạm dừng',
  open:             'Mở',
  closed:           'Đóng',
  success:          'Thành công',
  failed:           'Thất bại',
  verified:         'Đã xác minh',
  banned:           'Đã bị cấm',
  blocked:          'Đã bị khóa',
  deleted:          'Đã xóa',
  addition:         'Cộng vào (+)',
  typeaddition:     'Cộng vào (+)',
  type_addition:    'Cộng vào (+)',
  subtraction:      'Trừ đi (-)',
  typesubtraction:  'Trừ đi (-)',
  type_subtraction: 'Trừ đi (-)',
  recount:          'Kiểm kê lại',
  typerecount:      'Kiểm kê lại',
  type_recount:     'Kiểm kê lại',
  stock_in:         'Nhập kho',
  stock_out:        'Xuất kho',
  in:               'Nhập kho',
  out:              'Xuất kho',
  transfer:         'Chuyển kho',
  adjustment:       'Điều chỉnh kho',
}

export const STATUS_LABELS_BY_LANG: Record<SupportedLanguage, Record<string, string>> = {
  km: KHMER_STATUS_LABELS,
  en: ENGLISH_STATUS_LABELS,
  zh: CHINESE_STATUS_LABELS,
  th: THAI_STATUS_LABELS,
  vi: VIETNAMESE_STATUS_LABELS,
}

const normalizeLanguage = (lang?: string): SupportedLanguage => {
  if (!lang) return 'km'
  const prefix = lang.toLowerCase().split('-')[0]
  if (prefix === 'km' || prefix === 'zh' || prefix === 'th' || prefix === 'vi' || prefix === 'en') {
    return prefix as SupportedLanguage
  }
  return 'en'
}

export const getLocalizedStatusText = (
  status: StatusValue,
  t?: any,
  languageCode: string = 'km'
): string => {
  const lang = normalizeLanguage(languageCode)
  const dict = STATUS_LABELS_BY_LANG[lang] ?? STATUS_LABELS_BY_LANG.en

  if (status === true || status === 1 || status === '1') {
    return dict['active'] ?? 'Active'
  }
  if (status === false || status === 0 || status === '0') {
    return dict['inactive'] ?? 'Inactive'
  }
  if (!status) return '—'

  const key = String(status).toLowerCase().trim().replace(/\s+/g, '_')
  
  if (dict[key]) {
    return dict[key]
  }

  // Fallback to i18n instance if provided
  if (t && typeof t === 'function') {
    const fallback = t(`common.${key}`, t(`inventory.${key}`, t(`purchases.${key}`, t(`employees.${key}`, ''))))
    if (fallback && fallback !== `common.${key}`) return fallback
  }

  // Fallback to English dictionary or humanized key
  return ENGLISH_STATUS_LABELS[key] ?? key.replace(/_/g, ' ')
}

const SIZE_CLASSES = {
  xs: 'px-2 py-0.5 text-[10px]',
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-xs',
}

// ─── StatusBadge Component ───────────────────────────────────────────────────

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  variant,
  size = 'sm',
  rounded = 'md',
  className = '',
}) => {
  const { t, i18n } = useTranslation(['common', 'purchases', 'inventory', 'employees'])
  const currentLang = i18n.language || 'km'

  const finalVariant = variant ?? getStatusVariant(status)
  const colorClass = BADGE_VARIANT_CLASSES[finalVariant]
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.sm
  const text = label ?? getLocalizedStatusText(status, t, currentLang)
  const roundedClass = rounded === 'full' ? 'rounded-full' : rounded === 'none' ? 'rounded-none' : `rounded-${rounded}`

  return (
    <span
      className={`inline-flex items-center justify-center font-semibold whitespace-nowrap leading-none transition-colors ${roundedClass} ${sizeClass} ${colorClass} ${className}`}
    >
      {text}
    </span>
  )
}

export default StatusBadge
