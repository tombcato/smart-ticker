<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import Ticker from "../../../src/components/svelte/Ticker.svelte";
    import { Presets, type EasingName } from "../../../src/core/TickerCore";
    import "../../../src/components/Ticker.css";

    type DemoMode = "price" | "text" | "intl-currency";

    let mode: DemoMode = "price";
    let value: string | number = 173.5;
    let charWidth = 1;
    let duration = 800;
    let easing: EasingName = "easeOutCubic";
    let autoScale = false;
    let fadingEdge = true;

    let direction: "ANY" | "UP" | "DOWN" = "ANY";
    let prefix = "";
    let suffix = "";
    let disableAnimation = false;
    let activeFormatter: Intl.NumberFormat | undefined = undefined;

    let timer: ReturnType<typeof setInterval> | undefined;

    const widthOptions = [0.8, 1, 1.2];
    const durationOptions = [400, 800, 1200];
    const easingOptions = [
        { key: "linear", label: "线性" },
        { key: "easeInOut", label: "先加后减" },
        { key: "bounce", label: "回弹" },
        { key: "easeOutCubic", label: "柔和" },
        { key: "easeOutExpo", label: "极速" },
        { key: "backOut", label: "灵动" },
    ];

    $: currentCharacterLists =
        mode === "text"
            ? [
                  Presets.ALPHABET,
                  Presets.ALPHABET.toUpperCase(),
                  Presets.NUMBER,
                  " .%v-@#$",
              ]
            : mode === "intl-currency"
              ? [Presets.CURRENCY]
              : [Presets.NUMBER];

    $: displayValue =
        mode === "intl-currency"
            ? Number(value)
            : mode === "price"
              ? Number(value).toFixed(2)
              : String(value);

    function startTimer() {
        if (timer) clearInterval(timer);

        if (mode === "price") {
            const prices = [973.18, 976.58, 1073.5, 97.1];
            let idx = 0;
            value = prices[0];
            timer = setInterval(() => {
                idx = (idx + 1) % prices.length;
                value = prices[idx];
            }, 2000);
        } else if (mode === "intl-currency") {
            const intlConfig = [
                {
                    val: 1234.56,
                    locale: "en-US",
                    options: {
                        style: "currency",
                        currency: "USD",
                    } as Intl.NumberFormatOptions,
                },
                {
                    val: 0.455,
                    locale: "zh-CN",
                    options: {
                        style: "percent",
                        minimumFractionDigits: 1,
                    } as Intl.NumberFormatOptions,
                },
                {
                    val: 92458,
                    locale: "en-US",
                    options: {
                        style: "unit",
                        unit: "meter-per-second",
                    } as Intl.NumberFormatOptions,
                },
                {
                    val: 4544654321,
                    locale: "zh-CN",
                    options: {
                        notation: "compact",
                        compactDisplay: "long",
                    } as Intl.NumberFormatOptions,
                },
                {
                    val: 23456.78,
                    locale: "de-DE",
                    options: {
                        style: "currency",
                        currency: "EUR",
                    } as Intl.NumberFormatOptions,
                },
            ];
            let idx = 0;
            const update = (i: number) => {
                const conf = intlConfig[i];
                value = conf.val;
                activeFormatter = new Intl.NumberFormat(
                    conf.locale,
                    conf.options,
                );
            };
            update(0);
            timer = setInterval(() => {
                idx = (idx + 1) % intlConfig.length;
                update(idx);
            }, 3000);
        } else {
            const words = [
                "Smart Ticker",
                "Small Diff",
                "哈基米 Dif@#$",
                "硅基生命 %@#$",
                "宇宙生命 Smart",
            ];
            let idx = 0;
            value = words[0];
            timer = setInterval(() => {
                idx = (idx + 1) % words.length;
                value = words[idx];
            }, 2000);
        }
    }

    $: if (mode) {
        startTimer();
    }

    onMount(() => {
        startTimer();
    });

    onDestroy(() => {
        if (timer) clearInterval(timer);
    });

    function setMode(m: DemoMode) {
        mode = m;
    }

    function setCharWidth(w: number) {
        charWidth = w;
    }

    function setDuration(d: number) {
        duration = d;
    }

    function setEasing(e: string) {
        easing = e as EasingName;
    }

    function setDirection(d: "ANY" | "UP" | "DOWN") {
        direction = d;
    }
</script>

