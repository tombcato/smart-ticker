import { useState, useEffect } from 'react'
import { Ticker, Presets } from '../../../src/index'
import '@tombcato/smart-ticker/style.css'
import './index.css'


type DemoMode = 'price' | 'text' | 'intl-currency'

function App() {
    const [mode, setMode] = useState<DemoMode>('price')
    const [value, setValue] = useState<string | number>(173.50)
    const [charWidth, setCharWidth] = useState(1)
    const [duration, setDuration] = useState(800)
    const [easing, setEasing] = useState<import('../../../src/core/TickerCore').EasingName>('easeOutCubic')
    const [fadingEdge, setFadingEdge] = useState(true)

    const [activeFormatter, setActiveFormatter] = useState<Intl.NumberFormat | undefined>()

    const [direction, setDirection] = useState<'ANY' | 'UP' | 'DOWN'>('ANY')
    const [prefix, setPrefix] = useState('')
    const [suffix, setSuffix] = useState('')
    const [disableAnimation, setDisableAnimation] = useState(false)
    const [autoScale, setAutoScale] = useState(false)

    useEffect(() => {
        let timer: number

        if (mode === 'price') {
            const prices = [973.18, 976.58, 1073.50, 97.10]
            let idx = 0
            setValue(prices[0])
            timer = window.setInterval(() => {
                idx = (idx + 1) % prices.length
                setValue(prices[idx])
            }, 2000)
        } else if (mode === 'intl-currency') {
            // 测试 Intl 格式化：轮播不同的货币、百分比、单位等
            const intlConfig: { val: number, locale: string, options: Intl.NumberFormatOptions }[] = [
                { val: 1345.56, locale: 'en-US', options: { style: 'currency', currency: 'USD' } },
                { val: 0.455, locale: 'zh-CN', options: { style: 'percent', minimumFractionDigits: 1 } },
                { val: 92458, locale: 'en-US', options: { style: 'unit', unit: 'meter-per-second' } },
                { val: 4544654321, locale: 'zh-CN', options: { notation: 'compact', compactDisplay: 'long' } },
                { val: 23456.78, locale: 'de-DE', options: { style: 'currency', currency: 'EUR' } },
            ]
            let idx = 0
            const update = (i: number) => {
                const conf = intlConfig[i]
                setValue(conf.val)
                setActiveFormatter(new Intl.NumberFormat(conf.locale, conf.options))
            }
            update(0)

            timer = window.setInterval(() => {
                idx = (idx + 1) % intlConfig.length
                update(idx)
            }, 3000)
        } else {
            const words = [
                'Smart Ticker',
                'Small Diff',
                '哈基米 Dif@#$',
                '硅基生命 %@#$',
                '宇宙生命 Smart',
            ]
            let idx = 0
            setValue(words[0])
            timer = window.setInterval(() => {
                idx = (idx + 1) % words.length
                setValue(words[idx])
            }, 2000)
        }

        return () => clearInterval(timer)
    }, [mode])

    // Determine character lists based on mode
    const currentCharacterLists = mode === 'text'
        ? [
            Presets.ALPHABET,
            Presets.ALPHABET.toUpperCase(),
            Presets.NUMBER,
            ' .%v-@#$'
        ]
        // 增加各种货币符号
        : (mode === 'intl-currency' ? [Presets.CURRENCY] : [Presets.NUMBER])

    // Determine display value
    // 如果是 intl-currency 模式，直接传 number 给组件让它格式化
    // 其他模式手动转 string
    const displayValueForProps = mode === 'intl-currency' ? Number(value) : (mode === 'price' ? Number(value).toFixed(2) : String(value))

    const numberFormatProp = mode === 'intl-currency' ? { numberFormat: activeFormatter } : {}

    return (
        <div className="app-container">
            <header>
                <div className="header-title">
                    <img src="/logo.svg" alt="logo" className="logo" />
                    <h1>Smart Ticker - React Demo</h1>
                </div>

            </header>

            <div className="ticker-display" style={{ width: autoScale ? '100%' : undefined }}>

                <Ticker
                    value={displayValueForProps}
                    duration={duration}
                    easing={easing}
                    charWidth={charWidth}
                    characterLists={currentCharacterLists}
                    direction={direction}
                    prefix={prefix}
                    suffix={suffix}
                    disableAnimation={disableAnimation}
                    autoScale={autoScale}

                    fadingEdge={fadingEdge}
                    {...numberFormatProp}
                />
            </div>

            <div className="controls">
                {/* 模式切换 */}
                <div className="control-group">
                    <div className="label">演示模式</div>
                    <div className="options">
                        <button className={mode === 'price' ? 'active' : ''} onClick={() => setMode('price')}>数字</button>
                        <button className={mode === 'intl-currency' ? 'active' : ''} onClick={() => setMode('intl-currency')}>Intl 格式化</button>
                        <button className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>文本</button>
                    </div>
                </div>

                {/* 字符宽度控制 */}
                <div className="control-group">
                    <div className="label">字符宽度</div>
                    <div className="options">
                        {[0.8, 1, 1.2].map((w) => (
                            <button
                                key={w}
                                className={charWidth === w ? 'active' : ''}
                                onClick={() => setCharWidth(w)}
                            >
                                {w}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* 动画时长控制 */}
                <div className="control-group">
                    <div className="label">动画时长</div>
                    <div className="options">
                        {[400, 800, 1200].map((d) => (
                            <button
                                key={d}
                                className={duration === d ? 'active' : ''}
                                onClick={() => setDuration(d)}
                            >
                                {d}ms
                            </button>
                        ))}
                    </div>
                </div>

                {/* 缓动曲线控制 */}
                <div className="control-group">
                    <div className="label">缓动曲线</div>
                    <div className="options" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {[
                            { key: 'linear', label: '线性' },
                            { key: 'easeInOut', label: '先加后减' },
                            { key: 'bounce', label: '回弹' },
                            { key: 'easeOutCubic', label: '柔和' },
                            { key: 'easeOutExpo', label: '极速' },
                            { key: 'backOut', label: '灵动' },
                        ].map((e) => (
                            <button
                                key={e.key}
                                className={easing === e.key ? 'active' : ''}
                                onClick={() => setEasing(e.key as any)}
                            >
                                {e.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 滚动方向控制 */}
                <div className="control-group">
                    <div className="label">滚动方向</div>
                    <div className="options">
                        {(['ANY', 'UP', 'DOWN'] as const).map((d) => (
                            <button
                                key={d}
                                className={direction === d ? 'active' : ''}
                                onClick={() => setDirection(d)}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 前缀后缀与动画开关 */}
                <div className="control-group">
                    <div className="label">装饰与控制</div>
                    <div className="options" style={{ flexDirection: 'column', gap: '8px', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#a0a3bd', pointerEvents: 'none' }}>前</span>
                                <input
                                    type="text"
                                    value={prefix}
                                    onChange={(e) => setPrefix(e.target.value)}
                                    style={{
                                        padding: '6px 8px 6px 24px',
                                        borderRadius: '6px',
                                        border: '1px solid #e0e0e0',
                                        width: '80px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        outline: 'none',
                                        color: '#1a1d2d'
                                    }}
                                />
                            </div>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#a0a3bd', pointerEvents: 'none' }}>后</span>
                                <input
                                    type="text"
                                    value={suffix}
                                    onChange={(e) => setSuffix(e.target.value)}
                                    style={{
                                        padding: '6px 8px 6px 24px',
                                        borderRadius: '6px',
                                        border: '1px solid #e0e0e0',
                                        width: '80px',
                                        textAlign: 'center',
                                        fontSize: '14px',
                                        outline: 'none',
                                        color: '#1a1d2d'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
                            <button
                                className={autoScale ? 'active' : ''}
                                onClick={() => setAutoScale(!autoScale)}
                                style={{ fontSize: '13px', padding: '4px 10px', border: '1px solid #e0e0e0' }}
                            >
                                自动缩放
                            </button>
                            <button
                                className={fadingEdge ? 'active' : ''}
                                onClick={() => setFadingEdge(!fadingEdge)}
                                style={{ fontSize: '13px', padding: '4px 10px', border: '1px solid #e0e0e0' }}
                            >
                                边缘模糊
                            </button>
                            <button
                                className={disableAnimation ? 'active' : ''}
                                onClick={() => setDisableAnimation(!disableAnimation)}
                                style={{ fontSize: '13px', padding: '4px 10px', border: '1px solid #e0e0e0' }}
                            >
                                禁用动画
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default App
