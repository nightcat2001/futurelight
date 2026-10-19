export type Locale = 'zh-TW' | 'zh-CN' | 'fil-PH' | 'en'

export const localeOptions: Array<{ code: Locale; label: string }> = [
  { code: 'zh-TW', label: '繁體中文' },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'fil-PH', label: 'Filipino' },
  { code: 'en', label: 'English' },
]

export const speechLanguage: Record<Locale, string> = {
  'zh-TW': 'zh-TW',
  'zh-CN': 'zh-CN',
  'fil-PH': 'fil-PH',
  en: 'en-US',
}

type StoryUi = {
  signInTitle: string; signInDetail: string; parentCenter: string
  createChildTitle: string; createChildDetail: string; createChild: string
  storyComplete: string; heardIt: (name: string) => string; talkTogether: string
  nextStory: string; backToday: string; leaveStory: string; storyProgress: string
  readPage: string; previous: string; next: string; saving: string; finish: string
  bedtime: string; todayStories: string; settleDown: string; hello: (name: string) => string
  bedtimeIntro: string; storyIntro: string; playFor: string; years: string
  loading: string; loadFailed: string; retryDetail: string; reload: string
  noContent: string; noContentDetail: string; moreStories: string
  minutes: string; preparing: string; start: string; play: (title: string) => string
  dailyTask: string; forParent: string; taskDone: string; completeTask: string
  consentRequired: string; cannotStart: string; cannotSave: string
  cannotComplete: string; cannotCompleteTask: string; player: string
}

type UiDictionary = {
  nav: Record<string, string>
  install: string
  brandSubtitle: string
  api: { checking: string; ok: string; error: string }
  auth: { checking: string; signedOut: string; signedIn: string }
  home: {
    eyebrow: string; title: string; ready: string; loading: string; unavailable: string
    setup: string; start: string; parent: string
  }
  parent: {
    eyebrow: string; center: string; checking: string; checkingDetail: string
    signIn: string; createAccount: string; email: string; displayName: string
    password: string; locale: string; signingIn: string; creating: string
    newChild: string; editChild: string; createChild: string; updateChild: string
    ageBand: string; region: string; englishVariant: string; consent: string
    saveChild: string; updateProfile: string; privacy: string; saving: string; cancel: string
  }
  story: StoryUi
}

