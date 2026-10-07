import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Camera,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Briefcase,
} from 'lucide-react'
import { employeeService } from '@/services/employeeService'
import { companyService } from '@/services/companyService'
import { userService } from '@/services/userService'
import { useToast } from '@/hooks/useToast'
import {
  FormLayout,
  FormContent,
  FormCard,
  FormHeader,
  FormFooter,
  LoadingSpinner,
  FieldError,
  getFieldClass,
  EnterpriseDatePicker,
} from '@/components/common'
import CustomErrorMessage from '@/components/ui/CustomErrorMessage'
import { getAbsoluteImageUrl, DEFAULT_AVATAR_IMAGE } from '@/utils/image'

const extractArray = (res: any): any[] => {
  if (!res) return []
  if (Array.isArray(res)) return res
  if (Array.isArray(res.data)) return res.data
  if (Array.isArray(res.data?.data)) return res.data.data
  if (Array.isArray(res.items)) return res.items
  if (Array.isArray(res.results)) return res.results
  return []
}

export interface EmployeeFormData {
  company_id: string
  branch_id: string
  department_id: string
  position_id: string
  reporting_to_id: string
  user_id: string
  employee_number: string
  name: string
  email: string
  phone: string
  nik: string
  gender: string
  birth_date: string
  address: string
  photo: string
  join_date: string
  resign_date: string
  contract_type: 'probation' | 'fdc' | 'udc'
  contract_end_date: string
  status: 'active' | 'inactive' | 'resigned'
  basic_salary: string
  // POS & Security
  pos_pin: string
  card_uid: string
  sales_commission_rate: string
  is_pos_supervisor: boolean
  can_override_discount: boolean
  can_void_sale: boolean
  // E-Commerce & Logistics
  is_driver: boolean
  driver_license_no: string
  vehicle_plate_no: string
  driver_status: 'available' | 'delivering' | 'off_duty'
  is_fulfillment_picker: boolean
  // Cambodia Banking & NSSF
  bank_name: string
  bank_account_number: string
  bank_account_holder: string
  nssf_number: string
  has_nssf: boolean
  dependents_count: string
}

const BLANK_EMPLOYEE_FORM: EmployeeFormData = {
  company_id: '1',
  branch_id: '1',
  department_id: '',
  position_id: '',
  reporting_to_id: '',
  user_id: '',
  employee_number: `EMP${Math.floor(100000 + Math.random() * 900000)}`,
  name: '',
  email: '',
  phone: '',
  nik: '',
  gender: 'male',
  birth_date: '',
  address: '',
  photo: '',
  join_date: new Date().toISOString().split('T')[0],
  resign_date: '',
  contract_type: 'udc',
  contract_end_date: '',
  status: 'active',
  basic_salary: '450.00',
  // POS
  pos_pin: '',
  card_uid: '',
  sales_commission_rate: '0.00',
  is_pos_supervisor: false,
  can_override_discount: false,
  can_void_sale: false,
  // Logistics
  is_driver: false,
  driver_license_no: '',
  vehicle_plate_no: '',
  driver_status: 'available',
  is_fulfillment_picker: false,
  // Banking & NSSF
  bank_name: 'ABA Bank',
  bank_account_number: '',
  bank_account_holder: '',
  nssf_number: '',
  has_nssf: true,
  dependents_count: '0',
}

