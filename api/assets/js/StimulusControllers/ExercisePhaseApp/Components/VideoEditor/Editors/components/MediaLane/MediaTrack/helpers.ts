import DT from 'duration-time-conversion'
import { RenderConfig } from '.'

export type MediaTrackConfig = {
    backgroundColor: string
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
    const gridGap = canvas.width / config.render.gridNum

    drawBackground(canvas, {
        backgroundColor: config.backgroundColor,
        padding: config.render.padding,
        gridGap,
    })
    drawGrid(canvas, {
        gridNum: config.render.gridNum,
        gridGap,
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
    })
    drawCursor(canvas, {
        currentTime: config.render.currentTime,
        cursorColor: config.cursorColor,
        padding: config.render.padding,
        gridNum: config.render.gridNum,
        pixelRatio: config.pixelRatio,
        timelineStartTime: config.render.timelineStartTime,
    })
}

const drawBackground = (
    canvas: HTMLCanvasElement,
    {
        backgroundColor,
        padding,
        gridGap,
    }: {
        backgroundColor: string
        padding: number
        gridGap: number
    }
): void => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas

    ctx.clearRect(0, 0, width, height)
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, height)
    ctx.fillRect(0, 0, padding * gridGap, height)
    ctx.fillRect(width - padding * gridGap, 0, padding * gridGap, height)
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

    const { width, height } = canvas

    ctx.fillStyle = gridColor

    for (let index = 0; index < gridNum; index += 1) {
        ctx.fillRect(gridGap * index, 0, pixelRatio, height)
    }

    for (let index = 0; index < height / gridGap; index += 1) {
        ctx.fillRect(0, gridGap * index, width, pixelRatio)
    }
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
    }: {
        rulerColor: string
        pixelRatio: number
        padding: number
        fontSize: number
        fontHeight: number
        fontTop: number
        timelineStartTime: number
        gridNum: number
    }
) => {
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.font = `${fontSize * pixelRatio}px Arial`
    ctx.fillStyle = rulerColor

    const gridGap = canvas.width / gridNum

    let second = -1

    for (let index = 0; index < gridNum; index += 1) {
        if (index && index >= padding && index <= gridNum - padding && (index - padding) % 10 === 0) {
            second += 1
            ctx.fillRect(gridGap * index, 0, pixelRatio, fontHeight * pixelRatio)

            const displayTime = DT.d2t(timelineStartTime + second).split('.')[0]
            ctx.fillText(displayTime, gridGap * index - fontSize * pixelRatio * 2 + pixelRatio, fontTop)
        } else if (index && (index - padding) % 5 === 0) {
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
        gridNum,
        pixelRatio,
        timelineStartTime,
    }: {
        currentTime: number
        cursorColor: string
        padding: number
        gridNum: number
        pixelRatio: number
        timelineStartTime: number
    }
) => {
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const { height, width } = canvas
    const gridGap = width / gridNum

    ctx.fillStyle = cursorColor
    ctx.fillRect(padding * gridGap + (currentTime - timelineStartTime) * gridGap * 10, 0, pixelRatio, height)
}