export const ui: Record<Locale, UiDictionary> = {
  'zh-TW': {
    nav: { home: '首頁', courses: '課程', learn: '學習', practice: '練習', parent: '家長', content: '內容管理', settings: '設定', stories: '故事', bedtime: '睡前' },
    install: '安裝', brandSubtitle: '親子故事與成長',
    api: { checking: '正在連線', ok: '服務已連線', error: '服務無法連線' },
    auth: { checking: '正在檢查帳號', signedOut: '家長未登入', signedIn: '家長已登入' },
    home: { eyebrow: '今天', title: '今天，一起走進故事裡。', ready: '故事、親子任務和睡前陪伴都準備好了。', loading: '正在準備今天適合孩子的內容。', unavailable: '服務暫時無法連線。', setup: '開始建立家庭資料', start: '開始今天的故事', parent: '家長中心' },
    parent: { eyebrow: '家長', center: '家長中心', checking: '正在確認家長帳號', checkingDetail: '正在安全地確認登入狀態。', signIn: '登入', createAccount: '建立帳號', email: '電子郵件', displayName: '顯示名稱', password: '密碼', locale: '語言', signingIn: '登入中', creating: '建立中', newChild: '新增孩子', editChild: '編輯孩子', createChild: '建立孩子資料', updateChild: '更新孩子資料', ageBand: '年齡', region: '地區', englishVariant: '英語版本', consent: '記錄家長隱私同意', saveChild: '建立孩子', updateProfile: '儲存修改', privacy: '隱私', saving: '儲存中', cancel: '取消' },
    story: { signInTitle: '家長先登入', signInDetail: '登入後才能依孩子年齡推薦內容並保存閱讀進度。', parentCenter: '前往家長中心', createChildTitle: '先建立孩子資料', createChildDetail: '年齡是故事長度、文字量與互動難度的依據。', createChild: '建立孩子', storyComplete: '故事完成', heardIt: (name) => `${name}，你聽完了！`, talkTogether: '親子聊聊：', nextStory: '下一個故事', backToday: '回到今日內容', leaveStory: '離開故事', storyProgress: '故事進度', readPage: '朗讀這一頁', previous: '上一頁', next: '下一頁', saving: '儲存中', finish: '故事完成', bedtime: '睡前模式', todayStories: '今天的故事', settleDown: '慢慢安靜下來', hello: (name) => `嗨，${name}`, bedtimeIntro: '低亮度、慢節奏，陪孩子安心結束今天。', storyIntro: '依年齡準備的故事與親子活動。', playFor: '為誰播放', years: '歲', loading: '正在準備適合的故事…', loadFailed: '內容暫時載入失敗', retryDetail: '請檢查連線後再試一次。', reload: '重新載入', noContent: '這個年齡帶目前沒有內容', noContentDetail: '我們不會用不合齡的故事填補空缺。', moreStories: '更多推薦故事', minutes: '分鐘', preparing: '準備中', start: '開始播放', play: (title) => `播放 ${title}`, dailyTask: '今日親子任務', forParent: '給家長：', taskDone: '今天已完成', completeTask: '完成任務', consentRequired: '請先到家長中心完成隱私同意，再開始記錄閱讀進度。', cannotStart: '故事目前無法開始', cannotSave: '閱讀進度無法儲存，請再試一次。', cannotComplete: '故事完成狀態無法儲存', cannotCompleteTask: '每日任務完成狀態無法儲存', player: '故事播放器' },
  },
  'zh-CN': {
    nav: { home: '首页', courses: '课程', learn: '学习', practice: '练习', parent: '家长', content: '内容管理', settings: '设置', stories: '故事', bedtime: '睡前' },
    install: '安装', brandSubtitle: '亲子故事与成长',
    api: { checking: '正在连接', ok: '服务已连接', error: '服务无法连接' },
    auth: { checking: '正在检查账号', signedOut: '家长未登录', signedIn: '家长已登录' },
    home: { eyebrow: '今天', title: '今天，一起走进故事里。', ready: '故事、亲子任务和睡前陪伴都准备好了。', loading: '正在准备今天适合孩子的内容。', unavailable: '服务暂时无法连接。', setup: '开始建立家庭资料', start: '开始今天的故事', parent: '家长中心' },
    parent: { eyebrow: '家长', center: '家长中心', checking: '正在确认家长账号', checkingDetail: '正在安全地确认登录状态。', signIn: '登录', createAccount: '创建账号', email: '电子邮箱', displayName: '显示名称', password: '密码', locale: '语言', signingIn: '登录中', creating: '创建中', newChild: '新增孩子', editChild: '编辑孩子', createChild: '创建孩子资料', updateChild: '更新孩子资料', ageBand: '年龄', region: '地区', englishVariant: '英语版本', consent: '记录家长隐私同意', saveChild: '创建孩子', updateProfile: '保存修改', privacy: '隐私', saving: '保存中', cancel: '取消' },
    story: { signInTitle: '请家长先登录', signInDetail: '登录后才能按孩子年龄推荐内容并保存阅读进度。', parentCenter: '前往家长中心', createChildTitle: '请先创建孩子资料', createChildDetail: '年龄决定故事长度、文字量和互动难度。', createChild: '创建孩子', storyComplete: '故事完成', heardIt: (name) => `${name}，你听完了！`, talkTogether: '亲子聊聊：', nextStory: '下一个故事', backToday: '返回今日内容', leaveStory: '离开故事', storyProgress: '故事进度', readPage: '朗读这一页', previous: '上一页', next: '下一页', saving: '保存中', finish: '故事完成', bedtime: '睡前模式', todayStories: '今天的故事', settleDown: '慢慢安静下来', hello: (name) => `嗨，${name}`, bedtimeIntro: '低亮度、慢节奏，陪孩子安心结束今天。', storyIntro: '按年龄准备的故事和亲子活动。', playFor: '为谁播放', years: '岁', loading: '正在准备适合的故事…', loadFailed: '内容暂时加载失败', retryDetail: '请检查连接后再试一次。', reload: '重新加载', noContent: '这个年龄段目前没有内容', noContentDetail: '我们不会用不适龄的故事填补空缺。', moreStories: '更多推荐故事', minutes: '分钟', preparing: '准备中', start: '开始播放', play: (title) => `播放 ${title}`, dailyTask: '今日亲子任务', forParent: '给家长：', taskDone: '今天已完成', completeTask: '完成任务', consentRequired: '请先到家长中心完成隐私同意，再开始记录阅读进度。', cannotStart: '故事目前无法开始', cannotSave: '阅读进度无法保存，请再试一次。', cannotComplete: '故事完成状态无法保存', cannotCompleteTask: '每日任务完成状态无法保存', player: '故事播放器' },
  },
  'fil-PH': {
    nav: { home: 'Tahanan', courses: 'Kurso', learn: 'Matuto', practice: 'Magsanay', parent: 'Magulang', content: 'Nilalaman', settings: 'Settings', stories: 'Mga Kuwento', bedtime: 'Oras ng Tulog' },
    install: 'I-install', brandSubtitle: 'Mga kuwento at paglaki ng pamilya',
    api: { checking: 'Kumokonekta', ok: 'Nakakonekta ang serbisyo', error: 'Hindi makakonekta' },
    auth: { checking: 'Sinusuri ang account', signedOut: 'Hindi naka-sign in', signedIn: 'Naka-sign in ang magulang' },
    home: { eyebrow: 'Ngayon', title: 'Sabay tayong pumasok sa kuwento.', ready: 'Handa na ang mga kuwento, gawain, at oras ng tulog.', loading: 'Inihahanda ang nilalaman para sa iyong anak.', unavailable: 'Pansamantalang hindi makakonekta.', setup: 'I-set up ang pamilya', start: 'Simulan ang kuwento', parent: 'Sentro ng Magulang' },
    parent: { eyebrow: 'Magulang', center: 'Sentro ng Magulang', checking: 'Sinusuri ang account', checkingDetail: 'Ligtas na sinusuri ang iyong sign-in.', signIn: 'Mag-sign In', createAccount: 'Gumawa ng Account', email: 'Email', displayName: 'Pangalan', password: 'Password', locale: 'Wika', signingIn: 'Nagsa-sign in', creating: 'Ginagawa', newChild: 'Bagong Bata', editChild: 'I-edit ang Bata', createChild: 'Gumawa ng profile ng bata', updateChild: 'I-update ang profile', ageBand: 'Edad', region: 'Rehiyon', englishVariant: 'Bersyon ng Ingles', consent: 'Itala ang pahintulot sa privacy', saveChild: 'Gumawa ng Profile', updateProfile: 'I-save ang Pagbabago', privacy: 'Privacy', saving: 'Sine-save', cancel: 'Kanselahin' },
    story: { signInTitle: 'Mag-sign in muna ang magulang', signInDetail: 'Mag-sign in para makapili ayon sa edad at mai-save ang progreso.', parentCenter: 'Pumunta sa Sentro ng Magulang', createChildTitle: 'Gumawa muna ng profile ng bata', createChildDetail: 'Ang edad ang batayan ng haba, dami ng salita, at hirap ng gawain.', createChild: 'Gumawa ng Profile', storyComplete: 'Tapos ang Kuwento', heardIt: (name) => `${name}, natapos mo ang kuwento!`, talkTogether: 'Pag-usapan natin: ', nextStory: 'Susunod na Kuwento', backToday: 'Bumalik sa Ngayon', leaveStory: 'Umalis sa kuwento', storyProgress: 'Progreso ng kuwento', readPage: 'Basahin nang malakas', previous: 'Nakaraan', next: 'Susunod', saving: 'Sine-save', finish: 'Tapusin ang Kuwento', bedtime: 'Oras ng Tulog', todayStories: 'Mga Kuwento Ngayon', settleDown: 'Dahan-dahang magpahinga', hello: (name) => `Kumusta, ${name}`, bedtimeIntro: 'Mahinang liwanag at mabagal na ritmo para sa payapang pagtatapos ng araw.', storyIntro: 'Mga kuwento at gawain na angkop sa edad.', playFor: 'Para kanino', years: 'taon', loading: 'Inihahanda ang tamang kuwento…', loadFailed: 'Hindi ma-load ang nilalaman', retryDetail: 'Suriin ang koneksyon at subukan muli.', reload: 'I-load muli', noContent: 'Walang nilalaman para sa edad na ito', noContentDetail: 'Hindi kami magpapakita ng kuwentong hindi angkop sa edad.', moreStories: 'Iba pang kuwento', minutes: 'minuto', preparing: 'Inihahanda', start: 'Simulan', play: (title) => `I-play ang ${title}`, dailyTask: 'Gawain ng Pamilya Ngayon', forParent: 'Para sa magulang: ', taskDone: 'Tapos na ngayon', completeTask: 'Tapusin ang Gawain', consentRequired: 'Kumpletuhin muna ang pahintulot sa privacy sa Sentro ng Magulang.', cannotStart: 'Hindi masimulan ang kuwento', cannotSave: 'Hindi ma-save ang progreso. Subukan muli.', cannotComplete: 'Hindi ma-save ang pagtatapos ng kuwento', cannotCompleteTask: 'Hindi ma-save ang gawain', player: 'player ng kuwento' },
  },
  en: {
    nav: { home: 'Home', courses: 'Courses', learn: 'Learn', practice: 'Practice', parent: 'Parent', content: 'Content', settings: 'Settings', stories: 'Stories', bedtime: 'Bedtime' },
    install: 'Install', brandSubtitle: 'Family stories and growth',
    api: { checking: 'Connecting', ok: 'Service connected', error: 'Service unavailable' },
    auth: { checking: 'Checking account', signedOut: 'Parent signed out', signedIn: 'Parent signed in' },
    home: { eyebrow: 'Today', title: 'Step into a story together.', ready: 'Stories, family activities, and bedtime are ready.', loading: 'Preparing today’s content for your child.', unavailable: 'The service is temporarily unavailable.', setup: 'Set Up Your Family', start: 'Start Today’s Story', parent: 'Parent Center' },
    parent: { eyebrow: 'Parent', center: 'Parent Center', checking: 'Checking parent account', checkingDetail: 'Securely validating your sign-in.', signIn: 'Sign In', createAccount: 'Create Account', email: 'Email', displayName: 'Display Name', password: 'Password', locale: 'Language', signingIn: 'Signing In', creating: 'Creating', newChild: 'New Child', editChild: 'Edit Child', createChild: 'Create child profile', updateChild: 'Update child profile', ageBand: 'Age', region: 'Region', englishVariant: 'English Variant', consent: 'Record parent privacy consent', saveChild: 'Create Child', updateProfile: 'Save Changes', privacy: 'Privacy', saving: 'Saving', cancel: 'Cancel' },
    story: { signInTitle: 'Parent sign-in required', signInDetail: 'Sign in to get age-based recommendations and save reading progress.', parentCenter: 'Go to Parent Center', createChildTitle: 'Create a child profile first', createChildDetail: 'Age determines story length, word count, and interaction difficulty.', createChild: 'Create Child', storyComplete: 'Story Complete', heardIt: (name) => `${name}, you finished the story!`, talkTogether: 'Talk together: ', nextStory: 'Next Story', backToday: 'Back to Today', leaveStory: 'Leave story', storyProgress: 'Story progress', readPage: 'Read This Page Aloud', previous: 'Previous', next: 'Next', saving: 'Saving', finish: 'Finish Story', bedtime: 'Bedtime Mode', todayStories: 'Today’s Stories', settleDown: 'Slow down and settle in', hello: (name) => `Hi, ${name}`, bedtimeIntro: 'Low light and a gentle pace for a calm end to the day.', storyIntro: 'Age-appropriate stories and family activities.', playFor: 'Playing for', years: 'years', loading: 'Preparing the right stories…', loadFailed: 'Content could not be loaded', retryDetail: 'Check the connection and try again.', reload: 'Reload', noContent: 'No content for this age yet', noContentDetail: 'We will not fill the gap with an age-inappropriate story.', moreStories: 'More recommended stories', minutes: 'minutes', preparing: 'Preparing', start: 'Start Story', play: (title) => `Play ${title}`, dailyTask: 'Today’s Family Task', forParent: 'For parents: ', taskDone: 'Done Today', completeTask: 'Complete Task', consentRequired: 'Complete privacy consent in Parent Center before saving progress.', cannotStart: 'The story could not start', cannotSave: 'Progress could not be saved. Try again.', cannotComplete: 'Story completion could not be saved', cannotCompleteTask: 'Task completion could not be saved', player: 'story player' },
  },
}

