import { useState, useEffect, useRef } from 'react';
import Ticker from './components/Ticker';
import './App.css';
import './recording.css';

const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const NUMBERS = '0123456789';
const PRICE_CHARS = ['0123456789.,'];
const PRIVACY_CHARS = ['0123456789.,*'];
const VOLUME_CHARS = ['0123456789,'];

// 辅助函数：生成位数可能变化的随机数
const randomWithDigitChange = (current: number) => {
    const r = Math.random();
    if (r > 0.8) return Math.floor(Math.random() * 10000); // 4位
    if (r > 0.5) return Math.floor(Math.random() * 1000);  // 3位
    return Math.floor(Math.random() * 100);                // 2位
};

function App() {
    // 状态定义
    const [heroPrice, setHeroPrice] = useState(73.18);
    const [animDuration, setAnimDuration] = useState(800);
    const [easing, setEasing] = useState('easeInOut');
    const [charWidth, setCharWidth] = useState(1);

    const sequenceIdx = useRef(0);
    const priceSequence = [73.18, 76.58, 173.50, 9.1];

    const [digitDemo, setDigitDemo] = useState(999);
    const [interruptTarget, setInterruptTarget] = useState(50);
    const [mixedDemo, setMixedDemo] = useState('A1-B2#C');

    const [volume, setVolume] = useState(8567890);
    const [scoreA, setScoreA] = useState(1);
    const [scoreB, setScoreB] = useState(1);

    // Scenarios State
    const [btcPrice, setBtcPrice] = useState(98456.32);
    const [btcTrend, setBtcTrend] = useState<'up' | 'down'>('up');
    const [isBalanceHidden, setIsBalanceHidden] = useState(false);

    const [lang, setLang] = useState<'zh' | 'en'>('zh');
    const [theme, setTheme] = useState<'dark' | 'light'>('light');

    // 主题切换
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

    // 自动更新模拟数据
    useEffect(() => {
        const interval = setInterval(() => {
            // 按顺序更新 Hero 价格
            sequenceIdx.current = (sequenceIdx.current + 1) % priceSequence.length;
            setHeroPrice(priceSequence[sequenceIdx.current]);

            // 更新 BTC 价格
            const btcChange = (Math.random() - 0.5) * 500;
            setBtcPrice(prev => prev + btcChange);
            setBtcTrend(btcChange >= 0 ? 'up' : 'down');

            // 统一更新场景模拟数据
            setVolume(prev => Math.floor(prev * (1 + (Math.random() - 0.5) * 0.05)));

            // 随机加分
            if (Math.random() > 0.5) setScoreA(s => s >= 99 ? 0 : s + 1);
            else setScoreB(s => s >= 99 ? 0 : s + 1);

            // 自动切换隐私模式
            setIsBalanceHidden(prev => !prev);
        }, animDuration + 1000); // 动态更新频率：动画时长 + 1秒停留
        return () => clearInterval(interval);
    }, [animDuration]);

    // 语言包
    const t = {
        zh: {
            title: 'SmartTicker',
            subtitle: '基于 Levenshtein diff 算法的高性能文本滚动组件，支持React/Vue',
            price: '价格',
            duration: '动画时长',
            width: '字符宽度',
            easing: '缓动曲线',
            easings: {
                linear: '线性',
                easeOut: '减速',
                easeIn: '加速',
                easeInOut: '先加后减',
                bounce: '回弹',
            },
            features: {
                digit: { title: '智能位变', badge: 'Diff 算法', desc: '自动计算最短变更路径，平滑处理位数增减' },
                interrupt: {
                    title: '中断衔接',
                    badge: '稳定',
                    desc: '动画进行中可随时更新目标值，过渡自然流畅',
                    action: '快速连续点击测试'
                },
                mixed: {
                    title: '混合字符',
                    badge: '多样式',
                    desc: '支持数字、字母、符号混合滚动',
                    action: '随机生成'
                }
            },
            scenes: {
                title: '现实场景模拟',
                airport: '机场信息',
                elevator: '电梯楼层',
                volume: '成交量',
                score: '体育比分',
                privacy: '隐私模式'
            },
            highlights: [
                'Levenshtein 距离算法计算最优编辑路径',
                '支持动画中途打断并平滑过渡到新目标',
                '位数变化时自动添加/删除列动画',
                '字符环形滚动，选择最短路径'
            ],
            inspiration: '灵感来源: Robinhood/Ticker',
            flight: '航班',
            gate: '登机口',
            vueDemo: 'Vue 演示',
            github: 'GitHub'
        },
        en: {
            title: 'SmartTicker',
            subtitle: 'High-performance text scrolling based on Levenshtein Diff, supports React/Vue',
            price: 'Price',
            duration: 'Duration',
            width: 'Char Width',
            easing: 'Easing',
            easings: {
                linear: 'Linear',
                easeOut: 'Ease Out',
                easeIn: 'Ease In',
                easeInOut: 'Ease In Out',
                bounce: 'Bounce',
            },
            features: {
                digit: { title: 'Smart Diff', badge: 'Algorithm', desc: 'Calculates minimal edit path for smooth digit transitions' },
                interrupt: {
                    title: 'Interruptible',
                    badge: 'STABLE',
                    desc: 'Update target value mid-animation with smooth interpolation',
                    action: 'Rapid Click Test'
                },
                mixed: {
                    title: 'Mixed Chars',
                    badge: 'Versatile',
                    desc: 'Numbers, letters, currency symbols',
                    action: 'Randomize'
                }
            },
            scenes: {
                title: 'Real-world Scenarios',
                airport: 'Airport Algo',
                elevator: 'Elevator',
                volume: 'Volume',
                score: 'Scoreboard',
                privacy: 'Privacy'
            },
            highlights: [
                'Levenshtein Distance for optimal edit paths',
                'Supports smooth interruption and retargeting',
                'Auto column addition/removal for digit changes',
                'Circular scrolling with shortest path logic'
            ],
            inspiration: 'Inspired by: Robinhood/Ticker',
            flight: 'Flight',
            gate: 'Gate',
            vueDemo: 'Vue Demo',
            github: 'GitHub'
        }
    }[lang];

    const easingOptions = [
        { name: 'linear', label: t.easings.linear },
        { name: 'easeInOut', label: t.easings.easeInOut },
        { name: 'bounce', label: t.easings.bounce },
    ];

    const durationOptions = [400, 800, 1200];
    const widthOptions = [0.8, 1, 1.2];

    // Handlers
    const randomDigit = () => setDigitDemo(randomWithDigitChange(digitDemo));
    const randomInterrupt = () => setInterruptTarget(randomWithDigitChange(interruptTarget));

    const randomMixed = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-#$';
        let res = '';
        for (let i = 0; i < 7; i++) res += chars[Math.floor(Math.random() * chars.length)];
        setMixedDemo(res);
    };

    // 录制模式检测
    const isRecording = new URLSearchParams(window.location.search).get('rec') === '1';

    return (
        <div className={`app-container ${isRecording ? 'recording-mode' : ''}`}>
            <header className="header-bar">
                <div className="header-left">
                    <div className="logo-icon-wrapper">
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="app-logo">
                            <rect x="6" y="8" width="5" height="16" rx="2.5" fill="currentColor" fillOpacity="0.3" />
                            <rect x="13.5" y="4" width="5" height="16" rx="2.5" fill="currentColor" className="logo-accent">
                                <animate attributeName="y" values="4; 12; 4" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                            </rect>
                            <rect x="21" y="10" width="5" height="16" rx="2.5" fill="currentColor" fillOpacity="0.6" />
                        </svg>
                    </div>
                    <div className="brand-info">
                        <h1 className="brand-name">SmartTicker</h1>
                    </div>
                </div>

                <div className="header-right nav-group">
                    <a href="/vue-demo.html" className="nav-link" target="_blank">
                        {t.vueDemo}
                    </a>

                    <button
                        className="icon-btn"
                        onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                        title={lang === 'zh' ? 'Switch to English' : '切换中文'}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                    </button>

                    <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
                        {theme === 'dark' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </button>

                    <a href="https://x.com/hibearss" className="icon-btn" target="_blank" title="Follow on X">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                    </a>

                    <a href="https://github.com/yourusername/smart-ticker" className="icon-btn" target="_blank" title="View on GitHub">
                        <svg height="20" viewBox="0 0 16 16" version="1.1" width="20" aria-hidden="true" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                    </a>
                </div>
            </header>

            <div className="hero-spacer"></div>

            {/* 实时价格展示 - 核心 Hero */}
            <div className="price-hero">
                <a href="#" className="hero-subtitle subtitle-link">
                    <span>{t.subtitle}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </a>
                <div className="price-value">
                    <span className="price-currency">$</span>
                    <Ticker
                        value={heroPrice.toFixed(2)}
                        characterLists={PRICE_CHARS}
                        duration={animDuration}
                        easing={easing}
                        charWidth={charWidth}
                    />
                </div>
                <div className="price-controls">
                    <div className="control-group">
                        <span className="control-label">{t.width}</span>
                        <div className="control-buttons">
                            {widthOptions.map(w => (
                                <button
                                    key={w}
                                    onClick={() => setCharWidth(w)}
                                    className={charWidth === w ? 'active' : ''}
                                >
                                    {w}×
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="control-group">
                        <span className="control-label">{t.duration}</span>
                        <div className="control-buttons">
                            {durationOptions.map(d => (
                                <button
                                    key={d}
                                    onClick={() => setAnimDuration(d)}
                                    className={animDuration === d ? 'active' : ''}
                                >
                                    {d}ms
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="control-group">
                        <span className="control-label">{t.easing}</span>
                        <div className="control-buttons">
                            {easingOptions.map(e => (
                                <button
                                    key={e.name}
                                    onClick={() => setEasing(e.name)}
                                    className={easing === e.name ? 'active' : ''}
                                >
                                    {e.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <main className="main-content">
                <div className="feature-grid">
                    {/* 智能位数变化 */}
                    <div className="feature-card primary">
                        <div className="feature-header">
                            <span className="feature-icon">✨</span>
                            <span className="feature-title">{t.features.digit.title}</span>
                            <span className="feature-badge">{t.features.digit.badge}</span>
                        </div>
                        <div className="feature-ticker">
                            <Ticker value={digitDemo.toString()} duration={500} easing={easing} />
                        </div>
                        <div className="preset-buttons">
                            <button onClick={() => setDigitDemo(1)}>1</button>
                            <button onClick={() => setDigitDemo(99)}>99</button>
                            <button onClick={() => setDigitDemo(100)}>100</button>
                            <button onClick={() => setDigitDemo(9999)}>9999</button>
                        </div>
                        <div className="feature-desc">
                            {t.features.digit.desc}
                        </div>
                    </div>

                    {/* 中断测试 */}
                    <div className="feature-card">
                        <div className="feature-header">
                            <span className="feature-icon">⚡</span>
                            <span className="feature-title">{t.features.interrupt.title}</span>
                            <span className="feature-badge">{t.features.interrupt.badge}</span>
                        </div>
                        <div className="feature-ticker">
                            <Ticker value={interruptTarget.toString()} duration={500} />
                        </div>
                        <button className="action-btn" onClick={randomInterrupt}>
                            {t.features.interrupt.action}
                        </button>
                        <div className="feature-desc">
                            {t.features.interrupt.desc}
                        </div>
                    </div>

                    {/* 混合字符 */}
                    <div className="feature-card">
                        <div className="feature-header">
                            <span className="feature-icon">🎲</span>
                            <span className="feature-title">{t.features.mixed.title}</span>
                            <span className="feature-badge">{t.features.mixed.badge}</span>
                        </div>
                        <div className="feature-ticker">
                            <Ticker value={mixedDemo} characterLists={[ALPHANUMERIC]} duration={500} />
                        </div>
                        <button className="action-btn" onClick={randomMixed}>
                            {t.features.mixed.action}
                        </button>
                        <div className="feature-desc">
                            {t.features.mixed.desc}
                        </div>
                    </div>
                </div>

                {/* 现实场景模拟 */}
                {/* 现实场景模拟 */}
                <div className="live-data-section">
                    <div className="section-title">
                        <span className="live-dot"></span>
                        {t.scenes.title}
                    </div>
                    <div className="scene-grid">
                        {/* 1. BTC (New First Card) */}
                        <div className="scene-card btc">
                            <div className="scene-icon">
                                <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 15.840000000000002C3.6698666666666666 15.840000000000002 0.16 12.330133333333334 0.16 8S3.6698666666666666 0.16 8 0.16 15.840000000000002 3.6698666666666666 15.840000000000002 8 12.330133333333334 15.840000000000002 8 15.840000000000002Zm3.522618181818182 -8.810181818181817c0.15384242424242425 -1.0270545454545454 -0.6287030303030303 -1.5792969696969696 -1.6978424242424242 -1.947781818181818l0.34690909090909094 -1.3915636363636363 -0.8467393939393939 -0.21071515151515152 -0.3380848484848485 1.354860606060606c-0.22244848484848484 -0.055854545454545455 -0.4508121212121212 -0.10783030303030303 -0.6786424242424243 -0.15975757575757576l0.34050909090909093 -1.3636848484848487 -0.846690909090909 -0.21115151515151515 -0.34690909090909094 1.3910787878787878c-0.18424242424242426 -0.042133333333333335 -0.36552727272727276 -0.0832969696969697 -0.5409454545454545 -0.12736969696969697l0.0009696969696969698 -0.004412121212121213 -1.1681939393939396 -0.29158787878787884 -0.22535757575757576 0.9045333333333333s0.6286545454545455 0.14409696969696972 0.6154181818181819 0.15292121212121212c0.3429818181818182 0.08572121212121213 0.40475151515151514 0.31258181818181824 0.39447272727272725 0.49289696969696967l-0.3949575757575758 1.5851636363636366c0.023515151515151517 0.005866666666666667 0.05391515151515151 0.014690909090909091 0.0881939393939394 0.027927272727272728l-0.08964848484848485 -0.022060606060606062 -0.5536969696969697 2.22070303030303c-0.04218181818181818 0.10385454545454546 -0.14850909090909092 0.26016969696969694 -0.3886060606060606 0.2009212121212121 0.008824242424242425 0.012218181818181819 -0.6154181818181819 -0.15340606060606063 -0.6154181818181819 -0.15340606060606063l-0.42041212121212124 0.9692121212121213 1.1024969696969695 0.2749090909090909c0.2048 0.05144242424242424 0.40572121212121215 0.10535757575757576 0.6032 0.15583030303030304l-0.3503515151515152 1.4072727272727272 0.8462060606060606 0.21071515151515152 0.34690909090909094 -1.3916121212121213c0.23127272727272727 0.06225454545454545 0.4557090909090909 0.12004848484848485 0.6752484848484849 0.17493333333333333l-0.34593939393939394 1.3856969696969699 0.846690909090909 0.21071515151515152 0.3503515151515152 -1.4043151515151515c1.444509090909091 0.2734060606060606 2.5303757575757575 0.16315151515151516 2.9875393939393944 -1.1431757575757577 0.3684848484848485 -1.051539393939394 -0.018133333333333335 -1.6586666666666667 -0.7781333333333333 -2.054109090909091 0.5536969696969697 -0.12736969696969697 0.9702303030303031 -0.4914424242424243 1.0814545454545454 -1.243587878787879Zm-1.9355151515151516 2.7136c-0.26118787878787875 1.0520242424242425 -2.0325333333333333 0.48315151515151517 -2.606787878787879 0.3405575757575758l0.4655030303030303 -1.8644363636363637c0.5742545454545455 0.14356363636363637 2.4151757575757578 0.4272484848484849 2.141284848484849 1.5238787878787878Zm0.26215757575757576 -2.7288242424242424c-0.23864242424242427 0.9569939393939394 -1.7125333333333332 0.4704 -2.1903030303030304 0.351369696969697l0.4213818181818182 -1.690521212121212c0.477769696969697 0.1190787878787879 2.0178424242424247 0.34104242424242426 1.7689212121212121 1.3391515151515152Z" />
                                </svg>

                            </div>
                            <div className="scene-title">BTC</div>
                            <div className="scene-content volume-display" style={{ color: btcTrend === 'up' ? '#10b981' : '#ef4444' }}>
                                <span className="currency-symbol">$</span>
                                <Ticker
                                    value={btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    characterLists={PRICE_CHARS}
                                    duration={500}
                                />
                            </div>
                        </div>

                        {/* 2. 成交量 */}
                        <div className="scene-card volume">
                            <div className="scene-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
                                </svg>
                            </div>
                            <div className="scene-title">{t.scenes.volume}</div>
                            <div className="scene-content volume-display">
                                <Ticker
                                    value={volume.toLocaleString()}
                                    characterLists={VOLUME_CHARS}
                                    duration={500}
                                />
                            </div>
                        </div>

                        {/* 3. 隐私模式 */}
                        <div className="scene-card privacy">
                            <div className="scene-icon" style={{ cursor: 'pointer' }} onClick={() => setIsBalanceHidden(!isBalanceHidden)}>
                                {isBalanceHidden ? (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" /></svg>
                                ) : (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" /></svg>
                                )}
                            </div>
                            <div className="scene-title">{t.scenes.privacy}</div>
                            <div className="scene-content privacy-display">
                                <Ticker
                                    value={isBalanceHidden ? '****.**' : '8,520.50'}
                                    characterLists={PRIVACY_CHARS}
                                    duration={600}
                                />
                            </div>
                        </div>

                        {/* 4. 比分 */}
                        <div className="scene-card score">
                            <div className="scene-icon">
                                <svg fill="currentColor" width="32" height="32" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                                    <path id="Football" d="M66.091,75h-.434a24.926,24.926,0,0,1-8.332-1.544q-.532-.2-1.056-.418c-.229-.1-.456-.2-.682-.3l-.022-.01-.083-.039a25,25,0,0,1-6.2-4.1l-.069-.062-.011-.01q-.446-.405-.876-.835-.448-.448-.872-.916a25.022,25.022,0,0,1-4.1-6.173q-.2-.424-.382-.857-.139-.328-.268-.659a.307.307,0,0,0-.012-.031c-.012-.03-.023-.06-.034-.09a24.851,24.851,0,0,1-1.613-7.569c0-.008,0-.016,0-.024l0-.063c0-.038,0-.076-.006-.114v-.014c-.007-.143-.012-.286-.016-.43Q41,50.369,41,50a24.937,24.937,0,0,1,1.646-8.941.25.25,0,0,0,.009-.023c.008-.02.016-.04.023-.061s.022-.056.033-.084l.014-.035c.077-.2.157-.391.239-.587.037-.087.075-.175.113-.261l.024-.057.023-.052a25.041,25.041,0,0,1,4.434-6.78l.053-.058.018-.019q.337-.366.692-.72.423-.423.861-.822l.058-.053.007-.007a25.043,25.043,0,0,1,6.235-4.128l.069-.032.037-.016q.336-.154.678-.3.4-.167.8-.32A24.907,24.907,0,0,1,65.723,25h.552a24.915,24.915,0,0,1,9.288,1.893l.056.022.021.009.092.039.272.117.013.005.1.046.071.031.042.019a25.031,25.031,0,0,1,6.627,4.358l.01.009.057.051c.254.235.5.475.751.721s.459.468.68.707a25.024,25.024,0,0,1,4.514,6.862l.028.063c.007.016.015.034.022.05.018.04.035.079.052.119,0,0,0,0,0,0,.021.047.041.094.06.14l.045.107.01.023.036.086.025.061a.069.069,0,0,0,0,.01,25.09,25.09,0,0,1,.085,18.676c-.01.027-.021.054-.032.081,0,.01-.009.021-.013.031-.052.13-.106.258-.16.387q-.186.441-.389.873c0,.007-.007.016-.011.022-.014.028-.026.056-.04.083a25.059,25.059,0,0,1-4.089,6.1q-.4.443-.83.869c-.251.251-.506.5-.765.734l-.007.005-.075.069a25.023,25.023,0,0,1-6.594,4.328l-.051.023-.06.027-.114.05h0c-.092.04-.184.08-.276.119l-.1.041A24.911,24.911,0,0,1,66.337,75h-.247Zm-6.853-4.063a22.04,22.04,0,0,0,13.518,0l2.128-6.782L70.485,58H61.515l-4.4,6.156ZM75.169,70A22.1,22.1,0,0,0,82,65.087l-5.263-.078ZM50,65.08A22.093,22.093,0,0,0,56.828,70L55.267,65Zm33.651-1.957A21.886,21.886,0,0,0,88,50c0-.116,0-.232,0-.347l-6.344-4.361-6.836,3.418L72.11,56.833l4.417,6.184ZM44,49.655q0,.173,0,.346a21.881,21.881,0,0,0,4.345,13.112l7.136-.107,4.409-6.173-2.708-8.124L50.356,45.3Zm15.174-1.287L61.721,56h8.558l2.544-7.632L66,43.25ZM44.189,47.113l4.6-3.159-1.775-5.065A21.858,21.858,0,0,0,44.189,47.113Zm39.022-3.165,4.6,3.162a21.842,21.842,0,0,0-2.83-8.222ZM57.894,46.829,65,41.5v-8l-5.869-4.4a22.085,22.085,0,0,0-10.711,7.69l2.254,6.432Zm16.212,0,7.226-3.613,2.249-6.428A22.1,22.1,0,0,0,72.869,29.1L67,33.5v8ZM61.592,28.444,66,31.75l4.409-3.307a22.124,22.124,0,0,0-8.817,0Z" transform="translate(-41 -25)" />
                                </svg>
                            </div>
                            <div className="scene-title">{t.scenes.score}</div>
                            <div className="scene-content scoreboard">
                                <Ticker value={scoreA.toString()} characterLists={[NUMBERS]} duration={500} />
                                <span className="score-separator">:</span>
                                <Ticker value={scoreB.toString()} characterLists={[NUMBERS]} duration={500} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 技术亮点 */}
                <div className="tech-highlights">
                    <div className="highlight">
                        <span className="highlight-icon">📐</span>
                        <span className="highlight-text">{t.highlights[0]}</span>
                    </div>
                    <div className="highlight">
                        <span className="highlight-icon">🔄</span>
                        <span className="highlight-text">{t.highlights[1]}</span>
                    </div>
                    <div className="highlight">
                        <span className="highlight-icon">📏</span>
                        <span className="highlight-text">{t.highlights[2]}</span>
                    </div>
                    <div className="highlight">
                        <span className="highlight-icon">🎯</span>
                        <span className="highlight-text">{t.highlights[3]}</span>
                    </div>
                </div>
            </main >

            <footer className="footer compact">

                <div className="copyright">
                    © 2025 SmartTicker. MIT License.
                </div>
            </footer>
        </div >
    );
}

export default App;
