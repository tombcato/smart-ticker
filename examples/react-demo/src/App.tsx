import { useState, useEffect } from 'react'
import { Ticker, TickerUtils } from '@tombcato/smart-ticker'
import '@tombcato/smart-ticker/style.css'

type EasingType = 'linear' | 'easeInOut' | 'bounce'
type DemoMode = 'price' | 'text'

function App() {
    const [mode, setMode] = useState<DemoMode>('price')
    const [value, setValue] = useState<string | number>(173.50)
    const [charWidth, setCharWidth] = useState(1)
    const [duration, setDuration] = useState(800)
    const [easing, setEasing] = useState<EasingType>('easeInOut')

    useEffect(() => {
        let timer: number

        if (mode === 'price') {
            const prices = [73.18, 76.58, 173.50, 9.10]
            let idx = 0
            setValue(prices[0])
            timer = setInterval(() => {
                idx = (idx + 1) % prices.length
                setValue(prices[idx])
            }, 2000)
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
            timer = setInterval(() => {
                idx = (idx + 1) % words.length
                setValue(words[idx])
            }, 2000)
        }

        return () => clearInterval(timer)
    }, [mode])

    // Determine character lists based on mode
    const currentCharacterLists = mode === 'price'
        ? ['0123456789.,']
        : [
            TickerUtils.provideAlphabeticalList(),
            TickerUtils.provideAlphabeticalList().toUpperCase(),
            TickerUtils.provideNumberList(),
            ' .%v-@#$'
        ]

    // Determine display value
    const displayValue = mode === 'price' ? Number(value).toFixed(2) : String(value)

    return (
        <div className="app-container">
            <header>
                <div className="header-title">
                    <img src="/logo.svg" alt="logo" className="logo" />
                    <h1>Smart Ticker - React Demo</h1>
                </div>
                <p className="subtitle">通过 npm install @tombcato/smart-ticker 引入</p>
            </header>

            <div className="ticker-display">
                {mode === 'price' && <span className="currency-symbol">$</span>}
                <div className="ticker-main">
                    <Ticker
                        value={displayValue}
                        duration={duration}
                        easing={easing}
                        charWidth={charWidth}
                        characterLists={currentCharacterLists}
                    />
                </div>
            </div>

            <div className="controls">
                {/* 模式切换 */}
                <div className="control-group">
                    <div className="label">演示模式</div>
                    <div className="options">
                        <button className={mode === 'price' ? 'active' : ''} onClick={() => setMode('price')}>数字</button>
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
                    <div className="options">
                        {[
                            { key: 'linear', label: '线性' },
                            { key: 'easeInOut', label: '先加后减' },
                            { key: 'bounce', label: '回弹' },
                        ].map((e) => (
                            <button
                                key={e.key}
                                className={easing === e.key ? 'active' : ''}
                                onClick={() => setEasing(e.key as EasingType)}
                            >
                                {e.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="code-section">
                <h2>💻 使用代码</h2>
                <pre><code>{`import { Ticker, TickerUtils } from '@tombcato/smart-ticker'
import '@tombcato/smart-ticker/style.css'

<Ticker
  value="${displayValue}"
  duration={${duration}}
  easing="${easing}"
  charWidth={${charWidth}}
  characterLists={${mode === 'price' ? "['0123456789.,']" : "[TickerUtils.provideAlphabeticalList()]"}}
/>`}</code></pre>
            </footer>
        </div>
    )
}

export default App
