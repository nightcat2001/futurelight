import { useCallback, useEffect, useMemo, useState } from 'react'
import { type Locale, speechLanguage, storyTranslations, taskTranslations, ui } from './i18n'

type ChildProfile = {
  id: string
  display_name: string
  age_band: string
}

type StorySummary = {
  id: string
  slug: string
  title: string
  summary: string
  theme: string
  mode: 'standard' | 'bedtime'
  duration_minutes: number
  cover_path: string
  parent_prompt: string
}

type StoryPage = {
  text: string
  scene: string
  prompt: string
}

type StoryDetail = StorySummary & {
  pages: StoryPage[]
  calming_prompt: string | null
}

type StorySession = {
  id: string
  current_page: number
  completed_at: string | null
}

type DailyFamilyTask = {
  id: string
  task_key: string
  title: string
  instruction: string
  parent_tip: string
  duration_minutes: number
  completed_today: boolean
}

type Props = {
  authToken: string | null
  children: ChildProfile[]
  mode: 'standard' | 'bedtime'
  onOpenParent: () => void
  locale: Locale
}

const sceneSymbols: Record<string, string> = {
  seed: '●', rain: '☂', sun: '☀', sprout: '♧', cloud: '☁', bread: '◒',
  wind: '≋', door: '▥', share: '♥', moon: '☾', hands: '◡', feet: '⌒',
  star: '★', sleep: 'zZ',
}

