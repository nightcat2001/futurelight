import {
  createContext,
  type FormEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import './App.css'

type ApiStatus = 'checking' | 'ok' | 'error'
type AuthMode = 'login' | 'register'
type AuthStatus = 'checking' | 'signed_out' | 'signed_in'
type RouteState = 'live' | 'blocked' | 'next'
type RouteId =
  | 'home'
  | 'courses'
  | 'learn'
  | 'practice'
  | 'parent'
  | 'content'
  | 'settings'
  | 'not-found'

type HomeSummary = {
  current_child: string
  recommendation: string
  next_action: string
  completed_units: number
  streak_days: number
  stars: number
}

type CourseSummary = {
  id: string
  slug: string
  status: string
  title: string
  target_language: string
  level: string
  market_regions: string[]
  english_variants: string[]
  cover_asset_path: string | null
  lesson_count: number
}

type AdminCourseRecord = CourseSummary & {
  cover_asset_id: string | null
  created_at: string
  published_at: string | null
  sort_order: number
  updated_at: string
}

type LessonSummary = {
  id: string
  course_id: string
  slug: string
  title: string
  learning_objectives: unknown
  sort_order: number
}

type ActivitySummary = {
  id: string
  lesson_id: string
  slug: string
  activity_type: string
  prompt: unknown
  content: unknown
  answer_key: unknown
  sort_order: number
}

type AssetSummary = {
  id: string
  asset_key: string
  asset_type: string
  path: string | null
  status: string
  source: string | null
  prompt_summary: string | null
  metadata: unknown
}

type ContentVersionRecord = {
  id: string
  entity_type: string
  entity_id: string
  action: string
  actor_parent_account_id: string | null
  snapshot: unknown
  created_at: string
}

type PublishCheckResponse = {
  course_id: string
  can_publish: boolean
  issues: string[]
}

type LearningSession = {
  id: string
  child_id: string
  course_id: string
  lesson_id: string | null
  started_at: string
  completed_at: string | null
}

type AttemptRecord = {
  id: string
  child_id: string
  activity_id: string
  session_id: string | null
  answer: unknown
  is_correct: boolean
  score: number
  duration_ms: number | null
  created_at: string
}

type ProgressRecord = {
  id: string
  child_id: string
  course_id: string
  lesson_id: string | null
  activity_id: string | null
  mastery_score: number
  attempts_count: number
  last_attempt_at: string | null
  updated_at: string
}

type RewardRecord = {
  id: string
  child_id: string
  reward_type: string
  reward_key: string
  source_activity_id: string | null
  awarded_at: string
  metadata: unknown
}

type ConsentRecord = {
  id: string
  parent_account_id: string
  child_id: string | null
  consent_type: string
  status: string
  granted_at: string | null
  revoked_at: string | null
  evidence: unknown
  created_at: string
  updated_at: string
}

type AuditLogRecord = {
  id: string
  actor_parent_account_id: string | null
  child_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  metadata: unknown
  created_at: string
}

type ParentAccount = {
  id: string
  email: string
  display_name: string
  locale: string
  is_content_admin: boolean
  sound_enabled: boolean
  voice_volume: number
  effect_volume: number
  auto_play_voice: boolean
}

type DataExportScope = {
  parent_account_id: string
  child_id: string | null
}

type DataExportPackage = {
  export_format_version: number
  generated_at: string
  scope: DataExportScope
  parent: ParentAccount
  children: ChildProfile[]
  consents: ConsentRecord[]
  learning_sessions: LearningSession[]
  attempts: AttemptRecord[]
  progress_records: ProgressRecord[]
  rewards: RewardRecord[]
  audit_logs: AuditLogRecord[]
}

type DataExportResponse = {
  audit_log: AuditLogRecord
  package: DataExportPackage
}

type ChildProfile = {
  id: string
  parent_account_id: string
  display_name: string
  age_band: string
  market_region: string
  english_variant: string
  avatar_asset_id: string | null
  created_at: string
  updated_at: string
}

type AuthResponse = {
  parent: ParentAccount
  session: {
    token: string
    expires_at: string
  }
}

type MeResponse = {
  parent: ParentAccount
}

type AuthForm = {
  displayName: string
  email: string
  locale: string
  password: string
}

type ChildForm = {
  ageBand: string
  displayName: string
  englishVariant: string
  marketRegion: string
  privacyConsent: boolean
}

type ParentSettingsForm = {
  autoPlayVoice: boolean
  displayName: string
  effectVolume: number
  locale: string
  soundEnabled: boolean
  voiceVolume: number
}

type SoundId =
  | 'ui_click'
  | 'ui_toggle'
  | 'ui_error_soft'
  | 'learning_step_complete'
  | 'learning_unit_complete'
  | 'answer_correct'
  | 'answer_wrong_soft'
  | 'reward_star'
  | 'reward_badge'
  | 'mission_complete'
  | 'page_success'

type SoundSettings = {
  autoPlayVoice: boolean
  effectVolume: number
  soundEnabled: boolean
  voiceVolume: number
}

type SoundController = {
  playSound: (soundId: SoundId) => void
  settings: SoundSettings
}

type ChildLearningSummary = {
  attempts: number
  child: ChildProfile
  mastery: number | string
  records: number
  rewards: RewardRecord[]
  weakSpots: number
}

type ParentGateRequest = {
  reason: string
  reject: (error: ApiRequestError) => void
  resolve: () => void
}

type ParentGateController = {
  requireParentGate: (reason: string) => Promise<void>
}

type AuthController = {
  authBusy: boolean
  authError: string | null
  authForm: AuthForm
  authMode: AuthMode
  authStatus: AuthStatus
  authToken: string | null
  clearLocalAuth: () => void
  parent: ParentAccount | null
  saveParentSettings: (settings: ParentSettingsForm) => Promise<ParentAccount>
  selectAuthMode: (mode: AuthMode) => void
  submitAuth: (event: FormEvent<HTMLFormElement>) => Promise<void>
  updateAuthForm: (field: keyof AuthForm, value: string) => void
  logout: () => Promise<void>
}

type ChildController = {
  childBusy: boolean
  childError: string | null
  childForm: ChildForm
  childStatus: 'idle' | 'loading' | 'ready' | 'error'
  children: ChildProfile[]
  editingChildId: string | null
  cancelChildEdit: () => void
  deleteChild: (childId: string) => Promise<void>
  editChild: (child: ChildProfile) => void
  refreshChildren: () => Promise<void>
  submitChild: (event: FormEvent<HTMLFormElement>) => Promise<void>
  updateChildForm: (field: keyof ChildForm, value: boolean | string) => void
}

type CourseAdminForm = {
  coverAssetId: string
  level: string
  slug: string
  sortOrder: number
  status: string
  targetLanguage: string
  title: string
}

type LessonAdminForm = {
  learningObjectives: string
  slug: string
  sortOrder: number
  title: string
}

type ActivityAdminForm = {
  activityType: string
  answerKey: string
  content: string
  prompt: string
  slug: string
  sortOrder: number
}

type RouteDefinition = {
  id: RouteId
  path: string
  label: string
  title: string
  state: RouteState
}

const authTokenStorageKey = 'futurelight.parentToken'

const defaultSoundSettings: SoundSettings = {
  autoPlayVoice: true,
  effectVolume: 60,
  soundEnabled: true,
  voiceVolume: 100,
}

const soundAssetPaths: Record<SoundId, string> = {
  answer_correct: '/assets/audio/ui/answer_correct.wav',
  answer_wrong_soft: '/assets/audio/ui/answer_wrong_soft.wav',
  learning_step_complete: '/assets/audio/ui/learning_step_complete.wav',
  learning_unit_complete: '/assets/audio/ui/learning_unit_complete.wav',
  mission_complete: '/assets/audio/ui/mission_complete.wav',
  page_success: '/assets/audio/ui/page_success.wav',
  reward_badge: '/assets/audio/ui/reward_badge.wav',
  reward_star: '/assets/audio/ui/reward_star.wav',
  ui_click: '/assets/audio/ui/ui_click.wav',
  ui_error_soft: '/assets/audio/ui/ui_error_soft.wav',
  ui_toggle: '/assets/audio/ui/ui_toggle.wav',
}

const SoundContext = createContext<SoundController>({
  playSound: () => undefined,
  settings: defaultSoundSettings,
})

const routes: RouteDefinition[] = [
  { id: 'home', path: '/', label: 'Home', title: 'Today', state: 'live' },
  { id: 'courses', path: '/courses', label: 'Courses', title: 'Course Library', state: 'live' },
  { id: 'learn', path: '/learn', label: 'Learn', title: 'Learning Player', state: 'live' },
  { id: 'practice', path: '/practice', label: 'Practice', title: 'Practice Game', state: 'live' },
  { id: 'parent', path: '/parent', label: 'Parent', title: 'Parent Center', state: 'live' },
  { id: 'content', path: '/content', label: 'Content', title: 'Content Studio', state: 'live' },
  { id: 'settings', path: '/settings', label: 'Settings', title: 'Settings', state: 'next' },
]

const topNavigationIds: RouteId[] = ['home', 'courses', 'learn', 'parent', 'content']

const notFoundRoute: RouteDefinition = {
  id: 'not-found',
  path: '/404',
  label: 'Missing',
  title: 'Page Not Found',
  state: 'blocked',
}

const apiStatusText: Record<ApiStatus, string> = {
  checking: 'Checking API',
  ok: 'API connected',
  error: 'API unavailable',
}

const authErrorMessages: Record<string, string> = {
  activity_type_required: 'Activity type is required.',
  activity_update_required: 'Change at least one activity field before saving.',
  content_admin_required: 'This account is not enabled for content administration.',
  content_slug_exists: 'That slug already exists.',
  course_update_required: 'Change at least one course field before saving.',
  database_unavailable: 'The local API cannot reach PostgreSQL.',
  display_name_required: 'Display name is required.',
  internal_error: 'The API returned an internal error.',
  invalid_age_band: 'Choose a supported age band.',
  invalid_content_state: 'The requested content state is not allowed.',
  invalid_course_status: 'Choose draft, review, published, or archived.',
  invalid_email: 'Enter a valid email address.',
  invalid_english_variant: 'Choose American or British English.',
  invalid_id: 'The selected record id is invalid.',
  invalid_json: 'One JSON field is not valid.',
  invalid_locale: 'Enter a valid locale such as en-US or en-GB.',
  invalid_market_region: 'Choose a supported market region.',
  invalid_reference: 'The selected related record does not exist.',
  invalid_slug: 'Use lowercase letters, numbers, and hyphens for slugs.',
  invalid_volume: 'Volume must be between 0 and 100.',
  lesson_update_required: 'Change at least one lesson field before saving.',
  level_required: 'Level is required.',
  not_found: 'That record could not be found.',
  parent_account_exists: 'An account already uses that email.',
  parent_gate_cancelled: 'Parent gate was cancelled.',
  parental_consent_required: 'Record parent privacy consent before saving learning data.',
  password_too_short: 'Password must be at least 8 characters.',
  publish_check_failed: 'Resolve publish check issues before publishing.',
  publish_check_required: 'Run publish check before publishing.',
  settings_required: 'Change at least one parent setting before saving.',
  slug_required: 'Slug is required.',
  target_language_required: 'Target language is required.',
  title_required: 'Title is required.',
  unauthorized: 'Email or password is not correct.',
}

function SoundProvider({
  children,
  controller,
}: {
  children: ReactNode
  controller: SoundController
}) {
  return <SoundContext.Provider value={controller}>{children}</SoundContext.Provider>
}

function useSound() {
  return useContext(SoundContext)
}

function useSoundController(parent: ParentAccount | null): SoundController {
  const settings = useMemo<SoundSettings>(
    () => ({
      autoPlayVoice: parent?.auto_play_voice ?? defaultSoundSettings.autoPlayVoice,
      effectVolume: parent?.effect_volume ?? defaultSoundSettings.effectVolume,
      soundEnabled: parent?.sound_enabled ?? defaultSoundSettings.soundEnabled,
      voiceVolume: parent?.voice_volume ?? defaultSoundSettings.voiceVolume,
    }),
    [parent],
  )

  const playSound = useCallback(
    (soundId: SoundId) => {
      if (!settings.soundEnabled || settings.effectVolume <= 0) return

      const audio = new Audio(soundAssetPaths[soundId])
      audio.volume = Math.min(1, Math.max(0, settings.effectVolume / 100))
      audio.play().catch(() => {
        // Browsers may block audio until the first trusted interaction.
      })
    },
    [settings],
  )

  return useMemo(() => ({ playSound, settings }), [playSound, settings])
}

function App() {
  const [locationPath, setLocationPath] = useState(() => normalizedPath(window.location.pathname))
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')
  const [home, setHome] = useState<HomeSummary | null>(null)
  const [courses, setCourses] = useState<CourseSummary[]>([])
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking')
  const [parent, setParent] = useState<ParentAccount | null>(null)
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authForm, setAuthForm] = useState<AuthForm>({
    displayName: '',
    email: '',
    locale: navigator.language || 'en-US',
    password: '',
  })
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [childStatus, setChildStatus] = useState<ChildController['childStatus']>('idle')
  const [childBusy, setChildBusy] = useState(false)
  const [childError, setChildError] = useState<string | null>(null)
  const [editingChildId, setEditingChildId] = useState<string | null>(null)
  const [childForm, setChildForm] = useState<ChildForm>({
    ageBand: '6-8',
    displayName: '',
    englishVariant: 'american',
    marketRegion: 'US',
    privacyConsent: false,
  })
  const [gateBusy, setGateBusy] = useState(false)
  const [gateError, setGateError] = useState<string | null>(null)
  const [gatePassword, setGatePassword] = useState('')
  const [gateRequest, setGateRequest] = useState<ParentGateRequest | null>(null)
  const [gateVerifiedUntil, setGateVerifiedUntil] = useState(0)
  const sound = useSoundController(parent)

  useEffect(() => {
    function handlePopState() {
      setLocationPath(normalizedPath(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadShellData() {
      setApiStatus('checking')
      try {
        const [healthResponse, homeResponse, courseResponse] = await Promise.all([
          fetch('/health', { signal: controller.signal }),
          fetch('/api/home/summary', { signal: controller.signal }),
          fetch('/api/courses', { signal: controller.signal }),
        ])

        if (!healthResponse.ok || !homeResponse.ok || !courseResponse.ok) {
          throw new Error('API response failed')
        }

        setHome(await homeResponse.json())
        setCourses(await courseResponse.json())
        setApiStatus('ok')
      } catch (error) {
        if (controller.signal.aborted) return
        console.error(error)
        setHome(null)
        setCourses([])
        setApiStatus('error')
      }
    }

    loadShellData()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const storedToken = localStorage.getItem(authTokenStorageKey)

    async function loadParent() {
      if (!storedToken) {
        clearAuthState()
        return
      }

      setAuthStatus('checking')
      try {
        const response = await requestJson<MeResponse>('/api/auth/me', {
          headers: bearerHeaders(storedToken),
          signal: controller.signal,
        })
        setAuthToken(storedToken)
        setParent(response.parent)
        setAuthStatus('signed_in')
      } catch (error) {
        if (controller.signal.aborted) return
        console.error(error)
        clearAuthState()
      }
    }

    loadParent()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadChildren() {
      if (authStatus !== 'signed_in' || !authToken) {
        setChildren([])
        setChildStatus('idle')
        return
      }

      setChildStatus('loading')
      setChildError(null)
      try {
        setChildren(await fetchChildren(authToken, controller.signal))
        setChildStatus('ready')
      } catch (error) {
        if (controller.signal.aborted) return
        console.error(error)
        setChildren([])
        setChildStatus('error')
        setChildError(readableApiError(error))
      }
    }

    loadChildren()
    return () => controller.abort()
  }, [authStatus, authToken])

  const activeRoute = useMemo(() => matchRoute(locationPath), [locationPath])
  const topRoutes = routes.filter((route) => topNavigationIds.includes(route.id))

  function navigate(route: RouteDefinition) {
    if (route.id === 'not-found') return
    sound.playSound('ui_click')
    if (normalizedPath(window.location.pathname) !== route.path) {
      window.history.pushState(null, '', route.path)
    }
    setLocationPath(route.path)
  }

  function updateAuthForm(field: keyof AuthForm, value: string) {
    setAuthForm((current) => ({ ...current, [field]: value }))
  }

  function selectAuthMode(mode: AuthMode) {
    setAuthMode(mode)
    setAuthError(null)
  }

  function persistAuth(response: AuthResponse) {
    localStorage.setItem(authTokenStorageKey, response.session.token)
    setAuthToken(response.session.token)
    setParent(response.parent)
    setAuthStatus('signed_in')
    setAuthError(null)
    setAuthForm((current) => ({ ...current, password: '' }))
  }

  function clearAuthState() {
    localStorage.removeItem(authTokenStorageKey)
    setAuthToken(null)
    setParent(null)
    setAuthStatus('signed_out')
    setChildren([])
    setChildStatus('idle')
    setChildError(null)
    setEditingChildId(null)
    setAuthForm((current) => ({ ...current, password: '' }))
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthBusy(true)
    setAuthError(null)

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body =
        authMode === 'login'
          ? { email: authForm.email, password: authForm.password }
          : {
              display_name: authForm.displayName,
              email: authForm.email,
              locale: authForm.locale,
              password: authForm.password,
            }
      const response = await requestJson<AuthResponse>(endpoint, {
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      persistAuth(response)
    } catch (error) {
      setAuthError(readableApiError(error))
    } finally {
      setAuthBusy(false)
    }
  }

  async function logout() {
    if (!authToken) {
      clearAuthState()
      return
    }

    setAuthBusy(true)
    setAuthError(null)
    try {
      const response = await fetch('/api/auth/logout', {
        headers: bearerHeaders(authToken),
        method: 'POST',
      })

      if (!response.ok && response.status !== 401) {
        throw await ApiRequestError.fromResponse(response)
      }

      clearAuthState()
    } catch (error) {
      setAuthError(readableApiError(error))
    } finally {
      setAuthBusy(false)
    }
  }

  function requireParentGate(reason: string) {
    if (!parent) {
      return Promise.reject(new ApiRequestError('unauthorized', 401))
    }

    if (gateVerifiedUntil > Date.now()) {
      return Promise.resolve()
    }

    return new Promise<void>((resolve, reject) => {
      setGatePassword('')
      setGateError(null)
      setGateRequest({ reason, reject, resolve })
    })
  }

  async function submitParentGate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!gateRequest || !parent) return

    setGateBusy(true)
    setGateError(null)
    try {
      const response = await requestJson<AuthResponse>('/api/auth/login', {
        body: JSON.stringify({
          email: parent.email,
          password: gatePassword,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      await fetch('/api/auth/logout', {
        headers: bearerHeaders(response.session.token),
        method: 'POST',
      }).catch(() => undefined)

      const resolve = gateRequest.resolve
      setGateVerifiedUntil(Date.now() + 5 * 60 * 1000)
      setGatePassword('')
      setGateRequest(null)
      resolve()
    } catch (error) {
      setGateError(readableApiError(error))
    } finally {
      setGateBusy(false)
    }
  }

  function cancelParentGate() {
    if (!gateRequest) return

    const reject = gateRequest.reject
    setGateRequest(null)
    setGatePassword('')
    setGateError(null)
    reject(new ApiRequestError('parent_gate_cancelled', 0))
  }

  async function saveParentSettings(settings: ParentSettingsForm) {
    if (!authToken) {
      throw new ApiRequestError('unauthorized', 401)
    }

    await requireParentGate('Save parent settings')
    setAuthBusy(true)
    setAuthError(null)
    try {
      const response = await requestJson<MeResponse>('/api/auth/me', {
        body: JSON.stringify({
          display_name: settings.displayName,
          auto_play_voice: settings.autoPlayVoice,
          effect_volume: settings.effectVolume,
          locale: settings.locale,
          sound_enabled: settings.soundEnabled,
          voice_volume: settings.voiceVolume,
        }),
        headers: jsonHeaders(authToken),
        method: 'PATCH',
      })
      setParent(response.parent)
      sound.playSound('page_success')
      return response.parent
    } catch (error) {
      setAuthError(readableApiError(error))
      throw error
    } finally {
      setAuthBusy(false)
    }
  }

  function updateChildForm(field: keyof ChildForm, value: boolean | string) {
    setChildForm((current) => ({ ...current, [field]: value }))
  }

  function resetChildForm() {
    setChildForm({
      ageBand: '6-8',
      displayName: '',
      englishVariant: 'american',
      marketRegion: 'US',
      privacyConsent: false,
    })
    setEditingChildId(null)
  }

  function editChild(child: ChildProfile) {
    setEditingChildId(child.id)
    setChildError(null)
    setChildForm({
      ageBand: child.age_band,
      displayName: child.display_name,
      englishVariant: child.english_variant,
      marketRegion: child.market_region,
      privacyConsent: false,
    })
  }

  async function refreshChildren(token: string) {
    setChildren(await fetchChildren(token))
    setChildStatus('ready')
  }

  async function refreshCurrentChildren() {
    if (!authToken) return
    setChildStatus('loading')
    setChildError(null)
    try {
      await refreshChildren(authToken)
    } catch (error) {
      setChildStatus('error')
      setChildError(readableApiError(error))
      throw error
    }
  }

  async function submitChild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!authToken) {
      setChildError('Parent session is required.')
      return
    }

    setChildBusy(true)
    setChildError(null)
    try {
      const endpoint = editingChildId ? `/api/children/${editingChildId}` : '/api/children'
      const response = await requestJson<ChildProfile>(endpoint, {
        body: JSON.stringify({
          age_band: childForm.ageBand,
          display_name: childForm.displayName,
          english_variant: childForm.englishVariant,
          market_region: childForm.marketRegion,
        }),
        headers: jsonHeaders(authToken),
        method: editingChildId ? 'PATCH' : 'POST',
      })

      if (childForm.privacyConsent) {
        await recordPrivacyConsent(authToken, response, childForm)
      }

      setChildren((current) => {
        if (!editingChildId) return [response, ...current]
        return current.map((child) => (child.id === response.id ? response : child))
      })
      resetChildForm()
      setChildStatus('ready')
    } catch (error) {
      setChildError(readableApiError(error))
    } finally {
      setChildBusy(false)
    }
  }

  async function deleteChild(childId: string) {
    if (!authToken) {
      setChildError('Parent session is required.')
      return
    }

    try {
      await requireParentGate('Delete child profile')
    } catch (error) {
      setChildError(readableApiError(error))
      return
    }

    setChildBusy(true)
    setChildError(null)
    try {
      const response = await fetch(`/api/children/${childId}`, {
        headers: bearerHeaders(authToken),
        method: 'DELETE',
      })

      if (!response.ok) {
        throw await ApiRequestError.fromResponse(response)
      }

      await refreshChildren(authToken)
      if (editingChildId === childId) resetChildForm()
    } catch (error) {
      setChildError(readableApiError(error))
    } finally {
      setChildBusy(false)
    }
  }

  const auth: AuthController = {
    authBusy,
    authError,
    authForm,
    authMode,
    authStatus,
    authToken,
    clearLocalAuth: clearAuthState,
    parent,
    saveParentSettings,
    selectAuthMode,
    submitAuth,
    updateAuthForm,
    logout,
  }
  const childProfiles: ChildController = {
    cancelChildEdit: resetChildForm,
    childBusy,
    childError,
    childForm,
    childStatus,
    children,
    deleteChild,
    editingChildId,
    editChild,
    refreshChildren: refreshCurrentChildren,
    submitChild,
    updateChildForm,
  }
  const gate: ParentGateController = {
    requireParentGate,
  }

  return (
    <SoundProvider controller={sound}>
      <main className="app-shell">
      <header className="topbar">
        <button className="brand-button" type="button" onClick={() => navigate(routes[0])}>
          <span className="brand-mark">FL</span>
          <span>
            <strong>FutureLight</strong>
            <small>{parent ? parent.display_name : 'Language learning'}</small>
          </span>
        </button>

        <nav aria-label="Primary navigation">
          {topRoutes.map((route) => (
            <button
              aria-current={activeRoute.id === route.id ? 'page' : undefined}
              className={activeRoute.id === route.id ? 'active' : ''}
              key={route.id}
              type="button"
              onClick={() => navigate(route)}
            >
              {route.label}
            </button>
          ))}
        </nav>
      </header>

      <section className={`status-strip ${apiStatus}`} aria-live="polite">
        <span className="status-dot" />
        <span>{apiStatusText[apiStatus]}</span>
        <span className="auth-chip">{authStatusText(authStatus)}</span>
        <span className="status-path">{activeRoute.path}</span>
      </section>

      <div className="workspace-shell">
        <aside className="route-rail" aria-label="All product routes">
          {routes.map((route) => (
            <button
              aria-current={activeRoute.id === route.id ? 'page' : undefined}
              className={activeRoute.id === route.id ? 'active' : ''}
              key={route.id}
              type="button"
              onClick={() => navigate(route)}
            >
              <span>{route.label}</span>
              <small>{route.path}</small>
              <RouteStatePill state={route.state} />
            </button>
          ))}
        </aside>

        <section className="route-stage" aria-live="polite">
          <RouteView
            apiStatus={apiStatus}
            auth={auth}
            childProfiles={childProfiles}
            courses={courses}
            gate={gate}
            home={home}
            navigate={navigate}
            route={activeRoute}
          />
        </section>
      </div>
      {gateRequest && (
        <ParentGateDialog
          busy={gateBusy}
          error={gateError}
          password={gatePassword}
          reason={gateRequest.reason}
          onCancel={cancelParentGate}
          onPasswordChange={setGatePassword}
          onSubmit={submitParentGate}
        />
      )}
      </main>
    </SoundProvider>
  )
}

function RouteView({
  apiStatus,
  auth,
  childProfiles,
  courses,
  gate,
  home,
  navigate,
  route,
}: {
  apiStatus: ApiStatus
  auth: AuthController
  childProfiles: ChildController
  courses: CourseSummary[]
  gate: ParentGateController
  home: HomeSummary | null
  navigate: (route: RouteDefinition) => void
  route: RouteDefinition
}) {
  if (route.id === 'home') {
    return <HomeRoute apiStatus={apiStatus} courses={courses} home={home} navigate={navigate} />
  }

  if (route.id === 'courses') {
    return <CoursesRoute apiStatus={apiStatus} courses={courses} navigate={navigate} />
  }

  if (route.id === 'learn') {
    return <LearnRoute auth={auth} childProfiles={childProfiles} courses={courses} navigate={navigate} />
  }

  if (route.id === 'practice') {
    return <PracticeRoute auth={auth} childProfiles={childProfiles} courses={courses} navigate={navigate} />
  }

  if (route.id === 'parent') {
    return <ParentRoute auth={auth} childProfiles={childProfiles} gate={gate} />
  }

  if (route.id === 'content') {
    return <ContentAdminRoute auth={auth} />
  }

  if (route.id === 'not-found') {
    return (
      <BlockedRoute
        detail="This URL is outside the current FutureLight route registry."
        route={route}
      />
    )
  }

  return <BlockedRoute route={route} />
}

function ParentGateDialog({
  busy,
  error,
  password,
  reason,
  onCancel,
  onPasswordChange,
  onSubmit,
}: {
  busy: boolean
  error: string | null
  password: string
  reason: string
  onCancel: () => void
  onPasswordChange: (password: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}) {
  return (
    <section className="gate-backdrop" role="presentation">
      <form
        aria-labelledby="parent-gate-heading"
        className="parent-gate-dialog"
        onSubmit={onSubmit}
      >
        <p className="eyebrow">Parent Gate</p>
        <h2 id="parent-gate-heading">Confirm Adult Action</h2>
        <p>{reason}</p>
        <label>
          Parent Password
          <input
            autoComplete="current-password"
            autoFocus
            disabled={busy}
            required
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button className="primary-action" disabled={busy} type="submit">
            {busy ? 'Checking' : 'Confirm'}
          </button>
          <button className="secondary-action" disabled={busy} type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

function HomeRoute({
  apiStatus,
  courses,
  home,
  navigate,
}: {
  apiStatus: ApiStatus
  courses: CourseSummary[]
  home: HomeSummary | null
  navigate: (route: RouteDefinition) => void
}) {
  const primaryCourse = courses[0]

  return (
    <>
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">Today</p>
          <h1>Start a focused English session.</h1>
          <p>
            {home
              ? `${home.current_child} is ready for ${home.next_action}.`
              : apiStatus === 'error'
                ? 'The local API is unavailable, so live learning data is paused.'
                : 'Preparing the latest learning state.'}
          </p>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={() => navigate(routes[1])}>
              Open Courses
            </button>
            <button className="secondary-action" type="button" onClick={() => navigate(routes[4])}>
              Parent Center
            </button>
          </div>
        </div>
        <img
          className="hero-art"
          src="/assets/images/course-covers/animal-english-words-cover.png"
          alt="Animal English Words course cover"
        />
      </section>

      <section className="content-grid">
        <article className="info-panel">
          <p className="eyebrow">Progress</p>
          <h2>{home?.recommendation ?? 'Learning state unavailable'}</h2>
          <div className="metric-row">
            <Metric label="Streak" value={home?.streak_days ?? '-'} />
            <Metric label="Units" value={home?.completed_units ?? '-'} />
            <Metric label="Stars" value={home?.stars ?? '-'} />
          </div>
        </article>

        <article className="info-panel">
          <p className="eyebrow">Next Course</p>
          <h2>{displayCourseTitle(primaryCourse)}</h2>
          <p>
            {primaryCourse
              ? `${primaryCourse.lesson_count} lesson ready in PostgreSQL.`
              : 'No course is currently available from the API.'}
          </p>
        </article>
      </section>
    </>
  )
}

function CoursesRoute({
  apiStatus,
  courses,
  navigate,
}: {
  apiStatus: ApiStatus
  courses: CourseSummary[]
  navigate: (route: RouteDefinition) => void
}) {
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null)
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [activities, setActivities] = useState<ActivitySummary[]>([])
  const [courseError, setCourseError] = useState<string | null>(null)
  const [lessonsLoading, setLessonsLoading] = useState(false)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const effectiveSelectedCourseSlug =
    courses.find((course) => course.slug === selectedCourseSlug)?.slug ?? courses[0]?.slug ?? null

  useEffect(() => {
    const controller = new AbortController()

    async function loadLessons() {
      if (!effectiveSelectedCourseSlug) {
        setLessons([])
        setSelectedLessonId(null)
        return
      }

      setLessonsLoading(true)
      setCourseError(null)
      try {
        const response = await requestJson<LessonSummary[]>(
          `/api/courses/${effectiveSelectedCourseSlug}/lessons`,
          { signal: controller.signal },
        )
        setLessons(response)
        setSelectedLessonId(response[0]?.id ?? null)
      } catch (error) {
        if (controller.signal.aborted) return
        setLessons([])
        setSelectedLessonId(null)
        setCourseError(readableApiError(error))
      } finally {
        if (!controller.signal.aborted) setLessonsLoading(false)
      }
    }

    loadLessons()
    return () => controller.abort()
  }, [effectiveSelectedCourseSlug])

  useEffect(() => {
    const controller = new AbortController()

    async function loadActivities() {
      if (!selectedLessonId) {
        setActivities([])
        return
      }

      setActivitiesLoading(true)
      setCourseError(null)
      try {
        setActivities(
          await requestJson<ActivitySummary[]>(`/api/lessons/${selectedLessonId}/activities`, {
            signal: controller.signal,
          }),
        )
      } catch (error) {
        if (controller.signal.aborted) return
        setActivities([])
        setCourseError(readableApiError(error))
      } finally {
        if (!controller.signal.aborted) setActivitiesLoading(false)
      }
    }

    loadActivities()
    return () => controller.abort()
  }, [selectedLessonId])

  const selectedCourse = courses.find((course) => course.slug === effectiveSelectedCourseSlug)
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId)

  return (
    <>
      <section className="route-heading">
        <p className="eyebrow">Courses</p>
        <h1>Course Library</h1>
      </section>

      {apiStatus === 'error' ? (
        <section className="empty-state">
          <h2>Course data unavailable</h2>
          <p>The API must be running before courses can load.</p>
        </section>
      ) : (
        <section className="course-grid">
          {courses.map((course) => (
            <article
              className={course.slug === effectiveSelectedCourseSlug ? 'course-card active' : 'course-card'}
              key={course.id}
            >
              <img
                src={courseCoverPath(course)}
                alt={`${displayCourseTitle(course)} cover`}
              />
              <div>
                <p className="eyebrow">{course.level}</p>
                <h2>{displayCourseTitle(course)}</h2>
                <p>{course.lesson_count} lesson</p>
                <span className="route-state">{course.status}</span>
                <button
                  className="secondary-action inline-action"
                  type="button"
                  onClick={() => setSelectedCourseSlug(course.slug)}
                >
                  View Lessons
                </button>
              </div>
            </article>
          ))}
          {courses.length === 0 && (
            <section className="empty-state">
              <h2>Preparing courses</h2>
              <p>Course records have not loaded yet.</p>
            </section>
          )}
        </section>
      )}

      {selectedCourse && (
        <section className="course-detail-panel">
          <div className="route-heading compact-heading">
            <p className="eyebrow">Selected Course</p>
            <h2>{displayCourseTitle(selectedCourse)}</h2>
          </div>

          {courseError && <p className="form-error">{courseError}</p>}

          <div className="lesson-activity-grid">
            <section>
              <h2>Lessons</h2>
              {lessonsLoading && <p>Loading lessons.</p>}
              {!lessonsLoading && lessons.length === 0 && <p>No lessons returned by the API.</p>}
              <div className="lesson-list">
                {lessons.map((lesson) => (
                  <button
                    className={lesson.id === selectedLessonId ? 'active' : ''}
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedLessonId(lesson.id)}
                  >
                    <span>{lesson.title}</span>
                    <small>{lesson.slug}</small>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2>{selectedLesson?.title ?? 'Activities'}</h2>
              <ObjectiveList lesson={selectedLesson} />
              {activitiesLoading && <p>Loading activities.</p>}
              {!activitiesLoading && activities.length === 0 && <p>No activities returned by the API.</p>}
              <div className="activity-list">
                {activities.map((activity) => (
                  <article className="activity-card" key={activity.id}>
                    <p className="eyebrow">{activity.activity_type}</p>
                    <h2>{activity.slug}</h2>
                    <p>{activityPrompt(activity)}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      )}

      <button className="secondary-action inline-action" type="button" onClick={() => navigate(routes[2])}>
        Open Learning Player
      </button>
    </>
  )
}

function LearnRoute({
  auth,
  childProfiles,
  courses,
  navigate,
}: {
  auth: AuthController
  childProfiles: ChildController
  courses: CourseSummary[]
  navigate: (route: RouteDefinition) => void
}) {
  const sound = useSound()
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null)
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [activities, setActivities] = useState<ActivitySummary[]>([])
  const [activityIndex, setActivityIndex] = useState(0)
  const [learningSession, setLearningSession] = useState<LearningSession | null>(null)
  const [progressRows, setProgressRows] = useState<ProgressRecord[]>([])
  const [rewardRows, setRewardRows] = useState<RewardRecord[]>([])
  const [learningBusy, setLearningBusy] = useState(false)
  const [learningError, setLearningError] = useState<string | null>(null)

  const effectiveChildId =
    childProfiles.children.find((child) => child.id === selectedChildId)?.id ??
    childProfiles.children[0]?.id ??
    null
  const selectedChild = childProfiles.children.find((child) => child.id === effectiveChildId) ?? null
  const contentSelectionKey = selectedChild
    ? `${selectedChild.market_region}:${selectedChild.english_variant}`
    : ''
  const availableCourses = useMemo(
    () => courses.filter((course) => courseMatchesChild(course, selectedChild)),
    [courses, selectedChild],
  )
  const effectiveCourseSlug =
    availableCourses.find((course) => course.slug === selectedCourseSlug)?.slug ??
    availableCourses[0]?.slug ??
    null
  const selectedCourse = availableCourses.find((course) => course.slug === effectiveCourseSlug)
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId)
  const selectedActivity = activities[activityIndex] ?? activities[0]

  useEffect(() => {
    const controller = new AbortController()

    async function loadLessons() {
      if (!effectiveCourseSlug) {
        setLessons([])
        setSelectedLessonId(null)
        return
      }

      try {
        const response = await requestJson<LessonSummary[]>(
          contentSelectionUrl(`/api/courses/${effectiveCourseSlug}/lessons`, selectedChild),
          { signal: controller.signal },
        )
        setLessons(response)
        setSelectedLessonId(response[0]?.id ?? null)
        setActivityIndex(0)
      } catch (error) {
        if (controller.signal.aborted) return
        setLessons([])
        setSelectedLessonId(null)
        setLearningError(readableApiError(error))
      }
    }

    loadLessons()
    return () => controller.abort()
  }, [effectiveCourseSlug, contentSelectionKey, selectedChild])

  useEffect(() => {
    const controller = new AbortController()

    async function loadActivities() {
      if (!selectedLessonId) {
        setActivities([])
        return
      }

      try {
        setActivities(
          await requestJson<ActivitySummary[]>(
            contentSelectionUrl(`/api/lessons/${selectedLessonId}/activities`, selectedChild),
            {
              signal: controller.signal,
            },
          ),
        )
        setActivityIndex(0)
      } catch (error) {
        if (controller.signal.aborted) return
        setActivities([])
        setLearningError(readableApiError(error))
      }
    }

    loadActivities()
    return () => controller.abort()
  }, [selectedLessonId, contentSelectionKey, selectedChild])

  useEffect(() => {
    const controller = new AbortController()

    async function loadProgressAndRewards() {
      if (!auth.authToken || !effectiveChildId) {
        setProgressRows([])
        setRewardRows([])
        return
      }

      try {
        const [progress, rewards] = await Promise.all([
          fetchProgress(auth.authToken, effectiveChildId, controller.signal),
          fetchRewards(auth.authToken, effectiveChildId, controller.signal),
        ])
        setProgressRows(progress)
        setRewardRows(rewards)
      } catch (error) {
        if (controller.signal.aborted) return
        setProgressRows([])
        setRewardRows([])
        setLearningError(readableApiError(error))
      }
    }

    loadProgressAndRewards()
    return () => controller.abort()
  }, [auth.authToken, effectiveChildId])

  async function startSession() {
    if (!auth.authToken || !effectiveChildId || !selectedCourse) {
      setLearningError('Parent, child, and course are required.')
      return null
    }

    setLearningBusy(true)
    setLearningError(null)
    try {
      const session = await requestJson<LearningSession>('/api/learning/sessions', {
        body: JSON.stringify({
          child_id: effectiveChildId,
          course_id: selectedCourse.id,
          lesson_id: selectedLessonId,
        }),
        headers: jsonHeaders(auth.authToken),
        method: 'POST',
      })
      setLearningSession(session)
      return session
    } catch (error) {
      setLearningError(readableApiError(error))
      return null
    } finally {
      setLearningBusy(false)
    }
  }

  async function recordAttempt(isCorrect: boolean) {
    if (!auth.authToken || !effectiveChildId || !selectedActivity) {
      setLearningError('A child and activity are required.')
      return
    }

    setLearningBusy(true)
    setLearningError(null)
    try {
      let session = learningSession
      if (!session || session.completed_at) {
        session = await startSession()
      }
      if (!session) return

      await requestJson<unknown>('/api/learning/attempts', {
        body: JSON.stringify({
          activity_id: selectedActivity.id,
          answer: { activity_slug: selectedActivity.slug, source: 'learning_player' },
          child_id: effectiveChildId,
          duration_ms: 0,
          is_correct: isCorrect,
          score: isCorrect ? 100 : 40,
          session_id: session.id,
        }),
        headers: jsonHeaders(auth.authToken),
        method: 'POST',
      })

      const [progress, rewards] = await Promise.all([
        fetchProgress(auth.authToken, effectiveChildId),
        fetchRewards(auth.authToken, effectiveChildId),
      ])
      setProgressRows(progress)
      setRewardRows(rewards)
      sound.playSound(isCorrect ? 'answer_correct' : 'answer_wrong_soft')
      setActivityIndex((current) => Math.min(current + 1, Math.max(activities.length - 1, 0)))
    } catch (error) {
      setLearningError(readableApiError(error))
    } finally {
      setLearningBusy(false)
    }
  }

  async function completeSession() {
    if (!auth.authToken || !learningSession) return

    setLearningBusy(true)
    setLearningError(null)
    try {
      setLearningSession(
        await requestJson<LearningSession>(
          `/api/learning/sessions/${learningSession.id}/complete`,
          {
            headers: bearerHeaders(auth.authToken),
            method: 'PATCH',
          },
        ),
      )
      sound.playSound('learning_unit_complete')
    } catch (error) {
      setLearningError(readableApiError(error))
    } finally {
      setLearningBusy(false)
    }
  }

  if (auth.authStatus !== 'signed_in') {
    return (
      <>
        <section className="route-heading">
          <p className="eyebrow">Learn</p>
          <h1>Learning Player</h1>
        </section>
        <section className="empty-state">
          <h2>Parent sign-in required</h2>
          <p>Learning attempts are saved only after a parent session is active.</p>
          <button className="primary-action inline-action" type="button" onClick={() => navigate(routes[4])}>
            Parent Center
          </button>
        </section>
      </>
    )
  }

  if (childProfiles.children.length === 0) {
    return (
      <>
        <section className="route-heading">
          <p className="eyebrow">Learn</p>
          <h1>Learning Player</h1>
        </section>
        <section className="empty-state">
          <h2>Create a child profile first</h2>
          <p>Learning sessions need a child profile for progress tracking.</p>
          <button className="primary-action inline-action" type="button" onClick={() => navigate(routes[4])}>
            Parent Center
          </button>
        </section>
      </>
    )
  }

  return (
    <>
      <section className="route-heading">
        <p className="eyebrow">Learn</p>
        <h1>Learning Player</h1>
      </section>

      <section className="learning-grid">
        <article className="info-panel">
          <p className="eyebrow">Setup</p>
          <label>
            Child
            <select
              value={effectiveChildId ?? ''}
              onChange={(event) => {
                setSelectedChildId(event.target.value)
                setLearningSession(null)
              }}
            >
              {childProfiles.children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.display_name}
                </option>
              ))}
            </select>
          </label>
          {selectedChild && (
            <p className="selection-note">
              {selectedChild.market_region} / {selectedChild.english_variant}
            </p>
          )}
          <label>
            Course
            <select
              value={effectiveCourseSlug ?? ''}
              onChange={(event) => {
                setSelectedCourseSlug(event.target.value)
                setLearningSession(null)
              }}
            >
              {availableCourses.map((course) => (
                <option key={course.id} value={course.slug}>
                  {displayCourseTitle(course)}
                </option>
              ))}
            </select>
          </label>
          <div className="lesson-list">
            {lessons.map((lesson) => (
              <button
                className={lesson.id === selectedLessonId ? 'active' : ''}
                key={lesson.id}
                type="button"
                onClick={() => {
                  setSelectedLessonId(lesson.id)
                  setLearningSession(null)
                }}
              >
                <span>{lesson.title}</span>
                <small>{lesson.slug}</small>
              </button>
            ))}
          </div>
          <button className="primary-action inline-action" disabled={learningBusy} type="button" onClick={startSession}>
            {learningSession && !learningSession.completed_at ? 'Session Started' : 'Start Session'}
          </button>
        </article>

        <article className="activity-player">
          <p className="eyebrow">{selectedLesson?.title ?? 'Activity'}</p>
          <h2>{selectedActivity?.slug ?? 'No activity selected'}</h2>
          <p>{selectedActivity ? activityPrompt(selectedActivity) : 'No activity returned by the API.'}</p>
          {learningError && <p className="form-error">{learningError}</p>}
          <div className="form-actions">
            <button
              className="primary-action"
              disabled={learningBusy || !selectedActivity}
              type="button"
              onClick={() => recordAttempt(true)}
            >
              Mark Correct
            </button>
            <button
              className="secondary-action"
              disabled={learningBusy || !selectedActivity}
              type="button"
              onClick={() => recordAttempt(false)}
            >
              Needs Practice
            </button>
            <button
              className="secondary-action"
              disabled={learningBusy || !learningSession || Boolean(learningSession.completed_at)}
              type="button"
              onClick={completeSession}
            >
              Complete Session
            </button>
          </div>
        </article>

        <article className="info-panel">
          <p className="eyebrow">Progress</p>
          <div className="metric-row">
            <Metric label="Records" value={progressRows.length} />
            <Metric label="Attempts" value={progressRows.reduce((sum, row) => sum + row.attempts_count, 0)} />
            <Metric label="Mastery" value={averageMastery(progressRows)} />
            <Metric label="Rewards" value={rewardRows.length} />
          </div>
          <RewardList rewards={rewardRows} />
        </article>
      </section>
    </>
  )
}

function PracticeRoute({
  auth,
  childProfiles,
  courses,
  navigate,
}: {
  auth: AuthController
  childProfiles: ChildController
  courses: CourseSummary[]
  navigate: (route: RouteDefinition) => void
}) {
  const sound = useSound()
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null)
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [activities, setActivities] = useState<ActivitySummary[]>([])
  const [progressRows, setProgressRows] = useState<ProgressRecord[]>([])
  const [rewardRows, setRewardRows] = useState<RewardRecord[]>([])
  const [practiceBusy, setPracticeBusy] = useState(false)
  const [practiceError, setPracticeError] = useState<string | null>(null)
  const [practiceResult, setPracticeResult] = useState<string | null>(null)

  const effectiveChildId =
    childProfiles.children.find((child) => child.id === selectedChildId)?.id ??
    childProfiles.children[0]?.id ??
    null
  const selectedChild = childProfiles.children.find((child) => child.id === effectiveChildId) ?? null
  const contentSelectionKey = selectedChild
    ? `${selectedChild.market_region}:${selectedChild.english_variant}`
    : ''
  const availableCourses = useMemo(
    () => courses.filter((course) => courseMatchesChild(course, selectedChild)),
    [courses, selectedChild],
  )
  const effectiveCourseSlug =
    availableCourses.find((course) => course.slug === selectedCourseSlug)?.slug ??
    availableCourses[0]?.slug ??
    null
  const selectedCourse = availableCourses.find((course) => course.slug === effectiveCourseSlug)
  const practiceActivity = activities.find((activity) => activityChoices(activity).length > 0)
  const choices = activityChoices(practiceActivity)
  const correctAnswer = activityCorrectAnswer(practiceActivity)

  useEffect(() => {
    const controller = new AbortController()

    async function loadLessons() {
      if (!effectiveCourseSlug) {
        setLessons([])
        setSelectedLessonId(null)
        return
      }

      try {
        const response = await requestJson<LessonSummary[]>(
          contentSelectionUrl(`/api/courses/${effectiveCourseSlug}/lessons`, selectedChild),
          { signal: controller.signal },
        )
        setLessons(response)
        setSelectedLessonId(response[0]?.id ?? null)
      } catch (error) {
        if (controller.signal.aborted) return
        setLessons([])
        setSelectedLessonId(null)
        setPracticeError(readableApiError(error))
      }
    }

    loadLessons()
    return () => controller.abort()
  }, [effectiveCourseSlug, contentSelectionKey, selectedChild])

  useEffect(() => {
    const controller = new AbortController()

    async function loadActivities() {
      if (!selectedLessonId) {
        setActivities([])
        return
      }

      try {
        setActivities(
          await requestJson<ActivitySummary[]>(
            contentSelectionUrl(`/api/lessons/${selectedLessonId}/activities`, selectedChild),
            {
              signal: controller.signal,
            },
          ),
        )
      } catch (error) {
        if (controller.signal.aborted) return
        setActivities([])
        setPracticeError(readableApiError(error))
      }
    }

    loadActivities()
    return () => controller.abort()
  }, [selectedLessonId, contentSelectionKey, selectedChild])

  useEffect(() => {
    const controller = new AbortController()

    async function loadProgressAndRewards() {
      if (!auth.authToken || !effectiveChildId) {
        setProgressRows([])
        setRewardRows([])
        return
      }

      try {
        const [progress, rewards] = await Promise.all([
          fetchProgress(auth.authToken, effectiveChildId, controller.signal),
          fetchRewards(auth.authToken, effectiveChildId, controller.signal),
        ])
        setProgressRows(progress)
        setRewardRows(rewards)
      } catch (error) {
        if (controller.signal.aborted) return
        setProgressRows([])
        setRewardRows([])
        setPracticeError(readableApiError(error))
      }
    }

    loadProgressAndRewards()
    return () => controller.abort()
  }, [auth.authToken, effectiveChildId])

  async function chooseAnswer(choice: string) {
    if (!auth.authToken || !effectiveChildId || !practiceActivity || !correctAnswer) {
      setPracticeError('A child and practice activity are required.')
      return
    }

    const isCorrect = choice === correctAnswer
    setPracticeBusy(true)
    setPracticeError(null)
    try {
      await requestJson<unknown>('/api/learning/attempts', {
        body: JSON.stringify({
          activity_id: practiceActivity.id,
          answer: { choice, source: 'practice_game' },
          child_id: effectiveChildId,
          duration_ms: 0,
          is_correct: isCorrect,
          score: isCorrect ? 100 : 0,
          session_id: null,
        }),
        headers: jsonHeaders(auth.authToken),
        method: 'POST',
      })
      setPracticeResult(isCorrect ? 'Correct' : 'Needs practice')
      sound.playSound(isCorrect ? 'answer_correct' : 'answer_wrong_soft')
      const [progress, rewards] = await Promise.all([
        fetchProgress(auth.authToken, effectiveChildId),
        fetchRewards(auth.authToken, effectiveChildId),
      ])
      setProgressRows(progress)
      setRewardRows(rewards)
    } catch (error) {
      setPracticeError(readableApiError(error))
    } finally {
      setPracticeBusy(false)
    }
  }

  if (auth.authStatus !== 'signed_in') {
    return (
      <>
        <section className="route-heading">
          <p className="eyebrow">Practice</p>
          <h1>Practice Game</h1>
        </section>
        <section className="empty-state">
          <h2>Parent sign-in required</h2>
          <p>Practice attempts are saved only after a parent session is active.</p>
          <button className="primary-action inline-action" type="button" onClick={() => navigate(routes[4])}>
            Parent Center
          </button>
        </section>
      </>
    )
  }

  if (childProfiles.children.length === 0) {
    return (
      <>
        <section className="route-heading">
          <p className="eyebrow">Practice</p>
          <h1>Practice Game</h1>
        </section>
        <section className="empty-state">
          <h2>Create a child profile first</h2>
          <p>Practice attempts need a child profile for progress tracking.</p>
          <button className="primary-action inline-action" type="button" onClick={() => navigate(routes[4])}>
            Parent Center
          </button>
        </section>
      </>
    )
  }

  return (
    <>
      <section className="route-heading">
        <p className="eyebrow">Practice</p>
        <h1>Practice Game</h1>
      </section>

      <section className="practice-grid">
        <article className="info-panel">
          <p className="eyebrow">Setup</p>
          <label>
            Child
            <select value={effectiveChildId ?? ''} onChange={(event) => setSelectedChildId(event.target.value)}>
              {childProfiles.children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.display_name}
                </option>
              ))}
            </select>
          </label>
          {selectedChild && (
            <p className="selection-note">
              {selectedChild.market_region} / {selectedChild.english_variant}
            </p>
          )}
          <label>
            Course
            <select value={effectiveCourseSlug ?? ''} onChange={(event) => setSelectedCourseSlug(event.target.value)}>
              {availableCourses.map((course) => (
                <option key={course.id} value={course.slug}>
                  {displayCourseTitle(course)}
                </option>
              ))}
            </select>
          </label>
          <div className="lesson-list">
            {lessons.map((lesson) => (
              <button
                className={lesson.id === selectedLessonId ? 'active' : ''}
                key={lesson.id}
                type="button"
                onClick={() => setSelectedLessonId(lesson.id)}
              >
                <span>{lesson.title}</span>
                <small>{lesson.slug}</small>
              </button>
            ))}
          </div>
        </article>

        <article className="activity-player">
          <p className="eyebrow">{selectedCourse ? displayCourseTitle(selectedCourse) : 'Practice'}</p>
          <h2>{practiceActivity?.prompt ? activityPrompt(practiceActivity) : 'No practice activity'}</h2>
          <div className="choice-grid">
            {choices.map((choice) => (
              <button
                className="choice-button"
                disabled={practiceBusy}
                key={choice}
                type="button"
                onClick={() => chooseAnswer(choice)}
              >
                {choice}
              </button>
            ))}
          </div>
          {practiceResult && <p className="result-banner">{practiceResult}</p>}
          {practiceError && <p className="form-error">{practiceError}</p>}
        </article>

        <article className="info-panel">
          <p className="eyebrow">Progress</p>
          <div className="metric-row">
            <Metric label="Records" value={progressRows.length} />
            <Metric label="Attempts" value={progressRows.reduce((sum, row) => sum + row.attempts_count, 0)} />
            <Metric label="Mastery" value={averageMastery(progressRows)} />
            <Metric label="Rewards" value={rewardRows.length} />
          </div>
          <RewardList rewards={rewardRows} />
        </article>
      </section>
    </>
  )
}

function ObjectiveList({ lesson }: { lesson?: LessonSummary }) {
  const objectives = Array.isArray(lesson?.learning_objectives)
    ? lesson.learning_objectives.filter((item): item is string => typeof item === 'string')
    : []

  if (objectives.length === 0) return null

  return (
    <ul className="objective-list">
      {objectives.map((objective) => (
        <li key={objective}>{objective}</li>
      ))}
    </ul>
  )
}

function ContentAdminRoute({ auth }: { auth: AuthController }) {
  const [adminCourses, setAdminCourses] = useState<AdminCourseRecord[]>([])
  const [assets, setAssets] = useState<AssetSummary[]>([])
  const [versions, setVersions] = useState<ContentVersionRecord[]>([])
  const [lessons, setLessons] = useState<LessonSummary[]>([])
  const [activities, setActivities] = useState<ActivitySummary[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const [courseForm, setCourseForm] = useState<CourseAdminForm>(emptyCourseAdminForm())
  const [lessonForm, setLessonForm] = useState<LessonAdminForm>(emptyLessonAdminForm())
  const [activityForm, setActivityForm] = useState<ActivityAdminForm>(emptyActivityAdminForm())
  const [publishCheck, setPublishCheck] = useState<PublishCheckResponse | null>(null)
  const [adminBusy, setAdminBusy] = useState(false)
  const [adminError, setAdminError] = useState<string | null>(null)

  const selectedCourse = adminCourses.find((course) => course.id === selectedCourseId) ?? null
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) ?? null
  const selectedActivity = activities.find((activity) => activity.id === selectedActivityId) ?? null
  const coverAssets = assets.filter((asset) => asset.asset_type === 'course_cover')
  const wordCardAssets = assets.filter((asset) => asset.asset_type === 'word_card')

  useEffect(() => {
    if (auth.authStatus !== 'signed_in' || !auth.authToken || !auth.parent?.is_content_admin) {
      return
    }

    const controller = new AbortController()
    loadAdminShell(controller.signal)
    return () => controller.abort()

    async function loadAdminShell(signal: AbortSignal) {
      setAdminBusy(true)
      setAdminError(null)
      try {
        const [courseRows, assetRows, versionRows] = await Promise.all([
          requestJson<AdminCourseRecord[]>('/api/admin/courses', {
            headers: bearerHeaders(auth.authToken as string),
            signal,
          }),
          requestJson<AssetSummary[]>('/api/admin/assets', {
            headers: bearerHeaders(auth.authToken as string),
            signal,
          }),
          requestJson<ContentVersionRecord[]>('/api/admin/content-versions', {
            headers: bearerHeaders(auth.authToken as string),
            signal,
          }),
        ])
        setAdminCourses(courseRows)
        setAssets(assetRows)
        setVersions(versionRows)
        const nextCourse = courseRows.find((course) => course.id === selectedCourseId) ?? courseRows[0] ?? null
        setSelectedCourseId(nextCourse?.id ?? null)
        if (nextCourse) setCourseForm(courseAdminFormFromCourse(nextCourse))
      } catch (error) {
        if (signal.aborted) return
        setAdminError(readableApiError(error))
      } finally {
        if (!signal.aborted) setAdminBusy(false)
      }
    }
  }, [auth.authStatus, auth.authToken, auth.parent?.is_content_admin, selectedCourseId])

  useEffect(() => {
    if (!auth.authToken || !selectedCourseId) {
      return
    }

    const controller = new AbortController()
    requestJson<LessonSummary[]>(`/api/admin/courses/${selectedCourseId}/lessons`, {
      headers: bearerHeaders(auth.authToken),
      signal: controller.signal,
    })
      .then((rows) => {
        setLessons(rows)
        const nextLesson = rows.find((lesson) => lesson.id === selectedLessonId) ?? rows[0] ?? null
        setSelectedLessonId(nextLesson?.id ?? null)
        setLessonForm(nextLesson ? lessonAdminFormFromLesson(nextLesson) : emptyLessonAdminForm())
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setLessons([])
        setSelectedLessonId(null)
        setAdminError(readableApiError(error))
      })

    return () => controller.abort()
  }, [auth.authToken, selectedCourseId, selectedLessonId])

  useEffect(() => {
    if (!auth.authToken || !selectedLessonId) {
      return
    }

    const controller = new AbortController()
    requestJson<ActivitySummary[]>(`/api/admin/lessons/${selectedLessonId}/activities`, {
      headers: bearerHeaders(auth.authToken),
      signal: controller.signal,
    })
      .then((rows) => {
        setActivities(rows)
        const nextActivity =
          rows.find((activity) => activity.id === selectedActivityId) ?? rows[0] ?? null
        setSelectedActivityId(nextActivity?.id ?? null)
        setActivityForm(nextActivity ? activityAdminFormFromActivity(nextActivity) : emptyActivityAdminForm())
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setActivities([])
        setSelectedActivityId(null)
        setAdminError(readableApiError(error))
      })

    return () => controller.abort()
  }, [auth.authToken, selectedLessonId, selectedActivityId])

  if (auth.authStatus !== 'signed_in') {
    return (
      <section className="route-heading">
        <p className="eyebrow">Content Studio</p>
        <h1>Sign in to manage content.</h1>
      </section>
    )
  }

  if (!auth.parent?.is_content_admin) {
    return (
      <section className="route-state blocked">
        <h2>Content admin required</h2>
        <p>{authErrorMessages.content_admin_required}</p>
      </section>
    )
  }

  async function refreshVersions() {
    if (!auth.authToken) return
    setVersions(
      await requestJson<ContentVersionRecord[]>('/api/admin/content-versions', {
        headers: bearerHeaders(auth.authToken),
      }),
    )
  }

  async function refreshCourses(nextCourseId?: string) {
    if (!auth.authToken) return
    const rows = await requestJson<AdminCourseRecord[]>('/api/admin/courses', {
      headers: bearerHeaders(auth.authToken),
    })
    setAdminCourses(rows)
    const nextCourse = rows.find((course) => course.id === (nextCourseId ?? selectedCourseId)) ?? rows[0] ?? null
    setSelectedCourseId(nextCourse?.id ?? null)
    setCourseForm(nextCourse ? courseAdminFormFromCourse(nextCourse) : emptyCourseAdminForm())
  }

  async function submitCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!auth.authToken) return
    setAdminBusy(true)
    setAdminError(null)
    try {
      const body = JSON.stringify(courseAdminPayload(courseForm))
      const course = selectedCourse
        ? await requestJson<AdminCourseRecord>(`/api/admin/courses/${selectedCourse.id}`, {
            body,
            headers: jsonHeaders(auth.authToken),
            method: 'PATCH',
          })
        : await requestJson<AdminCourseRecord>('/api/admin/courses', {
            body,
            headers: jsonHeaders(auth.authToken),
            method: 'POST',
          })
      setSelectedCourseId(course.id)
      setCourseForm(courseAdminFormFromCourse(course))
      await refreshCourses(course.id)
      await refreshVersions()
    } catch (error) {
      setAdminError(readableApiError(error))
    } finally {
      setAdminBusy(false)
    }
  }

  async function archiveCourse() {
    if (!auth.authToken || !selectedCourse) return
    setAdminBusy(true)
    setAdminError(null)
    try {
      const course = await requestJson<AdminCourseRecord>(`/api/admin/courses/${selectedCourse.id}`, {
        headers: bearerHeaders(auth.authToken),
        method: 'DELETE',
      })
      setCourseForm(courseAdminFormFromCourse(course))
      await refreshCourses(course.id)
      await refreshVersions()
    } catch (error) {
      setAdminError(readableApiError(error))
    } finally {
      setAdminBusy(false)
    }
  }

  async function submitLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!auth.authToken || !selectedCourse) return
    setAdminBusy(true)
    setAdminError(null)
    try {
      const body = JSON.stringify(lessonAdminPayload(lessonForm))
      const lesson = selectedLesson
        ? await requestJson<LessonSummary>(`/api/admin/lessons/${selectedLesson.id}`, {
            body,
            headers: jsonHeaders(auth.authToken),
            method: 'PATCH',
          })
        : await requestJson<LessonSummary>(`/api/admin/courses/${selectedCourse.id}/lessons`, {
            body,
            headers: jsonHeaders(auth.authToken),
            method: 'POST',
          })
      setSelectedLessonId(lesson.id)
      setLessonForm(lessonAdminFormFromLesson(lesson))
      setLessons(await requestJson<LessonSummary[]>(`/api/admin/courses/${selectedCourse.id}/lessons`, {
        headers: bearerHeaders(auth.authToken),
      }))
      await refreshVersions()
    } catch (error) {
      setAdminError(readableApiError(error))
    } finally {
      setAdminBusy(false)
    }
  }

  async function deleteLesson() {
    if (!auth.authToken || !selectedCourse || !selectedLesson) return
    setAdminBusy(true)
    setAdminError(null)
    try {
      await requestJson<unknown>(`/api/admin/lessons/${selectedLesson.id}`, {
        headers: bearerHeaders(auth.authToken),
        method: 'DELETE',
      })
      const rows = await requestJson<LessonSummary[]>(`/api/admin/courses/${selectedCourse.id}/lessons`, {
        headers: bearerHeaders(auth.authToken),
      })
      setLessons(rows)
      setSelectedLessonId(rows[0]?.id ?? null)
      setLessonForm(rows[0] ? lessonAdminFormFromLesson(rows[0]) : emptyLessonAdminForm())
      await refreshVersions()
    } catch (error) {
      setAdminError(readableApiError(error))
    } finally {
      setAdminBusy(false)
    }
  }

  async function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!auth.authToken || !selectedLesson) return
    setAdminBusy(true)
    setAdminError(null)
    try {
      const body = JSON.stringify(activityAdminPayload(activityForm))
      const activity = selectedActivity
        ? await requestJson<ActivitySummary>(`/api/admin/activities/${selectedActivity.id}`, {
            body,
            headers: jsonHeaders(auth.authToken),
            method: 'PATCH',
          })
        : await requestJson<ActivitySummary>(`/api/admin/lessons/${selectedLesson.id}/activities`, {
            body,
            headers: jsonHeaders(auth.authToken),
            method: 'POST',
          })
      setSelectedActivityId(activity.id)
      setActivityForm(activityAdminFormFromActivity(activity))
      setActivities(await requestJson<ActivitySummary[]>(`/api/admin/lessons/${selectedLesson.id}/activities`, {
        headers: bearerHeaders(auth.authToken),
      }))
      await refreshVersions()
    } catch (error) {
      setAdminError(readableApiError(error))
    } finally {
      setAdminBusy(false)
    }
  }

  async function deleteActivity() {
    if (!auth.authToken || !selectedLesson || !selectedActivity) return
    setAdminBusy(true)
    setAdminError(null)
    try {
      await requestJson<unknown>(`/api/admin/activities/${selectedActivity.id}`, {
        headers: bearerHeaders(auth.authToken),
        method: 'DELETE',
      })
      const rows = await requestJson<ActivitySummary[]>(
        `/api/admin/lessons/${selectedLesson.id}/activities`,
        {
          headers: bearerHeaders(auth.authToken),
        },
      )
      setActivities(rows)
      setSelectedActivityId(rows[0]?.id ?? null)
      setActivityForm(rows[0] ? activityAdminFormFromActivity(rows[0]) : emptyActivityAdminForm())
      await refreshVersions()
    } catch (error) {
      setAdminError(readableApiError(error))
    } finally {
      setAdminBusy(false)
    }
  }

  async function runPublishCheck() {
    if (!auth.authToken || !selectedCourse) return
    setAdminBusy(true)
    setAdminError(null)
    try {
      setPublishCheck(
        await requestJson<PublishCheckResponse>(
          `/api/admin/courses/${selectedCourse.id}/publish-check`,
          {
            headers: bearerHeaders(auth.authToken),
            method: 'POST',
          },
        ),
      )
      await refreshVersions()
    } catch (error) {
      setAdminError(readableApiError(error))
    } finally {
      setAdminBusy(false)
    }
  }

  function applyWordCardAsset(assetKey: string) {
    if (!assetKey) return
    let content: Record<string, unknown>
    try {
      content = objectValue(parseJsonDraft(activityForm.content)) ?? {}
    } catch (error) {
      setAdminError(readableApiError(error))
      return
    }
    setActivityForm((current) => ({
      ...current,
      content: JSON.stringify({ ...content, image_asset_key: assetKey }, null, 2),
    }))
  }

  return (
    <>
      <section className="route-heading">
        <p className="eyebrow">Content Studio</p>
        <h1>Manage courses, lessons, activities, and publish checks.</h1>
      </section>

      {adminError && <p className="form-error">{adminError}</p>}

      <section className="cms-layout">
        <aside className="cms-sidebar">
          <div className="cms-panel-head">
            <h2>Courses</h2>
            <button
              className="secondary-action inline-action"
              type="button"
              onClick={() => {
                setSelectedCourseId(null)
                setLessons([])
                setActivities([])
                setCourseForm(emptyCourseAdminForm())
                setLessonForm(emptyLessonAdminForm())
                setActivityForm(emptyActivityAdminForm())
              }}
            >
              New
            </button>
          </div>
          <div className="lesson-list">
            {adminCourses.map((course) => (
              <button
                className={course.id === selectedCourseId ? 'active' : ''}
                key={course.id}
                type="button"
                onClick={() => {
                  setSelectedCourseId(course.id)
                  setCourseForm(courseAdminFormFromCourse(course))
                  setPublishCheck(null)
                }}
              >
                <span>{course.title}</span>
                <small>{course.status} · {course.slug}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="cms-main">
          <form className="admin-form" onSubmit={submitCourse}>
            <div className="cms-panel-head">
              <h2>{selectedCourse ? 'Course' : 'New Course'}</h2>
              <button className="primary-action inline-action" disabled={adminBusy} type="submit">
                Save
              </button>
            </div>
            <div className="field-grid">
              <label>
                Slug
                <input
                  required
                  value={courseForm.slug}
                  onChange={(event) => setCourseForm({ ...courseForm, slug: event.target.value })}
                />
              </label>
              <label>
                Title
                <input
                  required
                  value={courseForm.title}
                  onChange={(event) => setCourseForm({ ...courseForm, title: event.target.value })}
                />
              </label>
              <label>
                Target Language
                <input
                  required
                  value={courseForm.targetLanguage}
                  onChange={(event) =>
                    setCourseForm({ ...courseForm, targetLanguage: event.target.value })
                  }
                />
              </label>
              <label>
                Level
                <input
                  required
                  value={courseForm.level}
                  onChange={(event) => setCourseForm({ ...courseForm, level: event.target.value })}
                />
              </label>
              <label>
                Status
                <select
                  value={courseForm.status}
                  onChange={(event) => setCourseForm({ ...courseForm, status: event.target.value })}
                >
                  <option value="draft">draft</option>
                  <option value="review">review</option>
                  <option value="published">published</option>
                  <option value="archived">archived</option>
                </select>
              </label>
              <label>
                Sort
                <input
                  type="number"
                  value={courseForm.sortOrder}
                  onChange={(event) =>
                    setCourseForm({ ...courseForm, sortOrder: Number(event.target.value) })
                  }
                />
              </label>
              <label className="wide-field">
                Cover Asset
                <select
                  value={courseForm.coverAssetId}
                  onChange={(event) =>
                    setCourseForm({ ...courseForm, coverAssetId: event.target.value })
                  }
                >
                  <option value="">No cover</option>
                  {coverAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.asset_key} · {asset.status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-actions">
              <button
                className="secondary-action"
                disabled={!selectedCourse || adminBusy}
                type="button"
                onClick={runPublishCheck}
              >
                Publish Check
              </button>
              <button
                className="danger-action"
                disabled={!selectedCourse || adminBusy}
                type="button"
                onClick={archiveCourse}
              >
                Archive
              </button>
            </div>
          </form>

          {publishCheck && (
            <section className={publishCheck.can_publish ? 'cms-check pass' : 'cms-check'}>
              <h2>{publishCheck.can_publish ? 'Ready to publish' : 'Publish check issues'}</h2>
              {publishCheck.issues.length === 0 ? (
                <p>No blockers returned by the backend publish checker.</p>
              ) : (
                <ul>
                  {publishCheck.issues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {selectedCourse && (
            <section className="cms-two-column">
              <form className="admin-form" onSubmit={submitLesson}>
                <div className="cms-panel-head">
                  <h2>{selectedLesson ? 'Lesson' : 'New Lesson'}</h2>
                  <button
                    className="secondary-action inline-action"
                    type="button"
                    onClick={() => {
                      setSelectedLessonId(null)
                      setActivities([])
                      setLessonForm(emptyLessonAdminForm())
                    }}
                  >
                    New
                  </button>
                </div>
                <div className="lesson-list compact-list">
                  {lessons.map((lesson) => (
                    <button
                      className={lesson.id === selectedLessonId ? 'active' : ''}
                      key={lesson.id}
                      type="button"
                      onClick={() => {
                        setSelectedLessonId(lesson.id)
                        setLessonForm(lessonAdminFormFromLesson(lesson))
                      }}
                    >
                      <span>{lesson.title}</span>
                      <small>{lesson.slug}</small>
                    </button>
                  ))}
                </div>
                <label>
                  Slug
                  <input
                    required
                    value={lessonForm.slug}
                    onChange={(event) => setLessonForm({ ...lessonForm, slug: event.target.value })}
                  />
                </label>
                <label>
                  Title
                  <input
                    required
                    value={lessonForm.title}
                    onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })}
                  />
                </label>
                <label>
                  Sort
                  <input
                    type="number"
                    value={lessonForm.sortOrder}
                    onChange={(event) =>
                      setLessonForm({ ...lessonForm, sortOrder: Number(event.target.value) })
                    }
                  />
                </label>
                <label>
                  Objectives JSON
                  <textarea
                    rows={5}
                    value={lessonForm.learningObjectives}
                    onChange={(event) =>
                      setLessonForm({ ...lessonForm, learningObjectives: event.target.value })
                    }
                  />
                </label>
                <div className="form-actions">
                  <button className="primary-action" disabled={adminBusy} type="submit">
                    Save Lesson
                  </button>
                  <button
                    className="danger-action"
                    disabled={!selectedLesson || adminBusy}
                    type="button"
                    onClick={deleteLesson}
                  >
                    Delete
                  </button>
                </div>
              </form>

              <form className="admin-form" onSubmit={submitActivity}>
                <div className="cms-panel-head">
                  <h2>{selectedActivity ? 'Activity' : 'New Activity'}</h2>
                  <button
                    className="secondary-action inline-action"
                    disabled={!selectedLesson}
                    type="button"
                    onClick={() => {
                      setSelectedActivityId(null)
                      setActivityForm(emptyActivityAdminForm())
                    }}
                  >
                    New
                  </button>
                </div>
                <div className="lesson-list compact-list">
                  {activities.map((activity) => (
                    <button
                      className={activity.id === selectedActivityId ? 'active' : ''}
                      key={activity.id}
                      type="button"
                      onClick={() => {
                        setSelectedActivityId(activity.id)
                        setActivityForm(activityAdminFormFromActivity(activity))
                      }}
                    >
                      <span>{activity.slug}</span>
                      <small>{activity.activity_type}</small>
                    </button>
                  ))}
                </div>
                <label>
                  Slug
                  <input
                    required
                    value={activityForm.slug}
                    onChange={(event) =>
                      setActivityForm({ ...activityForm, slug: event.target.value })
                    }
                  />
                </label>
                <label>
                  Type
                  <input
                    required
                    value={activityForm.activityType}
                    onChange={(event) =>
                      setActivityForm({ ...activityForm, activityType: event.target.value })
                    }
                  />
                </label>
                <label>
                  Sort
                  <input
                    type="number"
                    value={activityForm.sortOrder}
                    onChange={(event) =>
                      setActivityForm({ ...activityForm, sortOrder: Number(event.target.value) })
                    }
                  />
                </label>
                <label>
                  Word Card Asset
                  <select defaultValue="" onChange={(event) => applyWordCardAsset(event.target.value)}>
                    <option value="">Choose image asset</option>
                    {wordCardAssets.map((asset) => (
                      <option key={asset.id} value={asset.asset_key}>
                        {asset.asset_key} · {asset.status}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Prompt JSON
                  <textarea
                    rows={4}
                    value={activityForm.prompt}
                    onChange={(event) =>
                      setActivityForm({ ...activityForm, prompt: event.target.value })
                    }
                  />
                </label>
                <label>
                  Content JSON
                  <textarea
                    rows={5}
                    value={activityForm.content}
                    onChange={(event) =>
                      setActivityForm({ ...activityForm, content: event.target.value })
                    }
                  />
                </label>
                <label>
                  Answer Key JSON
                  <textarea
                    rows={4}
                    value={activityForm.answerKey}
                    onChange={(event) =>
                      setActivityForm({ ...activityForm, answerKey: event.target.value })
                    }
                  />
                </label>
                <div className="form-actions">
                  <button
                    className="primary-action"
                    disabled={!selectedLesson || adminBusy}
                    type="submit"
                  >
                    Save Activity
                  </button>
                  <button
                    className="danger-action"
                    disabled={!selectedActivity || adminBusy}
                    type="button"
                    onClick={deleteActivity}
                  >
                    Delete
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="admin-form">
            <div className="cms-panel-head">
              <h2>Version History</h2>
              <button className="secondary-action inline-action" type="button" onClick={refreshVersions}>
                Refresh
              </button>
            </div>
            <div className="version-list">
              {versions.slice(0, 8).map((version) => (
                <article key={version.id}>
                  <strong>{version.action}</strong>
                  <span>{version.entity_type}</span>
                  <small>{version.created_at}</small>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </>
  )
}

function ParentRoute({
  auth,
  childProfiles,
  gate,
}: {
  auth: AuthController
  childProfiles: ChildController
  gate: ParentGateController
}) {
  if (auth.authStatus === 'checking') {
    return (
      <>
        <section className="route-heading">
          <p className="eyebrow">Parent</p>
          <h1>Parent Center</h1>
        </section>
        <section className="empty-state">
          <h2>Checking parent session</h2>
          <p>Stored credentials are being validated with the local API.</p>
        </section>
      </>
    )
  }

  if (auth.authStatus === 'signed_in' && auth.parent) {
    return (
      <>
        <section className="route-heading">
          <p className="eyebrow">Parent</p>
          <h1>Parent Center</h1>
        </section>
        <section className="parent-grid">
          <ParentAccountSettings auth={auth} />
          <ChildProfileForm childProfiles={childProfiles} />
        </section>
        <ParentLearningSummary authToken={auth.authToken} children={childProfiles.children} />
        <ParentPrivacyPanel
          authToken={auth.authToken}
          children={childProfiles.children}
          gate={gate}
          onAccountDeleted={auth.clearLocalAuth}
          onChildrenChanged={childProfiles.refreshChildren}
        />
        <ChildProfileList childProfiles={childProfiles} />
      </>
    )
  }

  return (
    <>
      <section className="route-heading">
        <p className="eyebrow">Parent</p>
        <h1>Parent Center</h1>
      </section>
      <form className="auth-panel" onSubmit={auth.submitAuth}>
        <div className="segmented-control" role="tablist" aria-label="Auth mode">
          <button
            aria-selected={auth.authMode === 'login'}
            className={auth.authMode === 'login' ? 'active' : ''}
            type="button"
            onClick={() => auth.selectAuthMode('login')}
          >
            Sign In
          </button>
          <button
            aria-selected={auth.authMode === 'register'}
            className={auth.authMode === 'register' ? 'active' : ''}
            type="button"
            onClick={() => auth.selectAuthMode('register')}
          >
            Create Account
          </button>
        </div>

        <label>
          Email
          <input
            autoComplete="email"
            disabled={auth.authBusy}
            required
            type="email"
            value={auth.authForm.email}
            onChange={(event) => auth.updateAuthForm('email', event.target.value)}
          />
        </label>

        {auth.authMode === 'register' && (
          <label>
            Display Name
            <input
              autoComplete="name"
              disabled={auth.authBusy}
              required
              type="text"
              value={auth.authForm.displayName}
              onChange={(event) => auth.updateAuthForm('displayName', event.target.value)}
            />
          </label>
        )}

        <label>
          Password
          <input
            autoComplete={auth.authMode === 'login' ? 'current-password' : 'new-password'}
            disabled={auth.authBusy}
            minLength={8}
            required
            type="password"
            value={auth.authForm.password}
            onChange={(event) => auth.updateAuthForm('password', event.target.value)}
          />
        </label>

        {auth.authMode === 'register' && (
          <label>
            Locale
            <input
              disabled={auth.authBusy}
              required
              type="text"
              value={auth.authForm.locale}
              onChange={(event) => auth.updateAuthForm('locale', event.target.value)}
            />
          </label>
        )}

        {auth.authError && <p className="form-error">{auth.authError}</p>}

        <button className="primary-action" disabled={auth.authBusy} type="submit">
          {auth.authBusy
            ? auth.authMode === 'login'
              ? 'Signing In'
              : 'Creating Account'
            : auth.authMode === 'login'
              ? 'Sign In'
              : 'Create Account'}
        </button>
      </form>
    </>
  )
}

function ParentAccountSettings({ auth }: { auth: AuthController }) {
  const [settingsForm, setSettingsForm] = useState<ParentSettingsForm>({
    autoPlayVoice: auth.parent?.auto_play_voice ?? true,
    displayName: auth.parent?.display_name ?? '',
    effectVolume: auth.parent?.effect_volume ?? 60,
    locale: auth.parent?.locale ?? navigator.language ?? 'en-US',
    soundEnabled: auth.parent?.sound_enabled ?? true,
    voiceVolume: auth.parent?.voice_volume ?? 100,
  })
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  if (!auth.parent) return null

  async function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSettingsMessage(null)
    setSettingsError(null)
    try {
      await auth.saveParentSettings(settingsForm)
      setSettingsMessage('Settings saved.')
    } catch (error) {
      setSettingsError(readableApiError(error))
    }
  }

  return (
    <article className="info-panel parent-settings">
      <p className="eyebrow">Signed In</p>
      <h2>{auth.parent.display_name}</h2>
      <p>{auth.parent.email}</p>

      <form className="settings-form" onSubmit={submitSettings}>
        <label>
          Display Name
          <input
            disabled={auth.authBusy}
            required
            type="text"
            value={settingsForm.displayName}
            onChange={(event) =>
              setSettingsForm((current) => ({ ...current, displayName: event.target.value }))
            }
          />
        </label>
        <label>
          Locale
          <input
            disabled={auth.authBusy}
            required
            type="text"
            value={settingsForm.locale}
            onChange={(event) =>
              setSettingsForm((current) => ({ ...current, locale: event.target.value }))
            }
          />
        </label>
        <section className="sound-settings">
          <label className="toggle-row">
            <input
              checked={settingsForm.soundEnabled}
              disabled={auth.authBusy}
              type="checkbox"
              onChange={(event) =>
                setSettingsForm((current) => ({ ...current, soundEnabled: event.target.checked }))
              }
            />
            <span>Sound effects</span>
          </label>
          <label className="toggle-row">
            <input
              checked={settingsForm.autoPlayVoice}
              disabled={auth.authBusy}
              type="checkbox"
              onChange={(event) =>
                setSettingsForm((current) => ({ ...current, autoPlayVoice: event.target.checked }))
              }
            />
            <span>Auto-play lesson voice</span>
          </label>
          <label>
            Teaching Voice Volume
            <span className="range-value">{settingsForm.voiceVolume}%</span>
            <input
              disabled={auth.authBusy}
              max="100"
              min="0"
              type="range"
              value={settingsForm.voiceVolume}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  voiceVolume: Number(event.target.value),
                }))
              }
            />
          </label>
          <label>
            UI Effect Volume
            <span className="range-value">{settingsForm.effectVolume}%</span>
            <input
              disabled={auth.authBusy}
              max="100"
              min="0"
              type="range"
              value={settingsForm.effectVolume}
              onChange={(event) =>
                setSettingsForm((current) => ({
                  ...current,
                  effectVolume: Number(event.target.value),
                }))
              }
            />
          </label>
        </section>
        <div className="form-actions">
          <button className="primary-action" disabled={auth.authBusy} type="submit">
            {auth.authBusy ? 'Saving' : 'Save Settings'}
          </button>
          <button
            className="secondary-action"
            disabled={auth.authBusy}
            type="button"
            onClick={auth.logout}
          >
            {auth.authBusy ? 'Working' : 'Sign Out'}
          </button>
        </div>
      </form>

      {settingsMessage && <p className="result-banner">{settingsMessage}</p>}
      {(settingsError || auth.authError) && (
        <p className="form-error">{settingsError ?? auth.authError}</p>
      )}
    </article>
  )
}

function ParentLearningSummary({
  authToken,
  children,
}: {
  authToken: string | null
  children: ChildProfile[]
}) {
  const [summaryStatus, setSummaryStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [summaries, setSummaries] = useState<ChildLearningSummary[]>([])
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadSummaries() {
      if (!authToken || children.length === 0) {
        setSummaries([])
        setSummaryStatus('idle')
        return
      }

      setSummaryStatus('loading')
      setSummaryError(null)
      try {
        const rows = await Promise.all(
          children.map(async (child) => {
            const [progress, rewards] = await Promise.all([
              fetchProgress(authToken, child.id, controller.signal),
              fetchRewards(authToken, child.id, controller.signal),
            ])
            return summarizeChildLearning(child, progress, rewards)
          }),
        )
        setSummaries(rows)
        setSummaryStatus('ready')
      } catch (error) {
        if (controller.signal.aborted) return
        setSummaries([])
        setSummaryStatus('error')
        setSummaryError(readableApiError(error))
      }
    }

    loadSummaries()
    return () => controller.abort()
  }, [authToken, children])

  return (
    <section className="parent-section">
      <div className="route-heading compact-heading">
        <p className="eyebrow">Learning Summary</p>
        <h2>Progress By Child</h2>
      </div>

      {summaryStatus === 'loading' && (
        <section className="empty-state compact-state">
          <h2>Loading learning summaries</h2>
          <p>Progress and rewards are loading from the local API.</p>
        </section>
      )}

      {summaryStatus === 'error' && summaryError && <p className="form-error">{summaryError}</p>}

      {summaryStatus !== 'loading' && children.length === 0 && (
        <section className="empty-state compact-state">
          <h2>No learning summary yet</h2>
          <p>Create a child profile before progress, weak spots, and rewards can be shown.</p>
        </section>
      )}

      {summaries.length > 0 && (
        <section className="summary-grid">
          {summaries.map((summary) => (
            <article className="summary-card" key={summary.child.id}>
              <div>
                <p className="eyebrow">{summary.child.market_region}</p>
                <h2>{summary.child.display_name}</h2>
              </div>
              <div className="metric-row">
                <Metric label="Mastery" value={summary.mastery} />
                <Metric label="Attempts" value={summary.attempts} />
                <Metric label="Weak Spots" value={summary.weakSpots} />
                <Metric label="Rewards" value={summary.rewards.length} />
              </div>
              <RewardList rewards={summary.rewards} />
            </article>
          ))}
        </section>
      )}
    </section>
  )
}

function ParentPrivacyPanel({
  authToken,
  children,
  gate,
  onAccountDeleted,
  onChildrenChanged,
}: {
  authToken: string | null
  children: ChildProfile[]
  gate: ParentGateController
  onAccountDeleted: () => void
  onChildrenChanged: () => Promise<void>
}) {
  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [privacyBusy, setPrivacyBusy] = useState(false)
  const [privacyError, setPrivacyError] = useState<string | null>(null)
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null)
  const [selectedExportChildId, setSelectedExportChildId] = useState('all')
  const [selectedDeleteChildId, setSelectedDeleteChildId] = useState('')
  const effectiveDeleteChildId = children.some((child) => child.id === selectedDeleteChildId)
    ? selectedDeleteChildId
    : (children[0]?.id ?? '')

  useEffect(() => {
    const controller = new AbortController()

    async function loadConsents() {
      if (!authToken) {
        setConsents([])
        return
      }

      try {
        setConsents(await fetchConsents(authToken, controller.signal))
      } catch (error) {
        if (controller.signal.aborted) return
        setPrivacyError(readableApiError(error))
      }
    }

    loadConsents()
    return () => controller.abort()
  }, [authToken, children.length])

  async function reloadConsents() {
    if (!authToken) return
    setConsents(await fetchConsents(authToken))
  }

  async function requestExport() {
    if (!authToken) return
    setPrivacyBusy(true)
    setPrivacyError(null)
    setPrivacyMessage(null)
    try {
      await gate.requireParentGate('Request a parent data export')
      const audit = await requestDataExport(
        authToken,
        selectedExportChildId === 'all' ? null : selectedExportChildId,
      )
      downloadDataExport(audit.package)
      setPrivacyMessage(`${audit.audit_log.action.replaceAll('_', ' ')} and downloaded.`)
    } catch (error) {
      setPrivacyError(readableApiError(error))
    } finally {
      setPrivacyBusy(false)
    }
  }

  async function revokeConsent(consentId: string) {
    if (!authToken) return
    setPrivacyBusy(true)
    setPrivacyError(null)
    setPrivacyMessage(null)
    try {
      await gate.requireParentGate('Revoke parent consent')
      await revokePrivacyConsent(authToken, consentId)
      await reloadConsents()
      setPrivacyMessage('Consent revoked.')
    } catch (error) {
      setPrivacyError(readableApiError(error))
    } finally {
      setPrivacyBusy(false)
    }
  }

  async function deleteSelectedChildData() {
    if (!authToken || !effectiveDeleteChildId) return
    const child = children.find((item) => item.id === effectiveDeleteChildId)
    setPrivacyBusy(true)
    setPrivacyError(null)
    setPrivacyMessage(null)
    try {
      await gate.requireParentGate('Delete child data')
      await deleteChildPrivacyData(authToken, effectiveDeleteChildId)
      await onChildrenChanged()
      await reloadConsents()
      setPrivacyMessage(`${child?.display_name ?? 'Child'} data deleted.`)
    } catch (error) {
      setPrivacyError(readableApiError(error))
    } finally {
      setPrivacyBusy(false)
    }
  }

  async function deleteParentAccount() {
    if (!authToken) return
    setPrivacyBusy(true)
    setPrivacyError(null)
    setPrivacyMessage(null)
    try {
      await gate.requireParentGate('Delete parent account')
      await deleteParentAccountData(authToken)
      onAccountDeleted()
    } catch (error) {
      setPrivacyError(readableApiError(error))
    } finally {
      setPrivacyBusy(false)
    }
  }

  return (
    <section className="parent-section">
      <div className="route-heading compact-heading">
        <p className="eyebrow">Privacy</p>
        <h2>Parent Trust Center</h2>
      </div>

      <section className="privacy-action-grid">
        <article className="info-panel">
          <p className="eyebrow">Data Export</p>
          <label>
            Export Scope
            <select
              disabled={privacyBusy}
              value={selectedExportChildId}
              onChange={(event) => setSelectedExportChildId(event.target.value)}
            >
              <option value="all">All parent data</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.display_name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="primary-action inline-action"
            disabled={privacyBusy}
            type="button"
            onClick={requestExport}
          >
            Request Export
          </button>
        </article>

        <article className="info-panel">
          <p className="eyebrow">Delete Child Data</p>
          <label>
            Child
            <select
              disabled={privacyBusy || children.length === 0}
              value={effectiveDeleteChildId}
              onChange={(event) => setSelectedDeleteChildId(event.target.value)}
            >
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.display_name}
                </option>
              ))}
            </select>
          </label>
          <button
            className="danger-action inline-action"
            disabled={privacyBusy || children.length === 0}
            type="button"
            onClick={deleteSelectedChildData}
          >
            Delete Selected Child Data
          </button>
        </article>

        <article className="info-panel">
          <p className="eyebrow">Delete Account</p>
          <p className="panel-note">
            Removes the parent account and all child profiles from the local API.
          </p>
          <button
            className="danger-action inline-action"
            disabled={privacyBusy}
            type="button"
            onClick={deleteParentAccount}
          >
            Delete Parent Account
          </button>
        </article>
      </section>

      {privacyMessage && <p className="result-banner">{privacyMessage}</p>}
      {privacyError && <p className="form-error">{privacyError}</p>}

      <section className="consent-panel">
        <div className="route-heading compact-heading">
          <p className="eyebrow">Consents</p>
          <h2>Recorded Consent</h2>
        </div>
        {consents.length === 0 && <p className="panel-note">No consent records yet.</p>}
        {consents.length > 0 && (
          <div className="consent-list">
            {consents.map((consent) => (
              <article className="consent-row" key={consent.id}>
                <div>
                  <strong>{consent.consent_type.replaceAll('_', ' ')}</strong>
                  <span>
                    {consent.status}
                    {consent.child_id ? ` - ${childName(children, consent.child_id)}` : ' - account'}
                  </span>
                </div>
                {consent.status !== 'revoked' && (
                  <button
                    className="secondary-action"
                    disabled={privacyBusy}
                    type="button"
                    onClick={() => revokeConsent(consent.id)}
                  >
                    Revoke
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

function ChildProfileForm({ childProfiles }: { childProfiles: ChildController }) {
  return (
    <form className="child-form info-panel" onSubmit={childProfiles.submitChild}>
      <p className="eyebrow">{childProfiles.editingChildId ? 'Edit Child' : 'New Child'}</p>
      <h2>{childProfiles.editingChildId ? 'Update child profile' : 'Create child profile'}</h2>

      <label>
        Display Name
        <input
          disabled={childProfiles.childBusy}
          required
          type="text"
          value={childProfiles.childForm.displayName}
          onChange={(event) => childProfiles.updateChildForm('displayName', event.target.value)}
        />
      </label>

      <div className="field-grid">
        <label>
          Age Band
          <select
            disabled={childProfiles.childBusy}
            value={childProfiles.childForm.ageBand}
            onChange={(event) => childProfiles.updateChildForm('ageBand', event.target.value)}
          >
            <option value="3-5">3-5</option>
            <option value="6-8">6-8</option>
            <option value="9-11">9-11</option>
          </select>
        </label>

        <label>
          Region
          <select
            disabled={childProfiles.childBusy}
            value={childProfiles.childForm.marketRegion}
            onChange={(event) => childProfiles.updateChildForm('marketRegion', event.target.value)}
          >
            <option value="DE">DE</option>
            <option value="UK">UK</option>
            <option value="US">US</option>
            <option value="TW">TW</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>
      </div>

      <label>
        English Variant
        <select
          disabled={childProfiles.childBusy}
          value={childProfiles.childForm.englishVariant}
          onChange={(event) => childProfiles.updateChildForm('englishVariant', event.target.value)}
        >
          <option value="american">American</option>
          <option value="british">British</option>
        </select>
      </label>

      <section className="privacy-choice">
        <p className="eyebrow">Privacy</p>
        <p>{privacyGuidance(childProfiles.childForm)}</p>
        <label className="checkbox-row">
          <input
            checked={childProfiles.childForm.privacyConsent}
            disabled={childProfiles.childBusy}
            type="checkbox"
            onChange={(event) =>
              childProfiles.updateChildForm('privacyConsent', event.target.checked)
            }
          />
          Record parent privacy consent
        </label>
      </section>

      {childProfiles.childError && <p className="form-error">{childProfiles.childError}</p>}

      <div className="form-actions">
        <button className="primary-action" disabled={childProfiles.childBusy} type="submit">
          {childProfiles.childBusy
            ? 'Saving'
            : childProfiles.editingChildId
              ? 'Save Changes'
              : 'Create Child'}
        </button>
        {childProfiles.editingChildId && (
          <button
            className="secondary-action"
            disabled={childProfiles.childBusy}
            type="button"
            onClick={childProfiles.cancelChildEdit}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function ChildProfileList({ childProfiles }: { childProfiles: ChildController }) {
  return (
    <section className="child-list-panel">
      <div className="route-heading compact-heading">
        <p className="eyebrow">Children</p>
        <h2>Child Profiles</h2>
      </div>

      {childProfiles.childStatus === 'loading' && (
        <section className="empty-state">
          <h2>Loading child profiles</h2>
          <p>The parent session is connected and child data is loading.</p>
        </section>
      )}

      {childProfiles.childStatus !== 'loading' && childProfiles.children.length === 0 && (
        <section className="empty-state">
          <h2>No child profiles yet</h2>
          <p>Create a child profile to unlock onboarding and learning flows.</p>
        </section>
      )}

      {childProfiles.children.length > 0 && (
        <section className="child-card-grid">
          {childProfiles.children.map((child) => (
            <article className="child-card" key={child.id}>
              <div>
                <p className="eyebrow">{child.market_region}</p>
                <h2>{child.display_name}</h2>
                <p>
                  {child.age_band} - {child.english_variant}
                </p>
              </div>
              <div className="card-actions">
                <button
                  className="secondary-action"
                  disabled={childProfiles.childBusy}
                  type="button"
                  onClick={() => childProfiles.editChild(child)}
                >
                  Edit
                </button>
                <button
                  className="danger-action"
                  disabled={childProfiles.childBusy}
                  type="button"
                  onClick={() => childProfiles.deleteChild(child.id)}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </section>
  )
}

function BlockedRoute({ detail, route }: { detail?: string; route: RouteDefinition }) {
  const heading =
    route.id === 'not-found' ? 'No route matches this URL' : `${route.title} is not connected yet`

  return (
    <>
      <section className="route-heading">
        <p className="eyebrow">{route.state === 'next' ? 'Next' : 'Blocked'}</p>
        <h1>{route.title}</h1>
      </section>
      <section className="empty-state">
        <h2>{heading}</h2>
        <p>{detail ?? 'This route is present, but the product flow is still waiting on its API and UI work.'}</p>
      </section>
    </>
  )
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <strong>
      {value}
      <span>{label}</span>
    </strong>
  )
}

function RewardList({ rewards }: { rewards: RewardRecord[] }) {
  if (rewards.length === 0) return null

  return (
    <div className="reward-list" aria-label="Rewards">
      {rewards.slice(0, 4).map((reward) => (
        <span key={reward.id}>{reward.reward_type.replaceAll('_', ' ')}</span>
      ))}
    </div>
  )
}

function RouteStatePill({ state }: { state: RouteState }) {
  return <span className={`route-state ${state}`}>{state}</span>
}

function authStatusText(status: AuthStatus) {
  if (status === 'signed_in') return 'Parent signed in'
  if (status === 'checking') return 'Checking parent'
  return 'Parent signed out'
}

function matchRoute(path: string) {
  return routes.find((route) => route.path === path) ?? { ...notFoundRoute, path }
}

function normalizedPath(path: string) {
  if (!path || path === '/') return '/'
  return path.endsWith('/') ? path.slice(0, -1) : path
}

function courseCoverPath(course?: CourseSummary) {
  if (!course?.cover_asset_path) return '/assets/images/course-covers/animal-english-words-cover.png'
  return course.cover_asset_path.startsWith('/')
    ? course.cover_asset_path
    : `/${course.cover_asset_path}`
}

function displayCourseTitle(course?: CourseSummary) {
  if (!course) return 'Animal English Words'
  return course.slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function averageMastery(progressRows: ProgressRecord[]) {
  if (progressRows.length === 0) return '-'
  const total = progressRows.reduce((sum, row) => sum + row.mastery_score, 0)
  return Math.round(total / progressRows.length)
}

function summarizeChildLearning(
  child: ChildProfile,
  progressRows: ProgressRecord[],
  rewards: RewardRecord[],
): ChildLearningSummary {
  return {
    attempts: progressRows.reduce((sum, row) => sum + row.attempts_count, 0),
    child,
    mastery: averageMastery(progressRows),
    records: progressRows.length,
    rewards,
    weakSpots: progressRows.filter((row) => row.mastery_score < 80).length,
  }
}

function childName(children: ChildProfile[], childId: string) {
  return children.find((child) => child.id === childId)?.display_name ?? 'Child'
}

function contentSelectionUrl(path: string, child?: ChildProfile | null) {
  if (!child) return path
  const params = new URLSearchParams({
    english_variant: child.english_variant,
    market_region: child.market_region,
  })
  return `${path}?${params.toString()}`
}

function courseMatchesChild(course: CourseSummary, child?: ChildProfile | null) {
  if (!child) return true
  const marketMatch =
    !Array.isArray(course.market_regions) ||
    course.market_regions.length === 0 ||
    course.market_regions.includes(child.market_region)
  const variantMatch =
    !Array.isArray(course.english_variants) ||
    course.english_variants.length === 0 ||
    course.english_variants.includes(child.english_variant)
  return marketMatch && variantMatch
}

function privacyGuidance(form: ChildForm) {
  if (form.marketRegion === 'US') {
    return 'US child profiles require parent consent before learning data is recorded.'
  }

  if (form.marketRegion === 'DE') {
    return 'DE profiles use parent consent for children in the supported age bands.'
  }

  if (form.marketRegion === 'UK') {
    return 'UK profiles stay on the high-privacy default for child learning flows.'
  }

  if (form.marketRegion === 'TW') {
    return 'TW profiles keep parent-controlled learning and privacy settings.'
  }

  return 'Other regions use the parent-controlled privacy baseline.'
}

function activityPrompt(activity: ActivitySummary) {
  const prompt = objectValue(activity.prompt)
  if (typeof prompt?.text === 'string') {
    return prompt.text
  }

  const content = objectValue(activity.content)
  if (typeof content?.word === 'string') {
    return content.word
  }

  return activity.activity_type
}

function activityChoices(activity?: ActivitySummary) {
  const content = objectValue(activity?.content)
  return Array.isArray(content?.choices)
    ? content.choices.filter((choice): choice is string => typeof choice === 'string')
    : []
}

function activityCorrectAnswer(activity?: ActivitySummary) {
  const answerKey = objectValue(activity?.answer_key)
  if (typeof answerKey?.correct_answer === 'string') return answerKey.correct_answer
  if (typeof answerKey?.expected === 'string') return answerKey.expected
  return null
}

function objectValue(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function emptyCourseAdminForm(): CourseAdminForm {
  return {
    coverAssetId: '',
    level: 'starter',
    slug: '',
    sortOrder: 0,
    status: 'draft',
    targetLanguage: 'en',
    title: '',
  }
}

function courseAdminFormFromCourse(course: AdminCourseRecord): CourseAdminForm {
  return {
    coverAssetId: course.cover_asset_id ?? '',
    level: course.level,
    slug: course.slug,
    sortOrder: course.sort_order,
    status: course.status,
    targetLanguage: course.target_language,
    title: course.title,
  }
}

function courseAdminPayload(form: CourseAdminForm) {
  return {
    cover_asset_id: form.coverAssetId || null,
    level: form.level,
    slug: form.slug,
    sort_order: form.sortOrder,
    status: form.status,
    target_language: form.targetLanguage,
    title: form.title,
  }
}

function emptyLessonAdminForm(): LessonAdminForm {
  return {
    learningObjectives: '[]',
    slug: '',
    sortOrder: 0,
    title: '',
  }
}

function lessonAdminFormFromLesson(lesson: LessonSummary): LessonAdminForm {
  return {
    learningObjectives: JSON.stringify(lesson.learning_objectives, null, 2),
    slug: lesson.slug,
    sortOrder: lesson.sort_order,
    title: lesson.title,
  }
}

function lessonAdminPayload(form: LessonAdminForm) {
  return {
    learning_objectives: parseJsonDraft(form.learningObjectives),
    slug: form.slug,
    sort_order: form.sortOrder,
    title: form.title,
  }
}

function emptyActivityAdminForm(): ActivityAdminForm {
  return {
    activityType: 'word_card',
    answerKey: '{\n  "correct_answer": ""\n}',
    content: '{}',
    prompt: '{\n  "text": ""\n}',
    slug: '',
    sortOrder: 0,
  }
}

function activityAdminFormFromActivity(activity: ActivitySummary): ActivityAdminForm {
  return {
    activityType: activity.activity_type,
    answerKey: JSON.stringify(activity.answer_key, null, 2),
    content: JSON.stringify(activity.content, null, 2),
    prompt: JSON.stringify(activity.prompt, null, 2),
    slug: activity.slug,
    sortOrder: activity.sort_order,
  }
}

function activityAdminPayload(form: ActivityAdminForm) {
  return {
    activity_type: form.activityType,
    answer_key: parseJsonDraft(form.answerKey),
    content: parseJsonDraft(form.content),
    prompt: parseJsonDraft(form.prompt),
    slug: form.slug,
    sort_order: form.sortOrder,
  }
}

function parseJsonDraft(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    throw new ApiRequestError('invalid_json', 400)
  }
}

function bearerHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

function jsonHeaders(token: string) {
  return {
    ...bearerHeaders(token),
    'Content-Type': 'application/json',
  }
}

function fetchChildren(token: string, signal?: AbortSignal) {
  return requestJson<ChildProfile[]>('/api/children', {
    headers: bearerHeaders(token),
    signal,
  })
}

function fetchProgress(token: string, childId: string, signal?: AbortSignal) {
  return requestJson<ProgressRecord[]>(`/api/children/${childId}/progress`, {
    headers: bearerHeaders(token),
    signal,
  })
}

function fetchRewards(token: string, childId: string, signal?: AbortSignal) {
  return requestJson<RewardRecord[]>(`/api/children/${childId}/rewards`, {
    headers: bearerHeaders(token),
    signal,
  })
}

function fetchConsents(token: string, signal?: AbortSignal) {
  return requestJson<ConsentRecord[]>('/api/privacy/consents', {
    headers: bearerHeaders(token),
    signal,
  })
}

function requestDataExport(token: string, childId: string | null) {
  return requestJson<DataExportResponse>('/api/privacy/data-export-requests', {
    body: JSON.stringify({ child_id: childId }),
    headers: jsonHeaders(token),
    method: 'POST',
  })
}

function revokePrivacyConsent(token: string, consentId: string) {
  return requestJson<ConsentRecord>(`/api/privacy/consents/${consentId}/revoke`, {
    headers: bearerHeaders(token),
    method: 'POST',
  })
}

function deleteChildPrivacyData(token: string, childId: string) {
  return requestJson<AuditLogRecord>(`/api/privacy/children/${childId}`, {
    headers: bearerHeaders(token),
    method: 'DELETE',
  })
}

function deleteParentAccountData(token: string) {
  return requestJson<AuditLogRecord>('/api/privacy/parent-account', {
    headers: bearerHeaders(token),
    method: 'DELETE',
  })
}

function downloadDataExport(exportPackage: DataExportPackage) {
  const body = JSON.stringify(exportPackage, null, 2)
  const blob = new Blob([body], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const scope = exportPackage.scope.child_id
    ? `child-${exportPackage.scope.child_id.slice(0, 8)}`
    : 'account'
  const timestamp = exportPackage.generated_at.replace(/[^0-9A-Za-z]+/g, '-').replace(/^-|-$/g, '')

  anchor.href = url
  anchor.download = `futurelight-data-export-${scope}-${timestamp}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function recordPrivacyConsent(token: string, child: ChildProfile, form: ChildForm) {
  return requestJson<unknown>('/api/privacy/consents', {
    body: JSON.stringify({
      child_id: child.id,
      consent_type: 'parental_privacy',
      evidence: {
        age_band: form.ageBand,
        english_variant: form.englishVariant,
        market_region: form.marketRegion,
        source: 'parent_onboarding',
      },
    }),
    headers: jsonHeaders(token),
    method: 'POST',
  })
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw await ApiRequestError.fromResponse(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

function readableApiError(error: unknown) {
  if (error instanceof ApiRequestError) {
    return authErrorMessages[error.code] ?? error.code
  }

  return 'Network request failed.'
}

class ApiRequestError extends Error {
  code: string
  status: number

  constructor(code: string, status: number) {
    super(code)
    this.code = code
    this.status = status
  }

  static async fromResponse(response: Response) {
    const body = await response.json().catch(() => null)
    const code = typeof body?.error === 'string' ? body.error : `http_${response.status}`
    return new ApiRequestError(code, response.status)
  }
}

export default App
