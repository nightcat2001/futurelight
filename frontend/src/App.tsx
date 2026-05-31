import { useEffect, useMemo, useState } from 'react'
import './App.css'

type HomeSummary = {
  current_child: string
  recommendation: string
  next_action: string
  completed_units: number
  streak_days: number
  stars: number
}

type PageSummary = {
  id: string
  title: string
  primary_action: string
  route: string
}

const fallbackPages: PageSummary[] = [
  { id: 'home', title: '首頁', primary_action: '快速開始', route: '/' },
  { id: 'course-explore', title: '課程探索', primary_action: '查看詳情', route: '/courses' },
  { id: 'learning-player', title: '學習播放', primary_action: '我學會了', route: '/learn' },
  { id: 'practice-game', title: '練習遊戲', primary_action: '下一題', route: '/practice' },
]

function App() {
  const [home, setHome] = useState<HomeSummary | null>(null)
  const [pages, setPages] = useState<PageSummary[]>(fallbackPages)
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking')
  const [activePage, setActivePage] = useState('home')
  const [soundEnabled, setSoundEnabled] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [healthResponse, homeResponse, pagesResponse] = await Promise.all([
          fetch('/health'),
          fetch('/api/home/summary'),
          fetch('/api/pages'),
        ])

        if (!healthResponse.ok || !homeResponse.ok || !pagesResponse.ok) {
          throw new Error('API response failed')
        }

        setHome(await homeResponse.json())
        setPages(await pagesResponse.json())
        setApiStatus('ok')
      } catch {
        setApiStatus('error')
      }
    }

    load()
  }, [])

  const currentPage = useMemo(
    () => pages.find((page) => page.id === activePage) ?? pages[0],
    [activePage, pages],
  )

  function playClick() {
    if (!soundEnabled) return

    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 520
    gain.gain.setValueAtTime(0.025, audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.08)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.08)
  }

  function handleNavigation(page: PageSummary) {
    playClick()
    setActivePage(page.id)
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="brand-mark">FL</span>
          <span className="brand-name">FutureLight</span>
        </div>
        <nav aria-label="主要導覽">
          <button type="button" onClick={playClick}>家長中心</button>
          <button type="button" onClick={playClick}>系統設定</button>
        </nav>
      </header>

      <section className="status-strip" aria-live="polite">
        <span className={`status-dot ${apiStatus}`} />
        API 狀態：{apiStatus === 'checking' ? '檢查中' : apiStatus === 'ok' ? '已連線' : '尚未連線'}
      </section>

      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">小孩語言學習</p>
          <h1>今天從一個小任務開始</h1>
          <p className="summary">
            讓孩子透過故事、單字、聽力、跟讀和練習遊戲逐步建立語言感。
          </p>
          <div className="actions">
            <button className="primary-action" type="button" onClick={playClick}>
              快速開始
            </button>
            <button className="secondary-action" type="button" onClick={() => handleNavigation(pages[1] ?? fallbackPages[1])}>
              課程探索
            </button>
          </div>
        </div>

        <div className="today-card" aria-label="今日學習摘要">
          <span className="card-label">今日推薦</span>
          <h2>{home?.recommendation ?? '動物英文單字'}</h2>
          <p>目前孩子：{home?.current_child ?? '小安'}</p>
          <p>下一步：{home?.next_action ?? '繼續未完成學習'}</p>
          <div className="metric-grid">
            <strong>{home?.streak_days ?? 3}<span>連續天數</span></strong>
            <strong>{home?.completed_units ?? 8}<span>完成單元</span></strong>
            <strong>{home?.stars ?? 120}<span>星星</span></strong>
          </div>
        </div>
      </section>

      <section className="workspace">
        <aside className="page-list" aria-label="頁面導向">
          <h2>頁面操作</h2>
          {pages.map((page) => (
            <button
              className={page.id === activePage ? 'active' : ''}
              key={page.id}
              type="button"
              onClick={() => handleNavigation(page)}
            >
              <span>{page.title}</span>
              <small>{page.primary_action}</small>
            </button>
          ))}
        </aside>

        <section className="interaction-preview" aria-live="polite">
          <p className="eyebrow">目前頁面</p>
          <h2>{currentPage.title}</h2>
          <p>
            主要按鈕「{currentPage.primary_action}」會依互動導向規劃前往對應流程。
          </p>
          <div className="flow-row">
            <span>點選音效</span>
            <button type="button" onClick={() => setSoundEnabled((value) => !value)}>
              {soundEnabled ? '音效開啟' : '音效關閉'}
            </button>
          </div>
          <div className="route-chip">Route: {currentPage.route}</div>
        </section>
      </section>
    </main>
  )
}

export default App