export type LocalizedStory = {
  title: string; summary: string; theme: string; parentPrompt: string
  calmingPrompt?: string; pages: Array<{ text: string; prompt: string }>
}

export const storyTranslations: Record<string, Record<Locale, LocalizedStory>> = {
  'little-seed-finds-sun': {
    'zh-TW': { title: '小種子找到太陽', summary: '跟著小種子感受雨水、泥土與陽光，練習等待與觀察。', theme: '自然與耐心', parentPrompt: '和孩子一起找家中一個正在長大的東西。', pages: [{ text: '小種子躺在軟軟的泥土裡。', prompt: '你找到小種子了嗎？' }, { text: '滴答、滴答，春雨來喝水。', prompt: '用手指點一點雨滴。' }, { text: '暖暖的太陽說：慢慢長大吧。', prompt: '把雙手張開，像太陽一樣。' }, { text: '啵！小嫩芽探出頭，向大家說早安。', prompt: '和小嫩芽一起說早安。' }] },
    'zh-CN': { title: '小种子找到太阳', summary: '跟着小种子感受雨水、泥土和阳光，练习等待与观察。', theme: '自然与耐心', parentPrompt: '和孩子一起找找家中正在长大的东西。', pages: [{ text: '小种子躺在软软的泥土里。', prompt: '你找到小种子了吗？' }, { text: '滴答、滴答，春雨来喝水。', prompt: '用手指点一点雨滴。' }, { text: '暖暖的太阳说：慢慢长大吧。', prompt: '把双手张开，像太阳一样。' }, { text: '啵！小嫩芽探出头，向大家说早安。', prompt: '和小嫩芽一起说早安。' }] },
    'fil-PH': { title: 'Natagpuan ng Munting Binhi ang Araw', summary: 'Damhin ang ulan, lupa, at araw habang natututo ng paghihintay at pagmamasid.', theme: 'Kalikasan at Pagtitiis', parentPrompt: 'Maghanap kasama ang bata ng isang bagay sa bahay na lumalaki.', pages: [{ text: 'Nakahiga ang munting binhi sa malambot na lupa.', prompt: 'Nakikita mo ba ang binhi?' }, { text: 'Patak, patak. Dumating ang ulan para painumin ito.', prompt: 'Ituro ang mga patak ng ulan.' }, { text: 'Sabi ng mainit na araw, “Lumaki ka nang dahan-dahan.”', prompt: 'Ibuka ang mga kamay na parang araw.' }, { text: 'Pop! Sumilip ang munting usbong at bumati ng magandang umaga.', prompt: 'Bumati rin sa munting usbong.' }] },
    en: { title: 'The Little Seed Finds the Sun', summary: 'Feel rain, soil, and sunshine while practicing patience and observation.', theme: 'Nature and Patience', parentPrompt: 'Find one thing at home that is growing.', pages: [{ text: 'A little seed rested in the soft soil.', prompt: 'Can you find the little seed?' }, { text: 'Drip, drop. Spring rain came to give it a drink.', prompt: 'Point to the raindrops.' }, { text: 'The warm sun said, “Take your time and grow.”', prompt: 'Open your arms wide like the sun.' }, { text: 'Pop! A tiny sprout peeked out and said good morning.', prompt: 'Say good morning to the sprout.' }] },
  },
  'cloud-bread-delivery': {
    'zh-TW': { title: '雲朵麵包送到了', summary: '小米和爸爸合作，把香香的雲朵麵包送給需要幫忙的鄰居。', theme: '合作與同理', parentPrompt: '請孩子選一件今天能一起完成的小事，完成後互相說謝謝。', pages: [{ text: '小米在窗邊接住一朵像棉花的白雲。', prompt: '白雲摸起來會像什麼？' }, { text: '爸爸揉呀揉，把白雲做成圓圓的小麵包。', prompt: '一起做揉麵團的動作。' }, { text: '門外的風很大，他們一起抱緊麵包籃。', prompt: '遇到困難時，可以請誰幫忙？' }, { text: '第一個麵包送給腳受傷的林奶奶。', prompt: '小米為什麼先來這裡？' }, { text: '最後一個麵包，爸爸和小米一人一半。', prompt: '想一想，你今天和誰分享過？' }] },
    'zh-CN': { title: '云朵面包送到了', summary: '小米和爸爸合作，把香香的云朵面包送给需要帮助的邻居。', theme: '合作与同理', parentPrompt: '请孩子选一件今天能一起完成的小事，完成后互相说谢谢。', pages: [{ text: '小米在窗边接住一朵像棉花的白云。', prompt: '白云摸起来会像什么？' }, { text: '爸爸揉呀揉，把白云做成圆圆的小面包。', prompt: '一起做揉面团的动作。' }, { text: '门外的风很大，他们一起抱紧面包篮。', prompt: '遇到困难时，可以请谁帮忙？' }, { text: '第一个面包送给脚受伤的林奶奶。', prompt: '小米为什么先来这里？' }, { text: '最后一个面包，爸爸和小米一人一半。', prompt: '想一想，你今天和谁分享过？' }] },
    'fil-PH': { title: 'Dumating na ang Tinapay na Ulap', summary: 'Nagtulungan si Mimi at Tatay upang maghatid ng mabangong tinapay sa kapitbahay.', theme: 'Pagtutulungan at Malasakit', parentPrompt: 'Pumili ng isang maliit na gawaing magagawa ninyo ngayon at magpasalamat pagkatapos.', pages: [{ text: 'Sinalo ni Mimi sa bintana ang puting ulap na parang bulak.', prompt: 'Ano kaya ang pakiramdam ng ulap?' }, { text: 'Minasa ni Tatay ang ulap at ginawang bilog na tinapay.', prompt: 'Gayahin ang pagmamasa ng masa.' }, { text: 'Malakas ang hangin sa labas kaya sabay nilang niyakap ang basket.', prompt: 'Sino ang mahihingan mo ng tulong?' }, { text: 'Ang unang tinapay ay para kay Lola Lina na masakit ang paa.', prompt: 'Bakit dito muna pumunta si Mimi?' }, { text: 'Ang huling tinapay ay pinaghati-hatian nina Tatay at Mimi.', prompt: 'Kanino ka nagbahagi ngayon?' }] },
    en: { title: 'The Cloud Bread Delivery', summary: 'Mia and Dad work together to bring warm cloud bread to a neighbor who needs help.', theme: 'Teamwork and Empathy', parentPrompt: 'Choose one small job to do together today, then thank each other.', pages: [{ text: 'Mia caught a white, cottony cloud by the window.', prompt: 'What might a cloud feel like?' }, { text: 'Dad kneaded the cloud into round little loaves.', prompt: 'Pretend to knead the dough together.' }, { text: 'The wind blew hard, so they held the bread basket together.', prompt: 'Who can you ask for help?' }, { text: 'The first loaf went to Grandma Lin, whose foot was hurt.', prompt: 'Why did Mia come here first?' }, { text: 'Dad and Mia shared the last loaf, half and half.', prompt: 'Who did you share with today?' }] },
  },
  'moon-boat-goodnight': {
    'zh-TW': { title: '月亮小船晚安', summary: '搭上慢慢搖晃的月亮小船，向一天裡遇見的人和事說晚安。', theme: '安定與睡眠', parentPrompt: '睡前只問一題：今天哪一件事讓你覺得暖暖的？', calmingPrompt: '把螢幕亮度調低，跟著每頁提示做一次慢呼吸。', pages: [{ text: '月亮小船停在窗邊，輕輕搖呀搖。', prompt: '慢慢吸一口氣。' }, { text: '我們向忙了一天的小手說晚安。', prompt: '把小手放鬆在棉被上。' }, { text: '我們向跑跑跳跳的小腳說晚安。', prompt: '讓小腳安靜地休息。' }, { text: '今天開心的事，變成一顆亮亮的星星。', prompt: '想一件今天開心的事。' }, { text: '小船回到夢裡。晚安，我們明天見。', prompt: '閉上眼睛，慢慢呼吸。' }] },
    'zh-CN': { title: '月亮小船晚安', summary: '搭上慢慢摇晃的月亮小船，向一天里遇见的人和事说晚安。', theme: '安定与睡眠', parentPrompt: '睡前只问一题：今天哪一件事让你觉得暖暖的？', calmingPrompt: '把屏幕亮度调低，跟着每页提示做一次慢呼吸。', pages: [{ text: '月亮小船停在窗边，轻轻摇呀摇。', prompt: '慢慢吸一口气。' }, { text: '我们向忙了一天的小手说晚安。', prompt: '把小手放松在被子上。' }, { text: '我们向跑跑跳跳的小脚说晚安。', prompt: '让小脚安静地休息。' }, { text: '今天开心的事，变成一颗亮亮的星星。', prompt: '想一件今天开心的事。' }, { text: '小船回到梦里。晚安，我们明天见。', prompt: '闭上眼睛，慢慢呼吸。' }] },
    'fil-PH': { title: 'Magandang Gabi, Bangkang Buwan', summary: 'Sumakay sa marahang umuugoy na bangkang buwan at magpaalam sa buong araw.', theme: 'Kapanatagan at Tulog', parentPrompt: 'Bago matulog, itanong: Ano ang nagbigay sa iyo ng saya ngayon?', calmingPrompt: 'Hinaan ang liwanag ng screen at huminga nang marahan sa bawat pahina.', pages: [{ text: 'Huminto ang bangkang buwan sa bintana at marahang umindayog.', prompt: 'Huminga nang dahan-dahan.' }, { text: 'Nag-good night tayo sa maliliit na kamay na nagtrabaho buong araw.', prompt: 'Ipahinga ang mga kamay sa kumot.' }, { text: 'Nag-good night tayo sa mga paang tumakbo at tumalon.', prompt: 'Hayaan nang magpahinga ang mga paa.' }, { text: 'Ang masayang sandali ngayon ay naging isang maliwanag na bituin.', prompt: 'Mag-isip ng isang masayang sandali.' }, { text: 'Bumalik ang bangka sa panaginip. Magandang gabi. Kita tayo bukas.', prompt: 'Ipikit ang mata at huminga nang marahan.' }] },
    en: { title: 'Goodnight, Moon Boat', summary: 'Ride the gently rocking moon boat and say goodnight to the people and moments of the day.', theme: 'Calm and Sleep', parentPrompt: 'Ask one bedtime question: What made you feel warm and happy today?', calmingPrompt: 'Lower the screen brightness and take one slow breath on each page.', pages: [{ text: 'The moon boat stopped by the window and rocked gently.', prompt: 'Take one slow breath.' }, { text: 'We said goodnight to the little hands that worked all day.', prompt: 'Rest your hands on the blanket.' }, { text: 'We said goodnight to the feet that ran and jumped.', prompt: 'Let your feet rest quietly.' }, { text: 'A happy moment from today became a bright star.', prompt: 'Think of one happy moment.' }, { text: 'The boat sailed back into dreams. Goodnight. See you tomorrow.', prompt: 'Close your eyes and breathe slowly.' }] },
  },
}