export const EmployeeFormPage: React.FC = () => {
  const { t } = useTranslation(['employees', 'common', 'nav'])
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const employeeId = id ? parseInt(id) : null
  const navigate = useNavigate()
  const qc = useQueryClient()
  const toast = useToast()

  const [formData, setFormData] = useState<EmployeeFormData>(BLANK_EMPLOYEE_FORM)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [removedPhoto, setRemovedPhoto] = useState(false)
  const [showPosPin, setShowPosPin] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const setFormField = (field: keyof EmployeeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const generateAutoCode = () => {
    setFormField('employee_number', `EMP${Math.floor(100000 + Math.random() * 900000)}`)
  }

  // Fetch employee details if editing
  const {
    data: employeeDetail,
    isLoading: isLoadingDetail,
    isError: isErrorDetail,
    error: detailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ['employee-detail', employeeId],
    queryFn: () => (employeeId ? employeeService.show(employeeId) : null),
    enabled: isEdit && !isNaN(employeeId as number),
  })

  // ─── 100% Dynamic Queries from Database / Backend APIs ────────────────
  const { data: companies = [] } = useQuery({
    queryKey: ['companies-list-dropdown'],
    queryFn: () => companyService.getCompanies({ per_page: 100 }).then(r => extractArray(r)),
  })

  const { data: branches = [] } = useQuery({
    queryKey: ['branches-list-dropdown'],
    queryFn: () => companyService.getBranches({ per_page: 100 }).then(r => extractArray(r)),
  })

  const { data: rawDepartments = [] } = useQuery({
    queryKey: ['departments-list-dropdown'],
    queryFn: () => employeeService.departments({ per_page: 100 }).then(r => extractArray(r)),
  })

  const { data: rawPositions = [] } = useQuery({
    queryKey: ['positions-list-dropdown'],
    queryFn: () => employeeService.positions({ per_page: 100 }).then(r => extractArray(r)),
  })

  const { data: managersList = [] } = useQuery({
    queryKey: ['managers-list-dropdown'],
    queryFn: () => employeeService.list({ per_page: 150 }).then(r => extractArray(r)),
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users-list-dropdown'],
    queryFn: () => userService.list({ per_page: 200 }).then(r => extractArray(r)),
  })

  // ─── Dynamic Filtering & Chained Dependencies ──────────────────────────
  const filteredBranches = useMemo(() => {
    if (!formData.company_id || branches.length === 0) return branches
    const list = branches.filter((b: any) => !b.company_id || String(b.company_id) === String(formData.company_id))
    return list.length > 0 ? list : branches
  }, [branches, formData.company_id])

  const filteredDepartments = useMemo(() => {
    return rawDepartments.filter((d: any) => {
      if (formData.company_id && d.company_id && String(d.company_id) !== String(formData.company_id)) return false
      if (formData.branch_id && d.branch_id && String(d.branch_id) !== String(formData.branch_id)) return false
      return true
    })
  }, [rawDepartments, formData.company_id, formData.branch_id])

  const filteredPositions = useMemo(() => {
    if (!formData.department_id) return rawPositions
    const matching = rawPositions.filter((p: any) => !p.department_id || String(p.department_id) === String(formData.department_id))
    return matching.length > 0 ? matching : rawPositions
  }, [rawPositions, formData.department_id])

  const filteredManagers = useMemo(() => {
    const list = extractArray(managersList)
    return list.filter((m: any) => {
      if (employeeId && String(m.id) === String(employeeId)) return false
      return true
    })
  }, [managersList, employeeId])

  const handleCompanyChange = (newCompanyId: string) => {
    setFormField('company_id', newCompanyId)
    const validBranches = branches.filter((b: any) => !b.company_id || String(b.company_id) === String(newCompanyId))
    if (validBranches.length > 0 && !validBranches.some((b: any) => String(b.id) === String(formData.branch_id))) {
      setFormField('branch_id', String(validBranches[0].id))
    }
  }

  const handleBranchChange = (newBranchId: string) => {
    setFormField('branch_id', newBranchId)
  }

  const handleDepartmentChange = (newDeptId: string) => {
    setFormField('department_id', newDeptId)
    if (newDeptId && formData.position_id) {
      const pos = rawPositions.find((p: any) => String(p.id) === String(formData.position_id))
      if (pos && pos.department_id && String(pos.department_id) !== String(newDeptId)) {
        setFormField('position_id', '')
      }
    }
  }

  const handleContractTypeChange = (newType: 'udc' | 'fdc' | 'probation') => {
    setFormField('contract_type', newType)
    if (newType === 'udc') {
      setFormField('contract_end_date', '')
    } else if (newType === 'probation') {
      const base = formData.join_date ? new Date(formData.join_date) : new Date()
      base.setMonth(base.getMonth() + 3)
      setFormField('contract_end_date', base.toISOString().split('T')[0])
    } else if (newType === 'fdc') {
      const base = formData.join_date ? new Date(formData.join_date) : new Date()
      base.setFullYear(base.getFullYear() + 1)
      setFormField('contract_end_date', base.toISOString().split('T')[0])
    }
  }

  const handleJoinDateChange = (newDate: string) => {
    setFormField('join_date', newDate)
    if (formData.contract_type === 'probation' && newDate) {
      const base = new Date(newDate)
      base.setMonth(base.getMonth() + 3)
      setFormField('contract_end_date', base.toISOString().split('T')[0])
    } else if (formData.contract_type === 'fdc' && newDate) {
      const base = new Date(newDate)
      base.setFullYear(base.getFullYear() + 1)
      setFormField('contract_end_date', base.toISOString().split('T')[0])
    }
  }

  // Populate data in edit mode
  useEffect(() => {
    if (employeeDetail) {
      setFormData({
        company_id: employeeDetail.company_id?.toString() || '1',
        branch_id: employeeDetail.branch_id?.toString() || '1',
        department_id: employeeDetail.department_id?.toString() || '',
        position_id: employeeDetail.position_id?.toString() || '',
        reporting_to_id: employeeDetail.reporting_to_id?.toString() || '',
        user_id: employeeDetail.user_id?.toString() || '',
        employee_number: employeeDetail.employee_number || '',
        name: employeeDetail.name || '',
        email: employeeDetail.email || '',
        phone: employeeDetail.phone || '',
        nik: employeeDetail.nik || '',
        gender: employeeDetail.gender || 'male',
        birth_date: employeeDetail.birth_date ? employeeDetail.birth_date.split('T')[0] : '',
        address: employeeDetail.address || '',
        photo: employeeDetail.photo || '',
        join_date: employeeDetail.join_date ? employeeDetail.join_date.split('T')[0] : '',
        resign_date: employeeDetail.resign_date ? employeeDetail.resign_date.split('T')[0] : '',
        contract_type: employeeDetail.contract_type || 'udc',
        contract_end_date: employeeDetail.contract_end_date ? employeeDetail.contract_end_date.split('T')[0] : '',
        status: employeeDetail.status || 'active',
        basic_salary: employeeDetail.basic_salary != null ? String(parseFloat(employeeDetail.basic_salary)) : '',
        // POS
        pos_pin: employeeDetail.pos_pin || '',
        card_uid: employeeDetail.card_uid || '',
        sales_commission_rate: employeeDetail.sales_commission_rate != null ? String(parseFloat(employeeDetail.sales_commission_rate)) : '0.00',
        is_pos_supervisor: Boolean(employeeDetail.is_pos_supervisor),
        can_override_discount: Boolean(employeeDetail.can_override_discount),
        can_void_sale: Boolean(employeeDetail.can_void_sale),
        // Logistics
        is_driver: Boolean(employeeDetail.is_driver),
        driver_license_no: employeeDetail.driver_license_no || '',
        vehicle_plate_no: employeeDetail.vehicle_plate_no || '',
        driver_status: employeeDetail.driver_status || 'available',
        is_fulfillment_picker: Boolean(employeeDetail.is_fulfillment_picker),
        // Banking & NSSF
        bank_name: employeeDetail.bank_name || 'ABA Bank',
        bank_account_number: employeeDetail.bank_account_number || '',
        bank_account_holder: employeeDetail.bank_account_holder || '',
        nssf_number: employeeDetail.nssf_number || '',
        has_nssf: employeeDetail.has_nssf !== false,
        dependents_count: String(employeeDetail.dependents_count ?? 0),
      })

      if (employeeDetail.photo) {
        setPhotoPreview(getAbsoluteImageUrl(employeeDetail.photo))
      }
    }
  }, [employeeDetail])

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoPreview(URL.createObjectURL(file))
    const uploadData = new FormData()
    uploadData.append('photo', file)
    setUploadingPhoto(true)

    try {
      const res = await employeeService.uploadPhoto(uploadData)
      const photoPath = res.data?.path || res.data?.url || res.path || res.url
      setFormField('photo', photoPath)
      setRemovedPhoto(false)
      toast.success(t('employees.photoUploaded', 'Employee photo uploaded successfully.'))
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? t('employees.photoUploadFailed', 'Failed to upload photo.'))
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoPreview(null)
    setFormField('photo', '')
    setRemovedPhoto(true)
  }

  // Mutation Save
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      if (isEdit && employeeId) {
        return employeeService.update(employeeId, payload)
      }
      return employeeService.create(payload)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employees'] })
      qc.invalidateQueries({ queryKey: ['employees-list'] })
      qc.invalidateQueries({ queryKey: ['employees/stats'] })
      toast.success(isEdit ? t('employees.updateSuccess', 'Employee updated successfully.') : t('employees.createSuccess', 'Employee created successfully.'))
      navigate('/employees')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || t('common.saveFailed', 'Failed to save data.')
      toast.error(message)
    }
  })

  const validate = () => {
    const errors: Record<string, string> = {}
    if (!formData.employee_number.trim()) {
      errors.employee_number = t('employees.errors.codeRequired', 'Please enter employee ID')
    }
    if (!formData.name.trim()) {
      errors.name = t('employees.errors.nameRequired', 'Please enter employee full name')
    }
    if (!formData.company_id) {
      errors.company_id = t('employees.errors.companyRequired', 'Please select company')
    }
    if (!formData.branch_id) {
      errors.branch_id = t('employees.errors.branchRequired', 'Please select branch')
    }
    if (!formData.basic_salary || parseFloat(formData.basic_salary) < 0) {
      errors.basic_salary = t('employees.errors.salaryRequired', 'Please enter valid basic salary')
    }
    return errors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      const firstErrorField = Object.keys(errors)[0]
      const el = document.getElementById(`field-${firstErrorField}`) || document.getElementById(firstErrorField)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus?.()
      }
      return
    }

    const payload: any = {
      company_id: parseInt(formData.company_id) || 1,
      branch_id: parseInt(formData.branch_id) || 1,
      department_id: formData.department_id ? parseInt(formData.department_id) : null,
      position_id: formData.position_id ? parseInt(formData.position_id) : null,
      reporting_to_id: formData.reporting_to_id ? parseInt(formData.reporting_to_id) : null,
      user_id: formData.user_id ? parseInt(formData.user_id) : null,
      employee_number: formData.employee_number.trim(),
      name: formData.name.trim(),
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      nik: formData.nik.trim() || null,
      gender: formData.gender || 'male',
      birth_date: formData.birth_date || null,
      address: formData.address.trim() || null,
      photo: formData.photo || '',
      remove_photo: removedPhoto || (!formData.photo && isEdit) ? 1 : 0,
      join_date: formData.join_date || null,
      resign_date: formData.resign_date || null,
      contract_type: formData.contract_type || 'udc',
      contract_end_date: formData.contract_end_date || null,
      status: formData.status,
      basic_salary: formData.basic_salary ? parseFloat(formData.basic_salary) : null,
      // POS
      pos_pin: formData.pos_pin.trim() || null,
      card_uid: formData.card_uid.trim() || null,
      sales_commission_rate: formData.sales_commission_rate ? parseFloat(formData.sales_commission_rate) : 0,
      is_pos_supervisor: formData.is_pos_supervisor,
      can_override_discount: formData.can_override_discount,
      can_void_sale: formData.can_void_sale,
      // Logistics
      is_driver: formData.is_driver,
      driver_license_no: formData.driver_license_no.trim() || null,
      vehicle_plate_no: formData.vehicle_plate_no.trim() || null,
      driver_status: formData.driver_status || 'available',
      is_fulfillment_picker: formData.is_fulfillment_picker,
      // Banking & NSSF
      bank_name: formData.bank_name.trim() || null,
      bank_account_number: formData.bank_account_number.trim() || null,
      bank_account_holder: formData.bank_account_holder.trim() || null,
      nssf_number: formData.nssf_number.trim() || null,
      has_nssf: formData.has_nssf,
      dependents_count: parseInt(formData.dependents_count) || 0,
    }

    saveMutation.mutate(payload)
  }

  if (isEdit && isLoadingDetail) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isEdit && isErrorDetail) {
    return (
      <div className="p-6">
        <CustomErrorMessage
          title={t('employees.errorLoading', 'Failed to load employee details.')}
          message={detailError?.message || t('common.error', 'An error occurred')}
          onRetry={() => refetchDetail()}
        />
      </div>
    )
  }

  const labelCls = 'block text-xs font-semibold text-foreground dark:text-slate-200 mb-1.5'

  return (
    <FormLayout
      onSubmit={handleSubmit}
      noValidate
      isSubmitting={saveMutation.isPending}
      header={
        <FormHeader
          isEdit={isEdit}
          title={
            isEdit
              ? (formData.name
                  ? t('employees.editEmployeeTitle', 'Edit Employee: {{name}}', { name: formData.name })
                  : t('employees.editEmployee', 'Edit Employee'))
              : t('employees.createEmployeeTitle', 'Create New Employee')
          }
          subtitle={
            isEdit
              ? t('employees.editSubtitle', 'Update profile, POS security, logistics, Cambodia compliance, and banking records.')
              : t('employees.createSubtitle', 'Complete employee profile, POS PIN, driver license, NSSF, and salary info.')
          }
          breadcrumbs={[
            { label: t('employees.employee_management', 'Employees'), href: '/employees' },
            {
              label: isEdit
                ? t('employees.edit', 'Edit')
                : t('employees.create', 'Create'),
            },
          ]}
          backPath="/employees"
          backLabel={t('common.back', 'Back')}
          showSubmit={false}
        />
      }
      footer={
        <FormFooter
          isEdit={isEdit}
          isSubmitting={saveMutation.isPending}
          onCancel={() => navigate('/employees')}
          cancelPath="/employees"
          submitLabel={isEdit ? t('common.saveChanges', 'Save Changes') : t('employees.createEmployee', 'Create Employee')}
        />
      }
    >
      <FormContent maxWidth="3xl">
        {/* CARD 1: Basic Information */}
        <FormCard
          title={t('employees.basicInfo', 'Basic Information')}
          subtitle={t('employees.basicInfoDesc', 'Employee photo, full name, employee number, gender, status, and contact details.')}
          contentClassName="space-y-6"
        >

          {/* Photo Avatar Section */}
          <div className="flex items-center gap-4 p-4 rounded-xl border border-border/70 dark:border-slate-800 bg-muted/20 dark:bg-slate-800/40">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-border/80 dark:border-slate-700 shrink-0 bg-background dark:bg-slate-900 flex items-center justify-center">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Employee Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR_IMAGE }}
                />
              ) : (
                <img
                  src={DEFAULT_AVATAR_IMAGE}
                  alt="Employee Avatar"
                  className="w-full h-full object-cover"
                />
              )}
              {uploadingPhoto && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 size={18} className="animate-spin text-white" />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95">
                  <Camera size={13} />
                  <span>{photoPreview ? t('employees.changePhoto', 'Change Photo') : t('employees.uploadPhotoBtn', 'Upload Photo')}</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="h-8 px-2.5 rounded-lg border border-rose-500/30 dark:border-rose-500/40 text-rose-500 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                  >
                    <Trash2 size={13} />
                    <span>{t('common.remove', 'Remove')}</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                {t('employees.photoHint', 'PNG, JPG, WEBP up to 5MB')}
              </p>
            </div>
          </div>

          {/* Personal Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Employee Code / ID */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls}>
                  {t('employees.employee_number', 'Employee Code')} <span className="text-rose-500 font-bold">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateAutoCode}
                  className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
                >
                  {t('common.autoGenerate', 'Auto')}
                </button>
              </div>
              <input
                id="field-employee_number"
                type="text"
                value={formData.employee_number}
                onChange={(e) => setFormField('employee_number', e.target.value)}
                placeholder={t('employees.codePlaceholder', 'EMP-0001')}
                className={getFieldClass(
                  formErrors.employee_number,
                  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-mono uppercase rounded-xl border transition-all font-medium'
                )}
                required
              />
              <FieldError error={formErrors.employee_number} />
            </div>

            {/* Full Name */}
            <div>
              <label className={labelCls}>
                {t('employees.full_name', 'Full Name')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                id="field-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormField('name', e.target.value)}
                placeholder={t('employees.namePlaceholder', 'e.g. Sok Pisey / John Doe')}
                className={getFieldClass(
                  formErrors.name,
                  'w-full h-10 min-h-[40px] px-3.5 py-2 text-xs sm:text-[13px] font-medium rounded-xl border transition-all'
                )}
                required
              />
              <FieldError error={formErrors.name} />
            </div>

            {/* Status Selector */}
            <div>
              <label className={labelCls}>{t('employees.status', 'Employment Status')}</label>
              <select
                value={formData.status}
                onChange={(e) => setFormField('status', e.target.value as any)}
                className="form-select cursor-pointer font-semibold rounded-xl"
              >
                <option value="active">{t('employees.active', 'Active')}</option>
                <option value="inactive">{t('employees.inactive', 'Inactive')}</option>
                <option value="resigned">{t('employees.resigned', 'Resigned')}</option>
              </select>
            </div>

            {/* Email Address */}
            <div>
              <label className={labelCls}>
                {t('employees.email', 'Email Address')}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormField('email', e.target.value)}
                placeholder={t('employees.emailPlaceholder', 'employee@enterprise-pos.com')}
                className="form-input rounded-xl"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className={labelCls}>
                {t('employees.phone', 'Phone Number')}
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormField('phone', e.target.value)}
                placeholder={t('employees.phonePlaceholder', '012 345 678')}
                className="form-input font-mono rounded-xl"
              />
            </div>

            {/* National ID (NIK) */}
            <div>
              <label className={labelCls}>
                {t('employees.nik', 'National ID (NIK)')}
              </label>
              <input
                type="text"
                value={formData.nik}
                onChange={(e) => setFormField('nik', e.target.value)}
                placeholder={t('employees.nikPlaceholder', 'KH-01234567')}
                className="form-input font-mono rounded-xl"
              />
            </div>

            {/* Gender */}
            <div>
              <label className={labelCls}>{t('employees.gender', 'Gender')}</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormField('gender', e.target.value)}
                className="form-select cursor-pointer rounded-xl"
              >
                <option value="male">{t('employees.male', 'Male')}</option>
                <option value="female">{t('employees.female', 'Female')}</option>
                <option value="other">{t('employees.other', 'Other')}</option>
              </select>
            </div>

            {/* Birth Date */}
            <div>
              <EnterpriseDatePicker
                label={t('employees.birth_date', 'Birth Date')}
                value={formData.birth_date}
                onChange={(v) => setFormField('birth_date', v)}
                placeholder={t('employees.selectBirthDate', 'Select birth date')}
              />
            </div>

            {/* Address */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className={labelCls}>
                {t('employees.address', 'Residential Address')}
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormField('address', e.target.value)}
                placeholder={t('employees.addressPlaceholder', 'House / Street, Sangkat, Khan, Province')}
                className="form-input rounded-xl"
              />
            </div>
          </div>
        </FormCard>

        {/* CARD 2: Employment & Structure */}
        <FormCard
          title={t('employees.jobStructure', 'Employment & Structure')}
          subtitle={t('employees.jobStructureDesc', 'Branch, department, job role, manager hierarchy, and employment contract.')}
          badge={
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {formData.contract_type === 'udc'
                ? t('employees.udc', 'UDC')
                : formData.contract_type === 'fdc'
                ? t('employees.fdc', 'FDC')
                : t('employees.probation', 'Probation')}
            </span>
          }
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Company */}
            <div>
              <label className={labelCls}>
                {t('employees.company', 'Company')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                id="field-company_id"
                value={formData.company_id}
                onChange={(e) => handleCompanyChange(e.target.value)}
                className={getFieldClass(
                  formErrors.company_id,
                  'form-select cursor-pointer rounded-xl font-medium'
                )}
                required
              >
                {companies.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <FieldError error={formErrors.company_id} />
            </div>

            {/* Branch */}
            <div>
              <label className={labelCls}>
                {t('employees.branch', 'Branch / Outlet')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <select
                id="field-branch_id"
                value={formData.branch_id}
                onChange={(e) => handleBranchChange(e.target.value)}
                className={getFieldClass(
                  formErrors.branch_id,
                  'form-select cursor-pointer rounded-xl font-medium'
                )}
                required
              >
                {filteredBranches.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <FieldError error={formErrors.branch_id} />
            </div>

            {/* Department */}
            <div>
              <label className={labelCls}>{t('employees.department', 'Department')}</label>
              <select
                value={formData.department_id}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="form-select cursor-pointer rounded-xl font-medium"
              >
                <option value="">{t('employees.select_department', '-- Select Department --')}</option>
                {filteredDepartments.map((d: any) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code || 'DEPT'})
                  </option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className={labelCls}>{t('employees.position', 'Position / Role')}</label>
              <select
                value={formData.position_id}
                onChange={(e) => setFormField('position_id', e.target.value)}
                className="form-select cursor-pointer rounded-xl font-medium"
              >
                <option value="">{t('employees.select_position', '-- Select Position --')}</option>
                {filteredPositions.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct Manager */}
            <div>
              <label className={labelCls}>{t('employees.reporting_to', 'Direct Supervisor')}</label>
              <select
                value={formData.reporting_to_id}
                onChange={(e) => setFormField('reporting_to_id', e.target.value)}
                className="form-select cursor-pointer rounded-xl font-medium"
              >
                <option value="">{t('employees.no_manager', '-- No Direct Supervisor (Top Level) --')}</option>
                {filteredManagers.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.position?.name || m.department?.name || m.employee_number})
                  </option>
                ))}
              </select>
            </div>

            {/* User Link */}
            <div>
              <label className={labelCls}>{t('employees.user_mapping', 'Link User Account')}</label>
              <select
                value={formData.user_id}
                onChange={(e) => setFormField('user_id', e.target.value)}
                className="form-select cursor-pointer rounded-xl font-medium"
              >
                <option value="">{t('employees.no_user_mapping', 'No Linked User')}</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Contract Type */}
            <div>
              <label className={labelCls}>{t('employees.contract_type', 'Contract Type')}</label>
              <select
                value={formData.contract_type}
                onChange={(e) => handleContractTypeChange(e.target.value as any)}
                className="form-select cursor-pointer rounded-xl font-semibold"
              >
                <option value="udc">{t('employees.udc', 'Undetermined Duration Contract (UDC)')}</option>
                <option value="fdc">{t('employees.fdc', 'Fixed Duration Contract (FDC)')}</option>
                <option value="probation">{t('employees.probation', 'Probation')}</option>
              </select>
              <p className="text-[10px] text-muted-foreground dark:text-slate-400 mt-1.5">
                {formData.contract_type === 'udc' && t('employees.contract_udc_hint', 'Permanent contract with no fixed end date')}
                {formData.contract_type === 'fdc' && t('employees.contract_fdc_hint', 'Fixed term contract (Auto-set to 1 year from join date)')}
                {formData.contract_type === 'probation' && t('employees.contract_probation_hint', 'Probation period (Auto-set to 3 months from join date)')}
              </p>
            </div>

            {/* Join Date */}
            <div>
              <EnterpriseDatePicker
                label={t('employees.join_date', 'Join Date')}
                required
                value={formData.join_date}
                onChange={(v) => handleJoinDateChange(v)}
                placeholder={t('employees.selectJoinDate', 'Select join date')}
              />
            </div>

            {/* Contract End Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls}>
                  {t('employees.contract_end_date', 'Contract End Date')}
                  {formData.contract_type !== 'udc' && <span className="text-rose-500 font-bold"> *</span>}
                </label>
                {formData.contract_type === 'udc' && (
                  <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                    {t('employees.notApplicable', 'N/A')}
                  </span>
                )}
              </div>
              <EnterpriseDatePicker
                disabled={formData.contract_type === 'udc'}
                value={formData.contract_end_date}
                onChange={(v) => setFormField('contract_end_date', v)}
                placeholder={t('employees.selectContractEndDate', 'Select contract end date')}
              />
              <p className="text-[10px] text-muted-foreground dark:text-slate-400 mt-1.5">
                {formData.contract_type === 'udc'
                  ? t('employees.contract_udc_hint', 'Permanent contract with no fixed end date')
                  : t('employees.contract_fdc_hint', 'Auto-synced with contract type')}
              </p>
            </div>
          </div>
        </FormCard>

        {/* CARD 3: POS Cashier & Security */}
        <FormCard
          title={t('employees.posSettings', 'POS Cashier & Security')}
          subtitle={t('employees.posSettingsDesc', 'Quick PIN switch, RFID badge login, sales commission rate, and supervisor overrides.')}
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* POS PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={labelCls}>
                  {t('employees.pos_pin', 'Quick POS PIN')}
                </label>
                <button
                  type="button"
                  onClick={() => setShowPosPin(!showPosPin)}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  {showPosPin ? <EyeOff size={11} /> : <Eye size={11} />}
                  <span>{showPosPin ? t('common.hide', 'Hide') : t('common.show', 'Show')}</span>
                </button>
              </div>
              <input
                type={showPosPin ? 'text' : 'password'}
                maxLength={6}
                value={formData.pos_pin}
                onChange={(e) => setFormField('pos_pin', e.target.value)}
                placeholder={t('employees.posPinPlaceholder', 'e.g. 1234')}
                className="form-input font-mono tracking-widest rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground dark:text-slate-400 mt-1.5">
                {t('employees.posPinHint', 'Used to unlock & switch cashiers on POS')}
              </p>
            </div>

            {/* RFID UID */}
            <div>
              <label className={labelCls}>
                {t('employees.card_uid', 'RFID Card / NFC Badge UID')}
              </label>
              <input
                type="text"
                value={formData.card_uid}
                onChange={(e) => setFormField('card_uid', e.target.value)}
                placeholder={t('employees.cardUidPlaceholder', 'e.g. RFID-KH-09823')}
                className="form-input font-mono rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground dark:text-slate-400 mt-1.5">
                {t('employees.cardUidHint', 'For tap-and-login hardware card readers')}
              </p>
            </div>

            {/* Commission Rate */}
            <div>
              <label className={labelCls}>
                {t('employees.sales_commission_rate', 'Sales Commission Rate (%)')}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.sales_commission_rate}
                  onChange={(e) => setFormField('sales_commission_rate', e.target.value)}
                  placeholder="2.5"
                  className="form-input font-mono pr-8 rounded-xl"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">%</span>
              </div>
              <p className="text-[10px] text-muted-foreground dark:text-slate-400 mt-1.5">
                {t('employees.commissionHint', 'Calculated on completed receipts')}
              </p>
            </div>
          </div>

          {/* POS Manager Override Permissions */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-foreground dark:text-slate-200 mb-2.5">
              {t('employees.posPermissions', 'POS Manager Override Permissions')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                formData.is_pos_supervisor
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/40 dark:border-primary/40 shadow-xs'
                  : 'bg-muted/20 dark:bg-slate-800/30 border-border/70 dark:border-slate-700/60 hover:bg-muted/40 dark:hover:bg-slate-800/50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.is_pos_supervisor}
                  onChange={(e) => setFormField('is_pos_supervisor', e.target.checked)}
                  className="checkbox mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground dark:text-slate-200 block">
                    {t('employees.is_pos_supervisor', 'POS Supervisor')}
                  </span>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    {t('employees.posSupervisorHint', 'Authorizes manager actions')}
                  </p>
                </div>
              </label>

              <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                formData.can_override_discount
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/40 dark:border-primary/40 shadow-xs'
                  : 'bg-muted/20 dark:bg-slate-800/30 border-border/70 dark:border-slate-700/60 hover:bg-muted/40 dark:hover:bg-slate-800/50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.can_override_discount}
                  onChange={(e) => setFormField('can_override_discount', e.target.checked)}
                  className="checkbox mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground dark:text-slate-200 block">
                    {t('employees.can_override_discount', 'Discount Override')}
                  </span>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    {t('employees.discountOverrideHint', 'Approve custom line discounts')}
                  </p>
                </div>
              </label>

              <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                formData.can_void_sale
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/40 dark:border-primary/40 shadow-xs'
                  : 'bg-muted/20 dark:bg-slate-800/30 border-border/70 dark:border-slate-700/60 hover:bg-muted/40 dark:hover:bg-slate-800/50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.can_void_sale}
                  onChange={(e) => setFormField('can_void_sale', e.target.checked)}
                  className="checkbox mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground dark:text-slate-200 block">
                    {t('employees.can_void_sale', 'Void Sale Bill')}
                  </span>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    {t('employees.voidSaleHint', 'Allow canceling active receipts')}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </FormCard>

        {/* CARD 4: Logistics & Delivery */}
        <FormCard
          title={t('employees.logisticsAndFleet', 'Logistics & Warehouse Roles')}
          subtitle={t('employees.logisticsAndFleetDesc', 'Assign delivery rider profile, driver license, vehicle plate, and warehouse picker roles.')}
        >

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                formData.is_driver
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/40 dark:border-primary/40 shadow-xs'
                  : 'bg-muted/20 dark:bg-slate-800/30 border-border/70 dark:border-slate-700/60 hover:bg-muted/40 dark:hover:bg-slate-800/50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.is_driver}
                  onChange={(e) => setFormField('is_driver', e.target.checked)}
                  className="checkbox mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground dark:text-slate-200 block">
                    {t('employees.is_driver', 'Delivery Driver / Rider')}
                  </span>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    {t('employees.driverHint', 'Assign orders and collect Cash on Delivery (COD)')}
                  </p>
                </div>
              </label>

              <label className={`p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer select-none ${
                formData.is_fulfillment_picker
                  ? 'bg-primary/5 dark:bg-primary/10 border-primary/40 dark:border-primary/40 shadow-xs'
                  : 'bg-muted/20 dark:bg-slate-800/30 border-border/70 dark:border-slate-700/60 hover:bg-muted/40 dark:hover:bg-slate-800/50'
              }`}>
                <input
                  type="checkbox"
                  checked={formData.is_fulfillment_picker}
                  onChange={(e) => setFormField('is_fulfillment_picker', e.target.checked)}
                  className="checkbox mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground dark:text-slate-200 block">
                    {t('employees.is_fulfillment_picker', 'Warehouse Picker & Packer')}
                  </span>
                  <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                    {t('employees.pickerHint', 'Track order packing speed and stock dispatch')}
                  </p>
                </div>
              </label>
            </div>

            {formData.is_driver && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 p-4 rounded-xl bg-muted/20 dark:bg-slate-800/40 border border-border/70 dark:border-slate-700/60">
                <div>
                  <label className={labelCls}>
                    {t('employees.driver_license_no', 'Driver License Number')}
                  </label>
                  <input
                    type="text"
                    value={formData.driver_license_no}
                    onChange={(e) => setFormField('driver_license_no', e.target.value)}
                    placeholder={t('employees.driverLicensePlaceholder', 'DL-KH-092834')}
                    className="form-input font-mono rounded-xl"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    {t('employees.vehicle_plate_no', 'Vehicle Plate Number')}
                  </label>
                  <input
                    type="text"
                    value={formData.vehicle_plate_no}
                    onChange={(e) => setFormField('vehicle_plate_no', e.target.value)}
                    placeholder={t('employees.vehiclePlatePlaceholder', 'PP-1AB-9876')}
                    className="form-input font-mono rounded-xl"
                  />
                </div>

                <div>
                  <label className={labelCls}>
                    {t('employees.driver_status', 'Driver Duty Status')}
                  </label>
                  <select
                    value={formData.driver_status}
                    onChange={(e) => setFormField('driver_status', e.target.value as any)}
                    className="form-select cursor-pointer rounded-xl"
                  >
                    <option value="available">{t('employees.available', 'Available')}</option>
                    <option value="delivering">{t('employees.delivering', 'On Delivery')}</option>
                    <option value="off_duty">{t('employees.off_duty', 'Off Duty')}</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </FormCard>

        {/* CARD 5: Compensation, NSSF & Banking */}
        <FormCard
          title={t('employees.compensationAndBank', 'Compensation, NSSF & Banking')}
          subtitle={t('employees.compensationAndBankDesc', 'Basic salary, NSSF membership, dependent deductions, and ABA bulk payment details.')}
        >

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Basic Salary */}
            <div>
              <label className={labelCls}>
                {t('employees.basic_salary', 'Basic Salary ($)')} <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">$</span>
                <input
                  id="field-basic_salary"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basic_salary}
                  onChange={(e) => setFormField('basic_salary', e.target.value)}
                  placeholder="450.00"
                  className={getFieldClass(
                    formErrors.basic_salary,
                    'form-input pl-7 font-mono font-bold rounded-xl'
                  )}
                  required
                />
              </div>
              <FieldError error={formErrors.basic_salary} />
            </div>

            {/* NSSF Number */}
            <div>
              <label className={labelCls}>
                {t('employees.nssf_number', 'NSSF Number')}
              </label>
              <input
                type="text"
                value={formData.nssf_number}
                onChange={(e) => setFormField('nssf_number', e.target.value)}
                placeholder={t('employees.nssfPlaceholder', 'NSSF-098231')}
                className="form-input font-mono rounded-xl"
              />
            </div>

            {/* Dependents Count */}
            <div>
              <label className={labelCls}>
                {t('employees.dependents_count', 'Dependents Count')}
              </label>
              <input
                type="number"
                min="0"
                max="15"
                value={formData.dependents_count}
                onChange={(e) => setFormField('dependents_count', e.target.value)}
                placeholder="0"
                className="form-input font-mono rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground dark:text-slate-400 mt-1.5">
                {t('employees.dependentsHint', 'Deducted for Cambodia Tax ($37.50/ea)')}
              </p>
            </div>

            {/* Bank Name */}
            <div>
              <label className={labelCls}>{t('employees.bank_name', 'Bank Name')}</label>
              <select
                value={formData.bank_name}
                onChange={(e) => setFormField('bank_name', e.target.value)}
                className="form-select cursor-pointer rounded-xl"
              >
                <option value="ABA Bank">{t('employees.bankABA', 'ABA Bank (Advanced Bank of Asia)')}</option>
                <option value="Wing Bank">{t('employees.bankWing', 'Wing Bank')}</option>
                <option value="Canadia Bank">{t('employees.bankCanadia', 'Canadia Bank')}</option>
                <option value="Acleda Bank">{t('employees.bankAcleda', 'Acleda Bank')}</option>
                <option value="Bakong KHQR">{t('employees.bankBakong', 'Bakong Account')}</option>
                <option value="Other">{t('employees.bankOther', 'Other Bank')}</option>
              </select>
            </div>

            {/* Bank Account Number */}
            <div>
              <label className={labelCls}>
                {t('employees.bank_account_number', 'Bank Account Number')}
              </label>
              <input
                type="text"
                value={formData.bank_account_number}
                onChange={(e) => setFormField('bank_account_number', e.target.value)}
                placeholder={t('employees.bankAccountPlaceholder', '000 123 456')}
                className="form-input font-mono rounded-xl"
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className={labelCls}>
                {t('employees.bank_account_holder', 'Bank Account Holder Name')}
              </label>
              <input
                type="text"
                value={formData.bank_account_holder}
                onChange={(e) => setFormField('bank_account_holder', e.target.value)}
                placeholder={t('employees.accountHolderPlaceholder', 'SOK PISEY')}
                className="form-input font-mono uppercase rounded-xl"
              />
            </div>
          </div>
        </FormCard>
      </FormContent>
    </FormLayout>
  )
}

export default EmployeeFormPage
