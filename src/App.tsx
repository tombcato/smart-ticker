import { useState, useEffect, useRef } from 'react';
import Ticker, { Presets } from './components/Ticker';
import './App.css';
import './recording.css';
import sdk from '@stackblitz/sdk';



// 辅助函数：生成位数可能变化的随机数
const randomWithDigitChange = () => {
    const r = Math.random();
    if (r > 0.8) return Math.floor(Math.random() * 10000); // 4位
    if (r > 0.5) return Math.floor(Math.random() * 1000);  // 3位
    return Math.floor(Math.random() * 100);                // 2位
};

function App() {
    // 状态定义
    const [heroMode, setHeroMode] = useState<'price' | 'text' | 'intl-currency'>('text');
    const [heroPrice, setHeroPrice] = useState(1345.56);
    const [heroText, setHeroText] = useState('Smart Ticker');

    // Intl State
    const [activeFormatter, setActiveFormatter] = useState<Intl.NumberFormat>(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }));
    const [activeIntlConfig, setActiveIntlConfig] = useState<{ locale: string, options: Intl.NumberFormatOptions } | null>({ locale: 'en-US', options: { style: 'currency', currency: 'USD' } });

    // Decoration & Control State
    const [direction, setDirection] = useState<'ANY' | 'UP' | 'DOWN'>('ANY');
    const [prefix, setPrefix] = useState('');
    const [suffix, setSuffix] = useState('');
    const [autoScale, setAutoScale] = useState(false);
    const [fadingEdge, setFadingEdge] = useState(true);

    const [disableAnimation, setDisableAnimation] = useState(false);
    const [alignment, setAlignment] = useState<'center' | 'left' | 'right'>('center');

    // Code Preview State
    const [codeExpanded, setCodeExpanded] = useState(true);
    const [codeFramework, setCodeFramework] = useState<'react' | 'vue'>('react');
    const [copied, setCopied] = useState(false);

    const [animDuration, setAnimDuration] = useState(800);
    const [easing, setEasing] = useState<any>('easeOutCubic');
    const [charWidth, setCharWidth] = useState(1);

    const sequenceIdx = useRef(0);
    const priceSequence = [973.18, 976.58, 1073.50, 97.08];
    // 精心设计的 Diff 演示序列
    const textSequence = [
        'Smart Ticker🎉', // Base
        '👻Smart Diff🎉',   // 1. Prefix Match: 'Smart' stays
        '哈基米🐱Smooth',     // 4. Letters + Numbers
        '哈キハ하키미Smile',   // 6. Complete Change
        'ハキミ하키Smart',    // 7. Symbols + Digits
    ];

    const [digitDemo, setDigitDemo] = useState(999);
    const [interruptTarget, setInterruptTarget] = useState(50);
    const [mixedDemo, setMixedDemo] = useState('A1-Ticker🎉');

    const [installIndex, setInstallIndex] = useState(0);
    const [musicIndex, setMusicIndex] = useState(0);

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
        let interval: number;

        if (heroMode === 'intl-currency') {
            // Intl Mode Loop
            const intlConfig: { val: number, locale: string, options: Intl.NumberFormatOptions }[] = [
                { val: 1345.56, locale: 'en-US', options: { style: 'currency', currency: 'USD' } },
                { val: 0.455, locale: 'zh-CN', options: { style: 'percent', minimumFractionDigits: 1 } },
                { val: 92458, locale: 'en-US', options: { style: 'unit', unit: 'meter-per-second' } },
                { val: 4544654321, locale: 'zh-CN', options: { notation: 'compact', compactDisplay: 'long' } },
                { val: 23456.78, locale: 'de-DE', options: { style: 'currency', currency: 'EUR' } },
            ];

            const updateIntl = () => {
                sequenceIdx.current = (sequenceIdx.current + 1) % intlConfig.length;
                const conf = intlConfig[sequenceIdx.current];
                setHeroPrice(conf.val);
                setActiveFormatter(new Intl.NumberFormat(conf.locale, conf.options));
                setActiveIntlConfig({ locale: conf.locale, options: conf.options });
            };

            interval = window.setInterval(updateIntl, 2000);

        } else {
            // Normal Price/Text Loop
            const updateNormal = () => {
                sequenceIdx.current = (sequenceIdx.current + 1);
                setHeroPrice(priceSequence[sequenceIdx.current % priceSequence.length]);
                setHeroText(textSequence[sequenceIdx.current % textSequence.length]);
            };

            // Start immediately
            updateNormal();

            interval = window.setInterval(updateNormal, animDuration + 1000);
        }

        return () => clearInterval(interval);
    }, [heroMode, animDuration]);

    // 独立循环：场景模拟数据更新 (不应该被 Hero 模式中断)
    useEffect(() => {
        const updateScene = () => {
            // 更新 BTC 价格
            const btcChange = (Math.random() - 0.5) * 500;
            setBtcPrice(prev => prev + btcChange);
            setBtcTrend(btcChange >= 0 ? 'up' : 'down');

            // 统一更新场景模拟数据
            setInstallIndex(prev => (prev + 1) % 6);
            setMusicIndex(prev => (prev + 1) % 6);

            // 自动切换隐私模式
            setIsBalanceHidden(prev => !prev);
        };

        // Start immediately
        updateScene();

        const interval = window.setInterval(updateScene, 2000); // 场景更新频率固定为 2s (或跟随动画时长)

        return () => clearInterval(interval);
    }, []);

    // 语言包
    const t = {
        zh: {
            title: 'Smart Ticker',
            subtitle: '高性能智能文本差异滚动组件，支持React/Vue',
            changelog: '更新日志',
            price: '数字',
            text: '文本',
            duration: '动画时长',
            width: '字符宽度',

            direction: '滚动方向',
            directionLabels: { any: '任意', up: '向上', down: '向下' },
            layout: '布局对齐',
            alignments: { left: '居左', center: '居中', right: '居右' },
            easing: '缓动曲线',
            easings: {
                linear: '线性',
                easeOut: '减速',
                easeIn: '加速',
                easeInOut: '加减',
                bounce: '回弹',
            },
            features: {
                digit: { title: '智能位变', badge: 'Diff 算法', desc: '自动计算最短变更路径，平滑处理位数增减', action: '随机数字' },
                interrupt: {
                    title: '中断衔接',
                    badge: '稳定',
                    desc: '动画进行中可随时更新目标值，过渡自然流畅',
                    action: '快速连续点击测试'
                },
                mixed: {
                    title: '混合字符',
                    badge: '多样式',
                    desc: '支持任意字符混合滚动',
                    action: '随机生成'
                }
            },
            scenes: {
                title: '现实场景模拟',
                airport: '机场信息',
                elevator: '电梯楼层',
                install: '系统更新',
                music: '正在播放',
                privacy: '隐私模式'
            },
            highlights: [
                'Levenshtein 距离算法计算最优编辑路径',
                'Intl 国际化支持：货币、百分比、单位格式化',
                '高度可定制：对齐方式、字符宽度、缓动曲线',
                '高性能流畅动画，支持自动缩放与边缘模糊'
            ],
            inspiration: '灵感来源: Robinhood/Ticker',
            flight: '航班',
            gate: '登机口',
            github: 'GitHub',
            intlMode: 'Intl 国际化',
            decorationTitle: '装饰与控制',
            controls: {
                autoScale: '自动缩放',
                fadingEdge: '边缘模糊',
                disableAnimation: '禁用动画'
            },
            prefixLabel: '前缀',
            suffixLabel: '后缀',
            easingLabels: {
                soft: '柔和',
                fast: '极速',
                dynamic: '灵动'
            },
            codePreview: {
                viewCode: '查看代码',
                copied: '已复制!',
                copy: '复制'
            },
            demoSequences: {
                install: [
                    '等待中...',
                    '下载中... 12%',
                    '下载中... 42%',
                    '下载中... 89%',
                    '验证中...',
                    '安装完成'
                ],
                music: [
                    '🎵 七里香 - 周杰伦',
                    '🎵 哈基香 - 爱杰伦',
                    '🎵 夜曲 - Jay Chou',
                    '💿 Mojo - Chou',
                    '🎸 富士山下 - Eason',
                    '🎸 浮夸 - Eason'
                ]
            }
        },
        en: {
            title: 'Smart Ticker',
            subtitle: 'High-performance smart text diff scroller for React/Vue',
            changelog: 'Changelog',
            price: 'Number',
            text: 'Text',
            duration: 'Duration',
            width: 'Char Width',

            direction: 'Direction',
            directionLabels: { any: 'Any', up: 'Up', down: 'Down' },
            layout: 'Alignment',
            alignments: { left: 'Left', center: 'Center', right: 'Right' },
            easing: 'Easing',
            easings: {
                linear: 'Linear',
                easeOut: 'Ease Out',
                easeIn: 'Ease In',
                easeInOut: 'Ease In Out',
                bounce: 'Bounce',
            },
            features: {
                digit: { title: 'Smart Diff', badge: 'Algorithm', desc: 'Calculates minimal edit path for smooth digit transitions', action: 'Random' },
                interrupt: {
                    title: 'Interruptible',
                    badge: 'STABLE',
                    desc: 'Update target value mid-animation with smooth interpolation',
                    action: 'Rapid Click Test'
                },
                mixed: {
                    title: 'Mixed Chars',
                    badge: 'Versatile',
                    desc: 'Any character mixed scrolling',
                    action: 'Randomize'
                }
            },
            scenes: {
                title: 'Real-world Scenarios',
                airport: 'Airport Algo',
                elevator: 'Elevator',
                install: 'System Update',
                music: 'Now Playing',
                privacy: 'Privacy'
            },
            highlights: [
                'Levenshtein Distance for optimal edit paths',
                'Intl Support: Currency, Percent, Units formatting',
                'Highly Customizable: Layout, Width, Easings',
                'High Performance with Auto-scale & Fading Edge'
            ],
            inspiration: 'Inspired by: Robinhood/Ticker',
            flight: 'Flight',
            gate: 'Gate',
            github: 'GitHub',
            intlMode: 'Intl Support',
            decorationTitle: 'Decoration & Control',
            controls: {
                autoScale: 'Auto Scale',
                fadingEdge: 'Fading Edge',
                disableAnimation: 'Disable Anim'
            },
            prefixLabel: 'Prefix',
            suffixLabel: 'Suffix',
            easingLabels: {
                soft: 'Soft',
                fast: 'Fast',
                dynamic: 'Dynamic'
            },
            codePreview: {
                viewCode: 'View Code',
                copied: 'Copied!',
                copy: 'Copy'
            },
            demoSequences: {
                install: [
                    'Waiting...',
                    'Downloading... 12%',
                    'Downloading... 42%',
                    'Downloading... 89%',
                    'Verifying...',
                    'Completed'
                ],
                music: [
                    '🎵 Shichirika - Jay',
                    '🎵 Hachi-Ka - Jay',
                    '🎵 Nocturne - Jay',
                    '💿 Mojo - Chou',
                    '🎸 Mt. Fuji - Eason',
                    '🎸 Exaggerated - Eason'
                ]
            }
        }
    }[lang];

    const easingOptions = [
        { name: 'linear', label: t.easings.linear },
        { name: 'easeInOut', label: t.easings.easeInOut },
        { name: 'bounce', label: t.easings.bounce },
        { name: 'easeOutCubic', label: t.easingLabels.soft },
        { name: 'easeOutExpo', label: t.easingLabels.fast },
        { name: 'backOut', label: t.easingLabels.dynamic },
    ];

    const durationOptions = [400, 800, 1200];
    const widthOptions = [0.8, 1, 1.2];

    // Handlers
    const randomDigit = () => setDigitDemo(randomWithDigitChange());
    const randomInterrupt = () => setInterruptTarget(randomWithDigitChange());

    const randomMixed = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-#$';
        const emojis = ['🍕', '🚀', '🌙', '🎉', '🐱', '🌵', '🔥', '💎', '🦄', '🤖', '🦖', '🍎'];
        const chinese = '天地玄黄宇宙洪荒日月盈昃辰宿列张寒来暑往秋收冬藏龙师火帝鸟官人皇';
        let res = '';
        for (let i = 0; i < 7; i++) {
            const r = Math.random();
            if (r > 0.85) {
                res += emojis[Math.floor(Math.random() * emojis.length)];
            } else if (r > 0.70) {
                res += chinese[Math.floor(Math.random() * chinese.length)];
            } else {
                res += chars[Math.floor(Math.random() * chars.length)];
            }
        }
        setMixedDemo(res);
    };

    // 录制模式检测
    const isRecording = new URLSearchParams(window.location.search).get('rec') === '1';

    // Hero Value Logic
    // 如果是 intl-currency 模式，直接传 number。配合 numberFormat 属性。
    // 其他模式手动转 string
    const heroValue = heroMode === 'intl-currency'
        ? heroPrice
        : (heroMode === 'price' ? heroPrice.toFixed(2) : heroText);

    // Expanded character support for Text Mode
    const heroChars = heroMode === 'text'
        ? [Presets.ALPHANUMERIC]
        : (heroMode === 'intl-currency' ? [Presets.CURRENCY] : [Presets.NUMBER]);

    // Formatting prop
    const numberFormatProp = heroMode === 'intl-currency' ? { numberFormat: activeFormatter } : {};

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
                        <h1 className="brand-name">Smart Ticker</h1>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px', lineHeight: '1.2', fontWeight: 500 }}>{t.subtitle}</span>
                    </div>
                </div>

                <div className="header-right nav-group">
                    <a
                        href={lang === 'zh' ? "https://github.com/tombcato/smart-ticker/blob/main/CHANGELOG.md" : "https://github.com/tombcato/smart-ticker/blob/main/CHANGELOG_EN.md"}
                        className="nav-link-text nav-changelog"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '-2px' }}>
                            <path d="M12 8V12L15 15" />
                            <circle cx="12" cy="12" r="9" />
                        </svg>
                        <span className="changelog-label">{t.changelog}</span>
                        <span className="version-badge">1.2.0</span>
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

                    <a href="https://github.com/tombcato/smart-ticker" className="icon-btn" target="_blank" title="View on GitHub">
                        <svg height="20" viewBox="0 0 16 16" version="1.1" width="20" aria-hidden="true" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                    </a>
                </div>
            </header>

            <div className="hero-spacer"></div>

            {/* 实时价格展示 - 核心 Hero */}
            <div className="price-hero">


                {/* 模式切换 (新增) */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div className="demo-switch-btn" style={{ background: 'var(--bg-card)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <button
                            style={{
                                border: 'none',
                                background: heroMode === 'text' ? 'var(--accent)' : 'transparent',
                                color: heroMode === 'text' ? 'white' : 'var(--text-muted)',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setHeroMode('text')}
                        >
                            {t.text}
                        </button>
                        <button
                            style={{
                                border: 'none',
                                background: heroMode === 'intl-currency' ? 'var(--accent)' : 'transparent',
                                color: heroMode === 'intl-currency' ? 'white' : 'var(--text-muted)',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setHeroMode('intl-currency')}
                        >
                            {t.intlMode}
                        </button>
                        <button
                            style={{
                                border: 'none',
                                background: heroMode === 'price' ? 'var(--accent)' : 'transparent',
                                color: heroMode === 'price' ? 'white' : 'var(--text-muted)',
                                padding: '4px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.9rem',
                                transition: 'all 0.2s'
                            }}
                            onClick={() => setHeroMode('price')}
                        >
                            {t.price}
                        </button>
                    </div>
                </div>

                <div className="price-value" style={{
                    justifyContent: alignment === 'left' ? 'flex-start' : alignment === 'right' ? 'flex-end' : 'center',
                    width: '100%',
                    overflow: 'hidden'
                }}>

                    <Ticker
                        value={heroValue}
                        characterLists={heroChars}
                        duration={animDuration}
                        easing={easing}
                        charWidth={charWidth}
                        direction={direction}
                        prefix={prefix}
                        suffix={suffix}
                        autoScale={autoScale}
                        fadingEdge={fadingEdge}
                        disableAnimation={disableAnimation}
                        {...numberFormatProp}
                    />
                </div>
                <div className="price-controls">
                    {/* 1. Width */}
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

                    {/* 2. Duration */}
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

                    {/* 3. Direction */}
                    <div className="control-group">
                        <span className="control-label">{t.direction}</span>
                        <div className="control-buttons">
                            {[
                                { val: 'ANY', label: t.directionLabels.any },
                                { val: 'UP', label: t.directionLabels.up },
                                { val: 'DOWN', label: t.directionLabels.down }
                            ].map(d => (
                                <button
                                    key={d.val}
                                    onClick={() => setDirection(d.val as any)}
                                    className={direction === d.val ? 'active' : ''}
                                >
                                    {d.label}
                                </button>
                            ))}
                        </div>
                    </div>



                    {/* 5. Easing */}
                    <div className="control-group">
                        <span className="control-label">{t.easing}</span>
                        <div className="control-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {easingOptions.map(e => (
                                <button
                                    key={e.name}
                                    onClick={() => setEasing(e.name)}
                                    className={easing === e.name ? 'active' : ''}
                                    style={{ minWidth: '56px', textAlign: 'center' }}
                                >
                                    {e.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 6. Decoration & Control */}
                    <div className="control-group">
                        <span className="control-label" style={{ display: 'block', width: '100%', textAlign: 'center' }}>{t.decorationTitle}</span>

                        {/* Toggles Row */}
                        <div className="control-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '4px' }}>
                            <button
                                className={autoScale ? 'active' : ''}
                                onClick={() => setAutoScale(!autoScale)}
                            >
                                {t.controls.autoScale}
                            </button>
                            <button
                                className={fadingEdge ? 'active' : ''}
                                onClick={() => setFadingEdge(!fadingEdge)}
                            >
                                {t.controls.fadingEdge}
                            </button>
                            <button
                                className={disableAnimation ? 'active' : ''}
                                onClick={() => setDisableAnimation(!disableAnimation)}
                            >
                                {t.controls.disableAnimation}
                            </button>
                        </div>

                        {/* Decoration Row - margin-top reduced via CSS gap above */}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', width: '100%' }}>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#888', pointerEvents: 'none' }}>{t.prefixLabel}</span>
                                <input
                                    type="text"
                                    value={prefix}
                                    onChange={(e) => setPrefix(e.target.value)}
                                    style={{
                                        height: '32px',
                                        padding: '0 8px 0 36px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.05)',
                                        width: '118px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        outline: 'none',
                                        color: 'var(--text)'
                                    }}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#888', pointerEvents: 'none' }}>{t.suffixLabel}</span>
                                <input
                                    type="text"
                                    value={suffix}
                                    onChange={(e) => setSuffix(e.target.value)}
                                    style={{
                                        height: '32px',
                                        padding: '0 8px 0 36px',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border)',
                                        background: 'rgba(255,255,255,0.05)',
                                        width: '118px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        outline: 'none',
                                        color: 'var(--text)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* 6. Layout (Now Last) */}
                    <div className="control-group">
                        <span className="control-label">{t.layout}</span>
                        <div className="control-buttons">
                            {[
                                { val: 'left', label: t.alignments.left },
                                { val: 'center', label: t.alignments.center },
                                { val: 'right', label: t.alignments.right }
                            ].map(a => (
                                <button
                                    key={a.val}
                                    onClick={() => setAlignment(a.val as any)}
                                    className={alignment === a.val ? 'active' : ''}
                                >
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Code Preview Section */}
                <div style={{
                    width: '600px',
                    maxWidth: '100%',
                    margin: '24px auto 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <button
                        onClick={() => setCodeExpanded(!codeExpanded)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '20px',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            transition: 'all 0.2s'
                        }}
                    >
                        <span style={{ fontSize: '14px' }}>💻</span>
                        <span>{t.codePreview.viewCode}</span>
                        <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                                transform: codeExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                                marginLeft: '2px'
                            }}
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>

                    {codeExpanded && (
                        <div style={{
                            width: '100%',
                            marginTop: '12px',
                            background: '#1a1b26',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            {/* Window Header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 16px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                {/* Left: Framework Switcher */}
                                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '3px', borderRadius: '8px' }}>
                                    <button
                                        onClick={() => setCodeFramework('react')}
                                        style={{
                                            padding: '4px 12px',
                                            fontSize: '11px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: codeFramework === 'react' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                            color: codeFramework === 'react' ? '#61dafb' : 'rgba(255, 255, 255, 0.4)',
                                            fontWeight: codeFramework === 'react' ? 600 : 400
                                        }}
                                    >
                                        REACT
                                    </button>
                                    <button
                                        onClick={() => setCodeFramework('vue')}
                                        style={{
                                            padding: '4px 12px',
                                            fontSize: '11px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            background: codeFramework === 'vue' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                            color: codeFramework === 'vue' ? '#42b883' : 'rgba(255, 255, 255, 0.4)',
                                            fontWeight: codeFramework === 'vue' ? 600 : 400
                                        }}
                                    >
                                        VUE
                                    </button>
                                </div>

                                {/* Right: Action Buttons */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {/* Copy Button */}
                                    <button
                                        onClick={() => {
                                            const codeEl = document.querySelector('.code-preview-code');
                                            if (codeEl) {
                                                navigator.clipboard.writeText(codeEl.textContent || '');
                                                setCopied(true);
                                                setTimeout(() => setCopied(false), 2000);
                                            }
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            background: copied ? 'rgba(40, 200, 64, 0.15)' : 'transparent',
                                            color: copied ? '#28c840' : 'rgba(255, 255, 255, 0.7)',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {copied ? '✓' : '📋'}
                                        <span>{copied ? t.codePreview.copied : t.codePreview.copy}</span>
                                    </button>

                                    {/* Open in StackBlitz Button */}
                                    <button
                                        onClick={() => {
                                            const preset = heroMode === 'text' ? 'Presets.ALPHANUMERIC' : (heroMode === 'intl-currency' ? 'Presets.CURRENCY' : 'Presets.NUMBER');
                                            const formatterCode = heroMode === 'intl-currency' && activeIntlConfig
                                                ? `\nconst formatter = new Intl.NumberFormat('${activeIntlConfig.locale}', ${JSON.stringify(activeIntlConfig.options)});\n`
                                                : '';
                                            const numberFormatProp = heroMode === 'intl-currency' ? '\n  numberFormat={formatter}' : '';

                                            const appCode = codeFramework === 'react'
                                                ? `import { useState } from 'react'
import { Ticker, Presets } from '@tombcato/smart-ticker'
import '@tombcato/smart-ticker/style.css'
${formatterCode}
export default function App() {
  const [value, setValue] = useState(${heroMode === 'text' ? `"${heroValue}"` : heroValue})

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#0a0a0a', 
      color: '#fff',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 600 }}>Smart Ticker Demo</h1>
      
      <div style={{ 
        padding: '3rem', 
        background: '#1a1a1a', 
        borderRadius: '24px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        border: '1px solid #333',
        marginBottom: '2rem',
        minWidth: '300px',
        display: 'flex',
        justifyContent: 'center',
        fontSize: '3rem',
        fontWeight: 'bold'
      }}>
        <Ticker
          value={value}
          duration={${animDuration}}
          easing="${easing}"
          charWidth={${charWidth}}
          direction="${direction}"
          characterLists={[${preset}]}${prefix ? `\n          prefix="${prefix}"` : ''}${suffix ? `\n          suffix="${suffix}"` : ''}${autoScale ? '\n          autoScale' : ''}${fadingEdge ? '\n          fadingEdge' : ''}${disableAnimation ? '\n          disableAnimation' : ''}${numberFormatProp}
        />
      </div>

      <button 
        onClick={() => setValue(${heroMode === 'text' ? 'Math.random().toString(36).substring(7)' : 'Math.random() * 10000'})}
        style={{
          padding: '12px 28px',
          borderRadius: '99px',
          border: 'none',
          background: '#FFFFFF',
          color: '#000',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'transform 0.2s',
          fontSize: '1rem'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        Randomize Value
      </button>
    </div>
  )
}`
                                                : `<script setup>
import { ref } from 'vue'
import { Ticker, Presets } from '@tombcato/smart-ticker/vue'
import '@tombcato/smart-ticker/style.css'
${formatterCode}

const value = ref(${heroMode === 'text' ? `'${heroValue}'` : heroValue})

const randomize = () => {
  value.value = ${heroMode === 'text' ? "Math.random().toString(36).substring(7)" : "Math.random() * 10000"}
}
</script>

<template>
  <div class="container">
    <h1>Smart Ticker Demo</h1>
    
    <div class="card">
      <Ticker
        :value="value"
        :duration="${animDuration}"
        :easing="'${easing}'"
        :charWidth="${charWidth}"
        :direction="'${direction}'"
        :characterLists="[${preset}]"${prefix ? `\n        :prefix="'${prefix}'"` : ''}${suffix ? `\n        :suffix="'${suffix}'"` : ''}${autoScale ? '\n        autoScale' : ''}${fadingEdge ? '\n        fadingEdge' : ''}${disableAnimation ? '\n        disableAnimation' : ''}${heroMode === 'intl-currency' ? '\n        :numberFormat="formatter"' : ''}
      />
    </div>

    <button @click="randomize">Randomize Value</button>
  </div>
</template>

<style>
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

body {
  margin: 0;
  background-color: #0a0a0a;
  color: #ffffff;
}

.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h1 {
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 600;
}

.card {
  padding: 3rem;
  background: #1a1a1a;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  border: 1px solid #333;
  margin-bottom: 2rem;
  min-width: 300px;
  display: flex;
  justify-content: center;
  font-size: 3rem;
  font-weight: bold;
}

button {
  padding: 12px 28px;
  border-radius: 99px;
  border: none;
  background: #FFFFFF;
  color: #000;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  font-size: 1rem;
}

button:hover {
  transform: scale(1.05);
}
</style>`;

                                            const files = codeFramework === 'react'
                                                ? {
                                                    'App.tsx': appCode,
                                                    'index.tsx': `import { createRoot } from 'react-dom/client'
import App from './App'
createRoot(document.getElementById('root')!).render(<App />)`,
                                                    'index.html': `<!DOCTYPE html>
<html><body><div id="root"></div><script type="module" src="/index.tsx"></script></body></html>`,
                                                    'package.json': JSON.stringify({
                                                        name: 'smart-ticker-demo',
                                                        private: true,
                                                        scripts: {
                                                            "dev": "vite",
                                                            "build": "vite build",
                                                            "preview": "vite preview"
                                                        },
                                                        dependencies: {
                                                            '@tombcato/smart-ticker': 'latest',
                                                            'react': '^18',
                                                            'react-dom': '^18'
                                                        },
                                                        devDependencies: {
                                                            "@types/react": "^18.2.0",
                                                            "@types/react-dom": "^18.2.0",
                                                            "@vitejs/plugin-react": "^4.2.0",
                                                            "typescript": "^5.2.0",
                                                            "vite": "^5.0.0"
                                                        }
                                                    }, null, 2),
                                                    'tsconfig.json': JSON.stringify({
                                                        "compilerOptions": {
                                                            "target": "ES2020",
                                                            "useDefineForClassFields": true,
                                                            "lib": ["ES2020", "DOM", "DOM.Iterable"],
                                                            "module": "ESNext",
                                                            "skipLibCheck": true,
                                                            "moduleResolution": "bundler",
                                                            "allowImportingTsExtensions": true,
                                                            "resolveJsonModule": true,
                                                            "isolatedModules": true,
                                                            "noEmit": true,
                                                            "jsx": "react-jsx",
                                                            "strict": true,
                                                            "noUnusedLocals": true,
                                                            "noUnusedParameters": true,
                                                            "noFallthroughCasesInSwitch": true
                                                        },
                                                        "include": ["src"]
                                                    }, null, 2),
                                                    'vite.config.ts': `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
})`
                                                }
                                                : {
                                                    'src/App.vue': appCode,
                                                    'src/main.ts': `import { createApp } from 'vue'
import App from './App.vue'
createApp(App).mount('#app')`,
                                                    'index.html': `<!DOCTYPE html>
<html><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>`,
                                                    'package.json': JSON.stringify({
                                                        name: 'smart-ticker-vue-demo',
                                                        private: true,
                                                        scripts: {
                                                            "dev": "vite",
                                                            "build": "vite build",
                                                            "preview": "vite preview"
                                                        },
                                                        dependencies: {
                                                            '@tombcato/smart-ticker': 'latest',
                                                            'vue': '^3'
                                                        },
                                                        devDependencies: {
                                                            "@vitejs/plugin-vue": "^5.0.0",
                                                            "typescript": "^5.2.0",
                                                            "vite": "^5.0.0",
                                                            "vue-tsc": "^1.8.0"
                                                        }
                                                    }, null, 2),
                                                    'vite.config.ts': `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({
  plugins: [vue()],
})`
                                                };

                                            // Use StackBlitz SDK
                                            sdk.openProject({
                                                title: `Smart Ticker ${codeFramework === 'react' ? 'React' : 'Vue'} Demo`,
                                                template: 'node',
                                                files: files as unknown as Record<string, string>
                                            }, { openFile: codeFramework === 'react' ? 'App.tsx' : 'src/App.vue' });
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(29, 155, 240, 0.3)',
                                            background: 'rgba(29, 155, 240, 0.1)',
                                            color: '#1d9bf0',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            fontWeight: 500,
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <span>⚡</span>
                                        <span>StackBlitz</span>
                                    </button>
                                </div>
                            </div>

                            {/* Code Content */}
                            <pre style={{
                                margin: 0,
                                padding: '16px',
                                overflow: 'auto',
                                fontSize: '12px',
                                lineHeight: 1.6,
                                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                textAlign: 'left',
                                background: 'transparent',
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <code className="code-preview-code" style={{
                                    color: '#cdd6f4',
                                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace"
                                }}>
                                    {codeFramework === 'react' ? (
                                        <>
                                            <span style={{ color: '#cba6f7' }}>import</span>
                                            <span style={{ color: '#cdd6f4' }}> {'{ '}</span>
                                            <span style={{ color: '#f9e2af' }}>Ticker</span>
                                            <span style={{ color: '#cdd6f4' }}>{' }'} </span>
                                            <span style={{ color: '#cba6f7' }}>from</span>
                                            <span style={{ color: '#a6e3a1' }}> '@tombcato/smart-ticker'</span>
                                            {'\n'}
                                            <span style={{ color: '#cba6f7' }}>import</span>
                                            <span style={{ color: '#a6e3a1' }}> '@tombcato/smart-ticker/style.css'</span>
                                            {heroMode === 'intl-currency' && activeIntlConfig && (
                                                <>
                                                    {'\n\n'}
                                                    <span style={{ color: '#cba6f7' }}>const</span>
                                                    <span style={{ color: '#cdd6f4' }}> formatter = </span>
                                                    <span style={{ color: '#fab387' }}>{`new Intl.NumberFormat(`}</span>
                                                    {'\n'}
                                                    <span style={{ color: '#fab387' }}>{`  '${activeIntlConfig.locale}', ${JSON.stringify(activeIntlConfig.options).replace(/"/g, "'")}`}</span>
                                                    <span style={{ color: '#fab387' }}>)</span>
                                                </>
                                            )}
                                            {'\n\n'}
                                            <span style={{ color: '#89b4fa' }}>{'<'}</span>
                                            <span style={{ color: '#f9e2af' }}>Ticker</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  value</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#cdd6f4' }}>{'{'}</span>
                                            <span style={{ color: '#fab387' }}>{heroMode === 'text' ? `"${heroValue}"` : heroValue}</span>
                                            <span style={{ color: '#cdd6f4' }}>{'}'}</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  duration</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#cdd6f4' }}>{'{'}</span>
                                            <span style={{ color: '#fab387' }}>{animDuration}</span>
                                            <span style={{ color: '#cdd6f4' }}>{'}'}</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  easing</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#a6e3a1' }}>"{easing}"</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  charWidth</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#cdd6f4' }}>{'{'}</span>
                                            <span style={{ color: '#fab387' }}>{charWidth}</span>
                                            <span style={{ color: '#cdd6f4' }}>{'}'}</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  direction</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#a6e3a1' }}>"{direction}"</span>
                                            {<>{'\n'}<span style={{ color: '#89dceb' }}>  characterLists</span><span style={{ color: '#cdd6f4' }}>=</span><span style={{ color: '#cdd6f4' }}>{'{'}</span><span style={{ color: '#fab387' }}>{heroMode === 'text' ? '[Presets.ALPHANUMERIC]' : (heroMode === 'intl-currency' ? '[Presets.CURRENCY]' : '[Presets.NUMBER]')}</span><span style={{ color: '#cdd6f4' }}>{'}'}</span></>}
                                            {prefix && <>{'\n'}<span style={{ color: '#89dceb' }}>  prefix</span><span style={{ color: '#cdd6f4' }}>=</span><span style={{ color: '#a6e3a1' }}>"{prefix}"</span></>}
                                            {suffix && <>{'\n'}<span style={{ color: '#89dceb' }}>  suffix</span><span style={{ color: '#cdd6f4' }}>=</span><span style={{ color: '#a6e3a1' }}>"{suffix}"</span></>}
                                            {autoScale && <>{'\n'}<span style={{ color: '#89dceb' }}>  autoScale</span></>}
                                            {fadingEdge && <>{'\n'}<span style={{ color: '#89dceb' }}>  fadingEdge</span></>}
                                            {disableAnimation && <>{'\n'}<span style={{ color: '#89dceb' }}>  disableAnimation</span></>}
                                            {heroMode === 'intl-currency' && activeIntlConfig && (
                                                <>
                                                    {'\n'}
                                                    <span style={{ color: '#89dceb' }}>  numberFormat</span>
                                                    <span style={{ color: '#cdd6f4' }}>=</span>
                                                    <span style={{ color: '#cdd6f4' }}>{'{'}</span>
                                                    <span style={{ color: '#fab387' }}>formatter</span>
                                                    <span style={{ color: '#cdd6f4' }}>{'}'}</span>
                                                </>
                                            )}
                                            {'\n'}
                                            <span style={{ color: '#89b4fa' }}>/{'>'}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: '#cba6f7' }}>import</span>
                                            <span style={{ color: '#cdd6f4' }}> {'{ '}</span>
                                            <span style={{ color: '#f9e2af' }}>Ticker</span>
                                            <span style={{ color: '#cdd6f4' }}>{' }'} </span>
                                            <span style={{ color: '#cba6f7' }}>from</span>
                                            <span style={{ color: '#a6e3a1' }}> '@tombcato/smart-ticker/vue'</span>
                                            {'\n'}
                                            <span style={{ color: '#cba6f7' }}>import</span>
                                            <span style={{ color: '#a6e3a1' }}> '@tombcato/smart-ticker/style.css'</span>
                                            {heroMode === 'intl-currency' && activeIntlConfig && (
                                                <>
                                                    {'\n\n'}
                                                    <span style={{ color: '#cba6f7' }}>const</span>
                                                    <span style={{ color: '#cdd6f4' }}> formatter = </span>
                                                    <span style={{ color: '#fab387' }}>{`new Intl.NumberFormat(`}</span>
                                                    {'\n'}
                                                    <span style={{ color: '#fab387' }}>{`  '${activeIntlConfig.locale}', ${JSON.stringify(activeIntlConfig.options).replace(/"/g, "'")}`}</span>
                                                    <span style={{ color: '#fab387' }}>)</span>
                                                </>
                                            )}
                                            {'\n\n'}
                                            <span style={{ color: '#89b4fa' }}>{'<'}</span>
                                            <span style={{ color: '#f9e2af' }}>Ticker</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  :value</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#a6e3a1' }}>"{typeof heroValue === 'number' ? heroValue : heroValue}"</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  :duration</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#a6e3a1' }}>"{animDuration}"</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  :easing</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#a6e3a1' }}>"{easing}"</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  :charWidth</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#a6e3a1' }}>"{charWidth}"</span>
                                            {'\n'}
                                            <span style={{ color: '#89dceb' }}>  :direction</span>
                                            <span style={{ color: '#cdd6f4' }}>=</span>
                                            <span style={{ color: '#a6e3a1' }}>"{direction}"</span>
                                            {<>{'\n'}<span style={{ color: '#89dceb' }}>  :characterLists</span><span style={{ color: '#cdd6f4' }}>=</span><span style={{ color: '#a6e3a1' }}>"{heroMode === 'text' ? '[Presets.ALPHANUMERIC]' : (heroMode === 'intl-currency' ? '[Presets.CURRENCY]' : '[Presets.NUMBER]')}"</span></>}
                                            {prefix && <>{'\n'}<span style={{ color: '#89dceb' }}>  :prefix</span><span style={{ color: '#cdd6f4' }}>=</span><span style={{ color: '#a6e3a1' }}>"{prefix}"</span></>}
                                            {suffix && <>{'\n'}<span style={{ color: '#89dceb' }}>  :suffix</span><span style={{ color: '#cdd6f4' }}>=</span><span style={{ color: '#a6e3a1' }}>"{suffix}"</span></>}
                                            {autoScale && <>{'\n'}<span style={{ color: '#89dceb' }}>  :autoScale</span></>}
                                            {fadingEdge && <>{'\n'}<span style={{ color: '#89dceb' }}>  :fadingEdge</span></>}
                                            {disableAnimation && <>{'\n'}<span style={{ color: '#89dceb' }}>  :disableAnimation</span></>}
                                            {heroMode === 'intl-currency' && activeIntlConfig && (
                                                <>
                                                    {'\n'}
                                                    <span style={{ color: '#89dceb' }}>  :numberFormat</span>
                                                    <span style={{ color: '#cdd6f4' }}>=</span>
                                                    <span style={{ color: '#a6e3a1' }}>"formatter"</span>
                                                </>
                                            )}
                                            {'\n'}
                                            <span style={{ color: '#89b4fa' }}>/{'>'}</span>
                                        </>
                                    )}
                                </code>
                            </pre>
                        </div>
                    )}
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
                        <button className="action-btn" onClick={randomDigit}>
                            {t.features.digit.action}
                        </button>
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
                            <Ticker value={mixedDemo} characterLists={[Presets.ALPHANUMERIC]} duration={500} />
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

                                <Ticker
                                    value={btcPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                    characterLists={[Presets.CURRENCY]}
                                    duration={500}
                                />
                            </div>
                        </div>

                        {/* 2. 系统更新 */}
                        <div className="scene-card install">
                            <div className="scene-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
                                </svg>
                            </div>
                            <div className="scene-title">{t.scenes.install}</div>
                            <div className="scene-content install-display" style={{ fontSize: '1.2rem', color: '#6366f1' }}>
                                <Ticker
                                    value={t.demoSequences.install[installIndex]}
                                    charWidth={0.8}
                                    characterLists={[
                                        Presets.ALPHABET,
                                        Presets.NUMBER,
                                        ' .%'
                                    ]}
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
                                    characterLists={[Presets.CURRENCY + '*']}
                                    duration={600}
                                />
                            </div>
                        </div>

                        {/* 4. 音乐播放器 */}
                        <div className="scene-card music">
                            <div className="scene-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                                </svg>
                            </div>
                            <div className="scene-title">{t.scenes.music}</div>
                            <div className="scene-content music-display" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap' }}>
                                <Ticker
                                    value={t.demoSequences.music[musicIndex]}
                                    charWidth={0.8}
                                    characterLists={[
                                        Presets.ALPHABET,
                                        Presets.NUMBER,
                                        ' .%-'
                                    ]}
                                    duration={600}
                                />
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