export type LocalizedTask = { title: string; instruction: string; parentTip: string }

export const taskTranslations: Record<string, Record<Locale, LocalizedTask>> = {
  'find-three-colors': {
    'zh-TW': { title: '找找三種顏色', instruction: '一起在家裡找到紅色、綠色和黃色的東西。', parentTip: '讓孩子用指認、拿取或說出名稱的方式完成，不要求讀字。' },
    'zh-CN': { title: '找找三种颜色', instruction: '一起在家里找到红色、绿色和黄色的东西。', parentTip: '让孩子用指认、拿取或说出名称的方式完成，不要求读字。' },
    'fil-PH': { title: 'Maghanap ng Tatlong Kulay', instruction: 'Maghanap sa bahay ng isang bagay na pula, berde, at dilaw.', parentTip: 'Puwedeng ituro, kunin, o pangalanan ng bata. Hindi kailangang magbasa.' },
    en: { title: 'Find Three Colors', instruction: 'Find something red, green, and yellow together at home.', parentTip: 'Let the child point, pick up, or name each item. Reading is not required.' },
  },
  'kindness-helper': {
    'zh-TW': { title: '今天的小幫手', instruction: '請孩子選一件可以和大人一起完成的家事。', parentTip: '把任務拆成一個清楚動作，例如把湯匙放上桌。' },
    'zh-CN': { title: '今天的小帮手', instruction: '请孩子选一件可以和大人一起完成的家务。', parentTip: '把任务拆成一个清楚动作，例如把勺子放上桌。' },
    'fil-PH': { title: 'Munting Katulong Ngayon', instruction: 'Pumili ng isang gawaing bahay na magagawa ng bata kasama ang matanda.', parentTip: 'Gawing isang malinaw na kilos, gaya ng paglalagay ng kutsara sa mesa.' },
    en: { title: 'Today’s Little Helper', instruction: 'Let the child choose one household job to do with an adult.', parentTip: 'Make it one clear action, such as putting spoons on the table.' },
  },
  'story-feeling-face': {
    'zh-TW': { title: '故事表情遊戲', instruction: '輪流做出故事角色開心、擔心和安心的表情。', parentTip: '先示範，再讓孩子自由模仿；不糾正表情是否標準。' },
    'zh-CN': { title: '故事表情游戏', instruction: '轮流做出故事角色开心、担心和安心的表情。', parentTip: '先示范，再让孩子自由模仿；不纠正表情是否标准。' },
    'fil-PH': { title: 'Laro ng Mukha at Damdamin', instruction: 'Salit-salitang gayahin ang masaya, nag-aalala, at panatag na mukha ng tauhan.', parentTip: 'Magpakita muna, saka hayaang gumaya ang bata nang malaya. Huwag itama ang ekspresyon.' },
    en: { title: 'Story Feeling Faces', instruction: 'Take turns making the character’s happy, worried, and calm faces.', parentTip: 'Model each feeling first, then let the child imitate freely without correction.' },
  },
}