export function StoryExperience({ authToken, children, mode, onOpenParent, locale }: Props) {
  const [childId, setChildId] = useState(children[0]?.id ?? '')
  const [stories, setStories] = useState<StorySummary[]>([])
  const [task, setTask] = useState<DailyFamilyTask | null>(null)
  const [activeStory, setActiveStory] = useState<StoryDetail | null>(null)
  const [session, setSession] = useState<StorySession | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [actionBusy, setActionBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = ui[locale].story

  const activeChildId = children.some((child) => child.id === childId)
    ? childId
    : (children[0]?.id ?? '')
  const selectedChild = useMemo(
    () => children.find((child) => child.id === activeChildId) ?? children[0],
    [activeChildId, children],
  )

  const loadDashboard = useCallback(async () => {
    if (!authToken || !activeChildId) return
    await Promise.resolve()
    setStatus('loading')
    setError(null)
    try {
      const [storyResponse, taskResponse] = await Promise.all([
        fetch(`/api/stories/recommendations?child_id=${encodeURIComponent(activeChildId)}&mode=${mode}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch(`/api/children/${encodeURIComponent(activeChildId)}/daily-family-task`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ])
      if (!storyResponse.ok || !taskResponse.ok) throw new Error(t.loadFailed)
      setStories(await storyResponse.json())
      setTask(await taskResponse.json())
      setStatus('ready')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t.loadFailed)
      setStatus('error')
    }
  }, [activeChildId, authToken, mode, t.loadFailed])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0)
    return () => window.clearTimeout(timer)
  }, [loadDashboard])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  function readCurrentPage() {
    if (!activeStory) return
    const copy = storyTranslations[activeStory.slug]?.[locale]
    window.speechSynthesis?.cancel()
    const utterance = new SpeechSynthesisUtterance(copy?.pages[pageIndex]?.text ?? activeStory.pages[pageIndex].text)
    utterance.lang = speechLanguage[locale]
    utterance.rate = mode === 'bedtime' ? 0.72 : 0.85
    utterance.pitch = mode === 'bedtime' ? 0.9 : 1
    window.speechSynthesis?.speak(utterance)
  }

  async function startStory(story: StorySummary) {
    if (!authToken || !activeChildId) return
    setActionBusy(true)
    setError(null)
    try {
      const [detailResponse, sessionResponse] = await Promise.all([
        fetch(`/api/stories/${story.id}?child_id=${encodeURIComponent(activeChildId)}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch('/api/story-sessions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ child_id: activeChildId, story_id: story.id, mode }),
        }),
      ])
      if (!detailResponse.ok || !sessionResponse.ok) {
        const failure = !sessionResponse.ok ? sessionResponse : detailResponse
        const body = await failure.json().catch(() => ({}))
        throw new Error(body.error === 'parental_consent_required'
          ? t.consentRequired
          : t.cannotStart)
      }
      setActiveStory(await detailResponse.json())
      setSession(await sessionResponse.json())
      setPageIndex(0)
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : t.cannotStart)
    } finally {
      setActionBusy(false)
    }
  }

  async function moveToPage(nextPage: number) {
    if (!authToken || !session || !activeStory) return
    if (nextPage < 0 || nextPage >= activeStory.pages.length) return
    setActionBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/story-sessions/${session.id}/progress`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_page: nextPage }),
      })
      if (!response.ok) throw new Error(t.cannotSave)
      setSession(await response.json())
      setPageIndex(nextPage)
    } catch (progressError) {
      setError(progressError instanceof Error ? progressError.message : t.cannotSave)
    } finally {
      setActionBusy(false)
    }
  }

  async function finishStory() {
    if (!authToken || !session) return
    setActionBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/story-sessions/${session.id}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken}` },
      })
      if (!response.ok) throw new Error(t.cannotComplete)
      setSession(await response.json())
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : t.cannotComplete)
    } finally {
      setActionBusy(false)
    }
  }

  async function completeTask() {
    if (!authToken || !task || !activeChildId) return
    setActionBusy(true)
    setError(null)
    try {
      const response = await fetch(`/api/family-tasks/${task.id}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id: activeChildId }),
      })
      if (!response.ok) throw new Error(t.cannotCompleteTask)
      setTask(await response.json())
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : t.cannotCompleteTask)
    } finally {
      setActionBusy(false)
    }
  }

  if (!authToken) {
    return <StoryAccessState title={t.signInTitle} detail={t.signInDetail} action={t.parentCenter} onAction={onOpenParent} />
  }
  if (children.length === 0) {
    return <StoryAccessState title={t.createChildTitle} detail={t.createChildDetail} action={t.createChild} onAction={onOpenParent} />
  }

  if (activeStory && session?.completed_at) {
    const nextStory = stories.find((story) => story.id !== activeStory.id)
    const activeCopy = storyTranslations[activeStory.slug]?.[locale]
    return (
      <section className={`story-experience completion ${mode}`} aria-labelledby="story-complete-title">
        <div className="completion-mark" aria-hidden="true">✓</div>
        <p className="eyebrow">{t.storyComplete}</p>
        <h1 id="story-complete-title">{t.heardIt(selectedChild?.display_name ?? '')}</h1>
        <p className="completion-prompt">{t.talkTogether}{activeCopy?.parentPrompt ?? activeStory.parent_prompt}</p>
        <div className="completion-actions">
          {nextStory && <button className="primary-action" type="button" onClick={() => void startStory(nextStory)}>{t.nextStory}</button>}
          <button className="secondary-action" type="button" onClick={() => { setActiveStory(null); setSession(null) }}>{t.backToday}</button>
        </div>
        {task && <FamilyTaskCard task={task} busy={actionBusy} locale={locale} onComplete={completeTask} />}
      </section>
    )
  }

  if (activeStory && session) {
    const activeCopy = storyTranslations[activeStory.slug]?.[locale]
    const sourcePage = activeStory.pages[pageIndex]
    const translatedPage = activeCopy?.pages[pageIndex]
    const page = { ...sourcePage, ...translatedPage }
    const lastPage = pageIndex === activeStory.pages.length - 1
    return (
      <section className={`story-reader ${mode}`} aria-label={`${activeCopy?.title ?? activeStory.title} ${t.player}`}>
        <header className="reader-header">
          <button className="reader-close" type="button" aria-label={t.leaveStory} onClick={() => { setActiveStory(null); setSession(null) }}>×</button>
          <div>
            <strong>{activeCopy?.title ?? activeStory.title}</strong>
            <span>{pageIndex + 1} / {activeStory.pages.length}</span>
          </div>
          <progress value={pageIndex + 1} max={activeStory.pages.length} aria-label={t.storyProgress} />
        </header>
        <div className={`story-scene scene-${page.scene}`} aria-hidden="true">
          <span>{sceneSymbols[page.scene] ?? '●'}</span>
        </div>
        <div className="story-copy" aria-live="polite">
          <p>{page.text}</p>
          <small>{page.prompt}</small>
          <button className="read-aloud" type="button" onClick={readCurrentPage}>{t.readPage}</button>
        </div>
        {(activeCopy?.calmingPrompt ?? activeStory.calming_prompt) && pageIndex === 0 && <p className="calming-note">{activeCopy?.calmingPrompt ?? activeStory.calming_prompt}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="reader-controls">
          <button className="secondary-action" disabled={actionBusy || pageIndex === 0} type="button" onClick={() => void moveToPage(pageIndex - 1)}>{t.previous}</button>
          {lastPage
            ? <button className="primary-action" disabled={actionBusy} type="button" onClick={() => void finishStory()}>{actionBusy ? t.saving : t.finish}</button>
            : <button className="primary-action" disabled={actionBusy} type="button" onClick={() => void moveToPage(pageIndex + 1)}>{actionBusy ? t.saving : t.next}</button>}
        </footer>
      </section>
    )
  }

  return (
    <section className={`story-experience ${mode}`}>
      <header className="story-title-band">
        <div>
          <p className="eyebrow">{mode === 'bedtime' ? t.bedtime : t.todayStories}</p>
          <h1>{mode === 'bedtime' ? t.settleDown : t.hello(selectedChild?.display_name ?? '')}</h1>
          <p>{mode === 'bedtime' ? t.bedtimeIntro : t.storyIntro}</p>
        </div>
        <label className="child-switcher">{t.playFor}
          <select value={activeChildId} onChange={(event) => {
            setChildId(event.target.value)
            setActiveStory(null)
            setSession(null)
            setPageIndex(0)
          }}>
            {children.map((child) => <option key={child.id} value={child.id}>{child.display_name} · {child.age_band} {t.years}</option>)}
          </select>
        </label>
      </header>

      {status === 'loading' && <div className="story-loading" role="status"><span />{t.loading}</div>}
      {status === 'error' && <StoryAccessState title={t.loadFailed} detail={error ?? t.retryDetail} action={t.reload} onAction={() => void loadDashboard()} />}
      {status === 'ready' && stories.length === 0 && <StoryAccessState title={t.noContent} detail={t.noContentDetail} action={t.reload} onAction={() => void loadDashboard()} />}
      {status === 'ready' && stories.length > 0 && (
        <div className="story-dashboard">
          <article className="featured-story">
            <img src={stories[0].cover_path} alt="" />
            <div>
              <span className="story-meta">{storyTranslations[stories[0].slug]?.[locale]?.theme ?? stories[0].theme} · {stories[0].duration_minutes} {t.minutes}</span>
              <h2>{storyTranslations[stories[0].slug]?.[locale]?.title ?? stories[0].title}</h2>
              <p>{storyTranslations[stories[0].slug]?.[locale]?.summary ?? stories[0].summary}</p>
              <button className="primary-action" disabled={actionBusy} type="button" onClick={() => void startStory(stories[0])}>{actionBusy ? t.preparing : t.start}</button>
            </div>
          </article>
          {stories.length > 1 && <div className="story-list" aria-label={t.moreStories}>
            {stories.slice(1).map((story) => (
              <article key={story.id} className="story-list-item">
                <img src={story.cover_path} alt="" />
                <div><small>{storyTranslations[story.slug]?.[locale]?.theme ?? story.theme} · {story.duration_minutes} {t.minutes}</small><h3>{storyTranslations[story.slug]?.[locale]?.title ?? story.title}</h3><p>{storyTranslations[story.slug]?.[locale]?.summary ?? story.summary}</p></div>
                <button type="button" aria-label={t.play(storyTranslations[story.slug]?.[locale]?.title ?? story.title)} onClick={() => void startStory(story)}>▶</button>
              </article>
            ))}
          </div>}
          {task && mode === 'standard' && <FamilyTaskCard task={task} busy={actionBusy} locale={locale} onComplete={completeTask} />}
        </div>
      )}
      {error && status !== 'error' && <p className="form-error" role="alert">{error}</p>}
    </section>
  )
}

function StoryAccessState({ title, detail, action, onAction }: { title: string; detail: string; action: string; onAction: () => void }) {
  return <section className="story-access-state"><div aria-hidden="true">◉</div><h1>{title}</h1><p>{detail}</p><button className="primary-action" type="button" onClick={onAction}>{action}</button></section>
}

function FamilyTaskCard({ task, busy, locale, onComplete }: { task: DailyFamilyTask; busy: boolean; locale: Locale; onComplete: () => void }) {
  const t = ui[locale].story
  const copy = taskTranslations[task.task_key]?.[locale]
  return <article className={`family-task ${task.completed_today ? 'completed' : ''}`}>
    <div className="family-task-icon" aria-hidden="true">{task.completed_today ? '✓' : '✦'}</div>
    <div><p className="eyebrow">{t.dailyTask} · {task.duration_minutes} {t.minutes}</p><h2>{copy?.title ?? task.title}</h2><p>{copy?.instruction ?? task.instruction}</p><small>{t.forParent}{copy?.parentTip ?? task.parent_tip}</small></div>
    <button className={task.completed_today ? 'secondary-action' : 'primary-action'} disabled={busy || task.completed_today} type="button" onClick={() => void onComplete()}>{task.completed_today ? t.taskDone : t.completeTask}</button>
  </article>
}
