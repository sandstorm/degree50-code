import DT from 'duration-time-conversion'
import { RenderConfig } from '.'

export type MediaTrackConfig = {
    backgroundColor: string
    rulerBackgroundColor: string
    gridColor: string
    pixelRatio: number
    rulerColor: string
    fontSize: number
    fontHeight: number
    fontTop: number
    cursorColor: string
    render: RenderConfig
}

export const updateCanvas = (canvas: HTMLCanvasElement, config: MediaTrackConfig) => {
    drawBackground(canvas, {
        backgroundColor: config.backgroundColor,
    })
    drawRulerBackground(canvas, {
        fontTop: config.fontTop,
        rulerBackgroundColor: config.rulerBackgroundColor,
    })
    drawGrid(canvas, {
        gridNum: config.render.gridNum,
        gridGap: config.render.gridGap,
        gridColor: config.gridColor,
        pixelRatio: config.pixelRatio,
    })
    drawRuler(canvas, {
        rulerColor: config.rulerColor,
        pixelRatio: config.pixelRatio,
        padding: config.render.padding,
        fontSize: config.fontSize,
        fontHeight: config.fontHeight,
        fontTop: config.fontTop,
        timelineStartTime: config.render.timelineStartTime,
        gridNum: config.render.gridNum,
        gridGap: config.render.gridGap,
    })
    drawCursor(canvas, {
        currentTime: config.render.currentTime,
        cursorColor: config.cursorColor,
        padding: config.render.padding,
        pixelRatio: config.pixelRatio,
        timelineStartTime: config.render.timelineStartTime,
        gridGap: config.render.gridGap,
    })
}

const drawBackground = (
    canvas: HTMLCanvasElement,
    {
        backgroundColor,
    }: {
        backgroundColor: string
    }
): void => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = backgroundColor

    ctx.fillRect(0, 0, width, height)
}

const drawGrid = (
    canvas: HTMLCanvasElement,
    {
        gridNum,
        gridGap,
        gridColor,
        pixelRatio,
    }: {
        gridNum: number
        gridGap: number
        gridColor: string
        pixelRatio: number
    }
): void => {
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const { height } = canvas

    ctx.fillStyle = gridColor

    const adjustmentFactor = getAdjustmentFactorForGrid(gridGap, gridNum, canvas.width)
    // Vertical grid lines
    for (let index = 0; index < gridNum; index += adjustmentFactor) {
        ctx.fillRect(gridGap * index, 0, pixelRatio, height)
    }
}

const drawRulerBackground = (
    canvas: HTMLCanvasElement,
    {
        fontTop,
        rulerBackgroundColor,
    }: {
        fontTop: number
        rulerBackgroundColor: string
    }
) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width } = canvas

    ctx.fillStyle = rulerBackgroundColor

    ctx.fillRect(0, 0, width, fontTop + 11)
}

const drawRuler = (
    canvas: HTMLCanvasElement,
    {
        rulerColor,
        pixelRatio,
        padding,
        fontSize,
        fontHeight,
        fontTop,
        timelineStartTime,
        gridNum,
        gridGap,
    }: {
        rulerColor: string
        pixelRatio: number
        padding: number
        fontSize: number
        fontHeight: number
        fontTop: number
        timelineStartTime: number
        gridNum: number
        gridGap: number
    }
) => {
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.font = `${fontSize * pixelRatio}px Arial`
    ctx.fillStyle = rulerColor

    const adjustmentFactor = getAdjustmentFactorForGrid(gridGap, gridNum, canvas.width)

    let second = 0
    for (let index = 0; index < gridNum; index += 1) {
        if (index && index >= padding && index <= gridNum - padding && index % (10 * adjustmentFactor) === 0) {
            second += adjustmentFactor
            ctx.fillRect(gridGap * index, 0, pixelRatio, fontHeight * pixelRatio)

            const displayTime = DT.d2t(timelineStartTime + second).split('.')[0]
            ctx.fillText(displayTime, gridGap * index - fontSize * pixelRatio * 2 + pixelRatio, fontTop + 3)
        } else if (index && index % (5 * adjustmentFactor) === 0) {
            ctx.fillRect(gridGap * index, 0, pixelRatio, (fontHeight / 2) * pixelRatio)
        }
    }
}

const drawCursor = (
    canvas: HTMLCanvasElement,
    {
        currentTime,
        cursorColor,
        padding,
        pixelRatio,
        timelineStartTime,
        gridGap,
    }: {
        currentTime: number
        cursorColor: string
        padding: number
        pixelRatio: number
        timelineStartTime: number
        gridGap: number
    }
) => {
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const { height } = canvas

    ctx.fillStyle = cursorColor
    ctx.fillRect(padding * gridGap + (currentTime - timelineStartTime) * gridGap * 10, 0, pixelRatio, height)
}

const getAdjustmentFactorForGrid = (gridGap: number, gridNum: number, canvasWidth: number) => {
    let adjustmentFactor = 1

    if (gridGap <= 10 && canvasWidth > 0) {
        const targetGridGap = canvasWidth / 10
        adjustmentFactor = Math.round((gridNum / targetGridGap + Number.EPSILON) * 1) / 1
    }

    if (adjustmentFactor < 1) {
        adjustmentFactor = 1
    }

    return adjustmentFactor
}