export function validateI18nCoverage() {
  const locales = localeOptions.map((option) => option.code)
  const expectedPageCounts: Record<string, number> = {
    'little-seed-finds-sun': 4,
    'cloud-bread-delivery': 5,
    'moon-boat-goodnight': 5,
  }

  for (const [slug, expectedPages] of Object.entries(expectedPageCounts)) {
    const translations = storyTranslations[slug]
    if (!translations) throw new Error(`Missing story translations: ${slug}`)
    for (const locale of locales) {
      const translation = translations[locale]
      if (!translation) throw new Error(`Missing ${locale} story translation: ${slug}`)
      if (translation.pages.length !== expectedPages) {
        throw new Error(`Wrong ${locale} page coverage for ${slug}`)
      }
      if (![translation.title, translation.summary, translation.theme, translation.parentPrompt]
        .every((value) => value.trim().length > 0)) {
        throw new Error(`Empty ${locale} story copy: ${slug}`)
      }
      if (!translation.pages.every((page) => page.text.trim() && page.prompt.trim())) {
        throw new Error(`Empty ${locale} page copy: ${slug}`)
      }
    }
  }

  for (const [taskKey, translations] of Object.entries(taskTranslations)) {
    for (const locale of locales) {
      const translation = translations[locale]
      if (!translation) throw new Error(`Missing ${locale} task translation: ${taskKey}`)
      if (![translation.title, translation.instruction, translation.parentTip]
        .every((value) => value.trim().length > 0)) {
        throw new Error(`Empty ${locale} task copy: ${taskKey}`)
      }
    }
  }

  return {
    locales: locales.length,
    stories: Object.keys(expectedPageCounts).length,
    tasks: Object.keys(taskTranslations).length,
  }
}

validateI18nCoverage()