<div class="app-container">
    <header>
        <div class="header-title">
            <img src="/logo.svg" alt="logo" class="logo" />
            <h1>Smart Ticker - Svelte Demo</h1>
        </div>
    </header>

    <div class="ticker-display" style={autoScale ? "width: 100%" : ""}>
        <div
            class="ticker-main"
            style={autoScale
                ? "min-width: 0; display: flex; justify-content: center; width: 100%"
                : ""}
        >
            <Ticker
                value={displayValue}
                {duration}
                {easing}
                {charWidth}
                characterLists={currentCharacterLists}
                {direction}
                {prefix}
                {suffix}
                {disableAnimation}
                {autoScale}
                {fadingEdge}
                numberFormat={activeFormatter}
            />
        </div>
    </div>

    <div class="controls">
        <!-- 模式切换 -->
        <div class="control-group">
            <div class="label">演示模式</div>
            <div class="options">
                <button
                    class:active={mode === "price"}
                    on:click={() => setMode("price")}>数字</button
                >
                <button
                    class:active={mode === "intl-currency"}
                    on:click={() => setMode("intl-currency")}
                    >Intl 格式化</button
                >
                <button
                    class:active={mode === "text"}
                    on:click={() => setMode("text")}>文本</button
                >
            </div>
        </div>

        <!-- 字符宽度控制 -->
        <div class="control-group">
            <div class="label">字符宽度</div>
            <div class="options">
                {#each widthOptions as w}
                    <button
                        class:active={charWidth === w}
                        on:click={() => setCharWidth(w)}>{w}x</button
                    >
                {/each}
            </div>
        </div>

        <!-- 动画时长控制 -->
        <div class="control-group">
            <div class="label">动画时长</div>
            <div class="options">
                {#each durationOptions as d}
                    <button
                        class:active={duration === d}
                        on:click={() => setDuration(d)}>{d}ms</button
                    >
                {/each}
            </div>
        </div>

        <!-- 缓动曲线控制 -->
        <div class="control-group">
            <div class="label">缓动曲线</div>
            <div
                class="options"
                style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;"
            >
                {#each easingOptions as e}
                    <button
                        class:active={easing === e.key}
                        on:click={() => setEasing(e.key)}>{e.label}</button
                    >
                {/each}
            </div>
        </div>

        <!-- 滚动方向控制 -->
        <div class="control-group">
            <div class="label">滚动方向</div>
            <div class="options">
                <button
                    class:active={direction === "ANY"}
                    on:click={() => setDirection("ANY")}>ANY</button
                >
                <button
                    class:active={direction === "UP"}
                    on:click={() => setDirection("UP")}>UP</button
                >
                <button
                    class:active={direction === "DOWN"}
                    on:click={() => setDirection("DOWN")}>DOWN</button
                >
            </div>
        </div>

        <!-- 装饰与控制 -->
        <div class="control-group">
            <div class="label">装饰与控制</div>
            <div
                class="options"
                style="flex-direction: column; gap: 8px; align-items: stretch;"
            >
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <div style="position: relative;">
                        <span
                            style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #a0a3bd; pointer-events: none;"
                            >前</span
                        >
                        <input
                            type="text"
                            bind:value={prefix}
                            style="padding: 6px 8px 6px 24px; border-radius: 6px; border: 1px solid #e0e0e0; width: 80px; text-align: center; font-size: 14px; outline: none; color: #1a1d2d;"
                        />
                    </div>
                    <div style="position: relative;">
                        <span
                            style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); font-size: 12px; color: #a0a3bd; pointer-events: none;"
                            >后</span
                        >
                        <input
                            type="text"
                            bind:value={suffix}
                            style="padding: 6px 8px 6px 24px; border-radius: 6px; border: 1px solid #e0e0e0; width: 80px; text-align: center; font-size: 14px; outline: none; color: #1a1d2d;"
                        />
                    </div>
                </div>
                <div
                    style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 4px;"
                >
                    <button
                        class:active={autoScale}
                        on:click={() => (autoScale = !autoScale)}
                        style="font-size: 13px; padding: 4px 10px; border: 1px solid #e0e0e0;"
                    >
                        自动缩放
                    </button>
                    <button
                        class:active={fadingEdge}
                        on:click={() => (fadingEdge = !fadingEdge)}
                        style="font-size: 13px; padding: 4px 10px; border: 1px solid #e0e0e0;"
                    >
                        边缘模糊
                    </button>
                    <button
                        class:active={disableAnimation}
                        on:click={() => (disableAnimation = !disableAnimation)}
                        style="font-size: 13px; padding: 4px 10px; border: 1px solid #e0e0e0;"
                    >
                        禁用动画
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    /* 留空，使用全局样式 */
</style>
