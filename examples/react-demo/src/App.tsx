import { useState, useEffect } from 'react'
import { Ticker } from '@tombcato/smart-ticker'
import '@tombcato/smart-ticker/style.css'

type EasingType = 'linear' | 'easeInOut' | 'bounce'

function App() {
    const [value, setValue] = useState(173.50)
    const [charWidth, setCharWidth] = useState(1)
    const [duration, setDuration] = useState(800)
    const [easing, setEasing] = useState<EasingType>('easeInOut')

    useEffect(() => {
        const prices = [73.18, 76.58, 173.50, 9.10]
        let idx = 0
        const timer = setInterval(() => {
            idx = (idx + 1) % prices.length
            setValue(prices[idx])
        }, 2000)
        return () => clearInterval(timer)
    }, [])

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
                <span className="currency-symbol">$</span>
                <div className="ticker-main">
                    <Ticker
                        value={value.toFixed(2)}
                        duration={duration}
                        easing={easing}
                        charWidth={charWidth}
                        characterLists={['0123456789.,']}
                    />
                </div>
            </div>

            <div className="controls">
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
                <pre><code>{`import { Ticker } from '@tombcato/smart-ticker'
import '@tombcato/smart-ticker/style.css'

<Ticker
  value="${value.toFixed(2)}"
  duration={${duration}}
  easing="${easing}"
  charWidth={${charWidth}}
  characterLists={['0123456789.,']}
/>`}</code></pre>
            </footer>
        </div>
    )
}

export default App
