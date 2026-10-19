import { useCallback, useEffect, useMemo, useState } from 'react'

type ChildProfile = {
  id: string
  display_name: string
  age_band: string
}

type StorySummary = {
  id: string
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
}

const sceneSymbols: Record<string, string> = {
  seed: '●', rain: '☂', sun: '☀', sprout: '♧', cloud: '☁', bread: '◒',
  wind: '≋', door: '▥', share: '♥', moon: '☾', hands: '◡', feet: '⌒',
  star: '★', sleep: 'zZ',
}

export function StoryExperience({ authToken, children, mode, onOpenParent }: Props) {
  const [childId, setChildId] = useState(children[0]?.id ?? '')
  const [stories, setStories] = useState<StorySummary[]>([])
  const [task, setTask] = useState<DailyFamilyTask | null>(null)
  const [activeStory, setActiveStory] = useState<StoryDetail | null>(null)
  const [session, setSession] = useState<StorySession | null>(null)
  const [pageIndex, setPageIndex] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [actionBusy, setActionBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      if (!storyResponse.ok || !taskResponse.ok) throw new Error('無法載入故事內容')
      setStories(await storyResponse.json())
      setTask(await taskResponse.json())
      setStatus('ready')
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '無法載入故事內容')
      setStatus('error')
    }
  }, [activeChildId, authToken, mode])

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0)
    return () => window.clearTimeout(timer)
  }, [loadDashboard])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  function readCurrentPage() {
    if (!activeStory) return
    window.speechSynthesis?.cancel()
    const utterance = new SpeechSynthesisUtterance(activeStory.pages[pageIndex].text)
    utterance.lang = 'zh-TW'
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
          ? '請先到家長中心完成隱私同意，再開始記錄閱讀進度。'
          : '故事目前無法開始')
      }
      setActiveStory(await detailResponse.json())
      setSession(await sessionResponse.json())
      setPageIndex(0)
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : '故事目前無法開始')
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
      if (!response.ok) throw new Error('閱讀進度無法儲存，請再試一次。')
      setSession(await response.json())
      setPageIndex(nextPage)
    } catch (progressError) {
      setError(progressError instanceof Error ? progressError.message : '閱讀進度無法儲存')
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
      if (!response.ok) throw new Error('故事完成狀態無法儲存')
      setSession(await response.json())
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : '故事完成狀態無法儲存')
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
      if (!response.ok) throw new Error('每日任務完成狀態無法儲存')
      setTask(await response.json())
    } catch (taskError) {
      setError(taskError instanceof Error ? taskError.message : '每日任務完成狀態無法儲存')
    } finally {
      setActionBusy(false)
    }
  }

  if (!authToken) {
    return <StoryAccessState title="家長先登入" detail="登入後才能依孩子年齡推薦內容並保存閱讀進度。" action="前往家長中心" onAction={onOpenParent} />
  }
  if (children.length === 0) {
    return <StoryAccessState title="先建立孩子資料" detail="年齡是故事長度、文字量與互動難度的依據。" action="建立孩子" onAction={onOpenParent} />
  }

  if (activeStory && session?.completed_at) {
    const nextStory = stories.find((story) => story.id !== activeStory.id)
    return (
      <section className={`story-experience completion ${mode}`} aria-labelledby="story-complete-title">
        <div className="completion-mark" aria-hidden="true">✓</div>
        <p className="eyebrow">故事完成</p>
        <h1 id="story-complete-title">{selectedChild?.display_name}，你聽完了！</h1>
        <p className="completion-prompt">親子聊聊：{activeStory.parent_prompt}</p>
        <div className="completion-actions">
          {nextStory && <button className="primary-action" type="button" onClick={() => void startStory(nextStory)}>下一個故事</button>}
          <button className="secondary-action" type="button" onClick={() => { setActiveStory(null); setSession(null) }}>回到今日內容</button>
        </div>
        {task && <FamilyTaskCard task={task} busy={actionBusy} onComplete={completeTask} />}
      </section>
    )
  }

  if (activeStory && session) {
    const page = activeStory.pages[pageIndex]
    const lastPage = pageIndex === activeStory.pages.length - 1
    return (
      <section className={`story-reader ${mode}`} aria-label={`${activeStory.title} 故事播放器`}>
        <header className="reader-header">
          <button className="reader-close" type="button" aria-label="離開故事" onClick={() => { setActiveStory(null); setSession(null) }}>×</button>
          <div>
            <strong>{activeStory.title}</strong>
            <span>{pageIndex + 1} / {activeStory.pages.length}</span>
          </div>
          <progress value={pageIndex + 1} max={activeStory.pages.length} aria-label="故事進度" />
        </header>
        <div className={`story-scene scene-${page.scene}`} aria-hidden="true">
          <span>{sceneSymbols[page.scene] ?? '●'}</span>
        </div>
        <div className="story-copy" aria-live="polite">
          <p>{page.text}</p>
          <small>{page.prompt}</small>
          <button className="read-aloud" type="button" onClick={readCurrentPage}>朗讀這一頁</button>
        </div>
        {activeStory.calming_prompt && pageIndex === 0 && <p className="calming-note">{activeStory.calming_prompt}</p>}
        {error && <p className="form-error" role="alert">{error}</p>}
        <footer className="reader-controls">
          <button className="secondary-action" disabled={actionBusy || pageIndex === 0} type="button" onClick={() => void moveToPage(pageIndex - 1)}>上一頁</button>
          {lastPage
            ? <button className="primary-action" disabled={actionBusy} type="button" onClick={() => void finishStory()}>{actionBusy ? '儲存中' : '故事完成'}</button>
            : <button className="primary-action" disabled={actionBusy} type="button" onClick={() => void moveToPage(pageIndex + 1)}>{actionBusy ? '儲存中' : '下一頁'}</button>}
        </footer>
      </section>
    )
  }

  return (
    <section className={`story-experience ${mode}`}>
      <header className="story-title-band">
        <div>
          <p className="eyebrow">{mode === 'bedtime' ? '睡前模式' : '今天的故事'}</p>
          <h1>{mode === 'bedtime' ? '慢慢安靜下來' : `嗨，${selectedChild?.display_name}`}</h1>
          <p>{mode === 'bedtime' ? '低亮度、慢節奏，陪孩子安心結束今天。' : '依年齡準備的故事與親子活動。'}</p>
        </div>
        <label className="child-switcher">為誰播放
          <select value={activeChildId} onChange={(event) => {
            setChildId(event.target.value)
            setActiveStory(null)
            setSession(null)
            setPageIndex(0)
          }}>
            {children.map((child) => <option key={child.id} value={child.id}>{child.display_name} · {child.age_band} 歲</option>)}
          </select>
        </label>
      </header>

      {status === 'loading' && <div className="story-loading" role="status"><span />正在準備適合的故事…</div>}
      {status === 'error' && <StoryAccessState title="內容暫時載入失敗" detail={error ?? '請檢查連線後再試一次。'} action="重新載入" onAction={() => void loadDashboard()} />}
      {status === 'ready' && stories.length === 0 && <StoryAccessState title="這個年齡帶目前沒有內容" detail="我們不會用不合齡的故事填補空缺。" action="重新載入" onAction={() => void loadDashboard()} />}
      {status === 'ready' && stories.length > 0 && (
        <div className="story-dashboard">
          <article className="featured-story">
            <img src={stories[0].cover_path} alt="" />
            <div>
              <span className="story-meta">{stories[0].theme} · {stories[0].duration_minutes} 分鐘</span>
              <h2>{stories[0].title}</h2>
              <p>{stories[0].summary}</p>
              <button className="primary-action" disabled={actionBusy} type="button" onClick={() => void startStory(stories[0])}>{actionBusy ? '準備中' : '開始播放'}</button>
            </div>
          </article>
          {stories.length > 1 && <div className="story-list" aria-label="更多推薦故事">
            {stories.slice(1).map((story) => (
              <article key={story.id} className="story-list-item">
                <img src={story.cover_path} alt="" />
                <div><small>{story.theme} · {story.duration_minutes} 分鐘</small><h3>{story.title}</h3><p>{story.summary}</p></div>
                <button type="button" aria-label={`播放 ${story.title}`} onClick={() => void startStory(story)}>▶</button>
              </article>
            ))}
          </div>}
          {task && mode === 'standard' && <FamilyTaskCard task={task} busy={actionBusy} onComplete={completeTask} />}
        </div>
      )}
      {error && status !== 'error' && <p className="form-error" role="alert">{error}</p>}
    </section>
  )
}

function StoryAccessState({ title, detail, action, onAction }: { title: string; detail: string; action: string; onAction: () => void }) {
  return <section className="story-access-state"><div aria-hidden="true">◉</div><h1>{title}</h1><p>{detail}</p><button className="primary-action" type="button" onClick={onAction}>{action}</button></section>
}

function FamilyTaskCard({ task, busy, onComplete }: { task: DailyFamilyTask; busy: boolean; onComplete: () => void }) {
  return <article className={`family-task ${task.completed_today ? 'completed' : ''}`}>
    <div className="family-task-icon" aria-hidden="true">{task.completed_today ? '✓' : '✦'}</div>
    <div><p className="eyebrow">今日親子任務 · {task.duration_minutes} 分鐘</p><h2>{task.title}</h2><p>{task.instruction}</p><small>給家長：{task.parent_tip}</small></div>
    <button className={task.completed_today ? 'secondary-action' : 'primary-action'} disabled={busy || task.completed_today} type="button" onClick={() => void onComplete()}>{task.completed_today ? '今天已完成' : '完成任務'}</button>
  </article>
}
