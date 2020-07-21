import React, { useState, useEffect, useCallback } from 'react'
import isEqual from 'lodash/isEqual'
import { notify, secondToTime, getKeyCode } from '../utils'
import { t, Translate } from 'react-i18nify'
import { Tabs } from './App'
import Sub from '../subtitle/sub'
import { Render } from './Footer'

function getCurrentSubs(subs: Sub[], beginTime: number, duration: number): Sub[] {
    return subs.filter((item) => {
        return (
            (item.startTime >= beginTime && item.startTime <= beginTime + duration) ||
            (item.endTime >= beginTime && item.endTime <= beginTime + duration)
        )
    })
}

let lastTarget: HTMLElement | null | undefined = undefined
let lastSub: Sub | undefined = undefined
let lastType = ''
let lastX = 0
let lastIndex = -1
let lastWidth = 0
let lastDiffX = 0
let isDroging = false

type Props = {
    player?: {
        seek: number
        duration: number
    }
    subtitles: Sub[]
    render: Render
    currentTime: number
    checkSubtitle: (sub: Sub) => boolean
    removeSubtitle: (sub?: Sub) => void
    addSubtitle: (index: number, sub?: Sub) => void
    updateSubtitle: (sub: Sub | undefined, key: string | Object, value?: string) => void // FIXME refine key
    hasSubtitle: (sub?: Sub) => number
    mergeSubtitle: (sub?: Sub) => void
    activeTab: string
}

const Block = ({
    player,
    subtitles,
    render,
    currentTime,
    checkSubtitle,
    removeSubtitle,
    addSubtitle,
    hasSubtitle,
    mergeSubtitle,
    updateSubtitle,
    activeTab,
}: Props) => {
    const [contextMenuIsVisible, setContextMenuVisibility] = useState(false)
    const [contextMenuX, setContextMenuX] = useState(0)
    const [contextMenuY, setContextMenuY] = useState(0)

    const $blockRef: React.RefObject<HTMLDivElement> = React.createRef()
    const $contextMenuRef: React.RefObject<HTMLDivElement> = React.createRef()
    const $subsRef: React.RefObject<HTMLDivElement> = React.createRef()
    const currentSubs = getCurrentSubs(subtitles, render.beginTime, render.duration)
    const gridGap = document.body.clientWidth / render.gridNum
    const currentIndex = currentSubs.findIndex((item) => item.startTime <= currentTime && item.endTime > currentTime)

    const onContextMenu = (sub: Sub, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        lastSub = sub
        event.preventDefault()
        const $subs = event.target as HTMLDivElement
        const subsTop = $subs.getBoundingClientRect().top
        const $contextMenu = $contextMenuRef.current
        const clientHeight = $contextMenu?.clientHeight || 0
        const clientWidth = $contextMenu?.clientWidth || 0
        const top =
            event.pageY + clientHeight > document.body.clientHeight
                ? document.body.clientHeight - clientHeight - subsTop
                : event.pageY - subsTop
        const left =
            event.pageX + clientWidth > document.body.clientWidth
                ? document.body.clientWidth - clientWidth
                : event.pageX
        setContextMenuX(left)
        setContextMenuY(top)
        setContextMenuVisibility(true)
    }

    const onDocumentClick = useCallback(
        (event) => {
            if (event.composedPath) {
                const composedPath = event.composedPath() || []
                if (composedPath.includes($contextMenuRef.current)) {
                    setContextMenuVisibility(false)
                }
            }
        },
        [$contextMenuRef, setContextMenuVisibility]
    )

    // FIXME refine type
    const onMouseDown = (sub: Sub, event: React.MouseEvent<HTMLDivElement, MouseEvent>, type: string = '') => {
        isDroging = true
        lastSub = sub
        lastType = type
        lastX = event.pageX
        lastIndex = currentSubs.indexOf(sub)

        const subs = $subsRef.current as HTMLDivElement
        lastTarget = subs.children[lastIndex] as HTMLElement

        lastWidth = parseFloat(lastTarget.style.width)
    }

    const onDocumentMouseMove = useCallback((event) => {
        if (isDroging && lastTarget) {
            lastDiffX = event.pageX - lastX
            if (lastType === 'left') {
                lastTarget.style.width = `${lastWidth - lastDiffX}px`
                lastTarget.style.transform = `translate(${lastDiffX}px)`
            } else if (lastType === 'right') {
                lastTarget.style.width = `${lastWidth + lastDiffX}px`
            } else {
                lastTarget.style.transform = `translate(${lastDiffX}px)`
            }
        }
    }, [])

    const onDocumentMouseUp = useCallback(() => {
        if (isDroging && lastTarget && lastDiffX) {
            const timeDiff = lastDiffX / gridGap / 10
            const index = hasSubtitle(lastSub)
            const previou = subtitles[index - 1]
            const next = subtitles[index + 1]
            const startTime = (lastSub?.startTime || 0) + timeDiff
            const endTime = (lastSub?.endTime || 0) + timeDiff

            if ((previou && endTime < previou.startTime) || (next && startTime > next.endTime)) {
                notify(t('parameter-error'), 'error')
            } else {
                if (lastType === 'left') {
                    if (startTime >= 0 && startTime < (lastSub?.endTime || 0)) {
                        const start = secondToTime(startTime)
                        updateSubtitle(lastSub, 'start', start)
                        if (player) {
                            player.seek = startTime
                        }
                    } else {
                        lastTarget.style.width = `${lastWidth}px`
                        notify(t('parameter-error'), 'error')
                    }
                } else if (lastType === 'right') {
                    if (endTime >= 0 && endTime > (lastSub?.startTime || 0)) {
                        const end = secondToTime(endTime)
                        updateSubtitle(lastSub, 'end', end)

                        if (player) {
                            player.seek = startTime
                        }
                    } else {
                        lastTarget.style.width = `${lastWidth}px`
                        notify(t('parameter-error'), 'error')
                    }
                } else {
                    if (startTime > 0 && endTime > 0 && endTime > startTime) {
                        const start = secondToTime(startTime)
                        const end = secondToTime(endTime)

                        updateSubtitle(lastSub, {
                            start,
                            end,
                        })

                        if (player) {
                            player.seek = startTime
                        }
                    } else {
                        lastTarget.style.width = `${lastWidth}px`
                        notify(t('parameter-error'), 'error')
                    }
                }
            }

            lastTarget.style.transform = `translate(0)`
        }

        lastType = ''
        lastX = 0
        lastWidth = 0
        lastDiffX = 0
        isDroging = false
    }, [gridGap, hasSubtitle, player, subtitles, updateSubtitle])

    const onKeyDown = useCallback(
        (event) => {
            const sub = currentSubs[lastIndex]
            if (sub && lastTarget) {
                const keyCode = getKeyCode(event)
                switch (keyCode) {
                    case 37:
                        updateSubtitle(sub, {
                            start: secondToTime(sub.startTime - 0.1),
                            end: secondToTime(sub.endTime - 0.1),
                        })

                        if (player) {
                            player.seek = sub.startTime - 0.1
                        }
                        break
                    case 39:
                        updateSubtitle(sub, {
                            start: secondToTime(sub.startTime + 0.1),
                            end: secondToTime(sub.endTime + 0.1),
                        })

                        if (player) {
                            player.seek = sub.startTime + 0.1
                        }

                        break
                    case 8:
                    case 46:
                        removeSubtitle(sub)
                        break
                    default:
                        break
                }
            }
        },
        [currentSubs, player, removeSubtitle, updateSubtitle]
    )

    useEffect(() => {
        document.addEventListener('click', onDocumentClick)
        document.addEventListener('mousemove', onDocumentMouseMove)
        document.addEventListener('mouseup', onDocumentMouseUp)
        window.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('click', onDocumentClick)
            document.removeEventListener('mousemove', onDocumentMouseMove)
            document.removeEventListener('mouseup', onDocumentMouseUp)
            window.removeEventListener('keydown', onKeyDown)
        }
    }, [onDocumentClick, onDocumentMouseMove, onDocumentMouseUp, onKeyDown])

    const contextMenuDeleteButton = (
        <div
            className="subtitle-editor-block__contextmenu-item"
            onClick={() => {
                removeSubtitle(lastSub)
                setContextMenuVisibility(false)
            }}
        >
            <Translate value="delete" />
        </div>
    )
    const contextMenuInsertButton = (
        <div
            className="subtitle-editor-block__contextmenu-item"
            onClick={() => {
                addSubtitle(hasSubtitle(lastSub) + 1)
                setContextMenuVisibility(false)
            }}
        >
            <Translate value="insert" />
        </div>
    )
    const contextMenuMergeButton = (
        <div
            className="subtitle-editor-block__contextmenu-item"
            onClick={() => {
                mergeSubtitle(lastSub)
                setContextMenuVisibility(false)
            }}
        >
            <Translate value="merge" />
        </div>
    )
    let contextMenu = (
        <div
            ref={$contextMenuRef}
            className="subtitle-editor-block__contextmenu"
            style={{
                visibility: contextMenuIsVisible ? 'visible' : 'hidden',
                left: contextMenuX,
                top: contextMenuY,
            }}
        >
            {contextMenuDeleteButton}
            {contextMenuInsertButton}
            {contextMenuMergeButton}
        </div>
    )

    if (activeTab === Tabs.VIDEO_CODES) {
        contextMenu = (
            <div
                ref={$contextMenuRef}
                className="subtitle-editor-block__contextmenu"
                style={{
                    visibility: contextMenuIsVisible ? 'visible' : 'hidden',
                    left: contextMenuX,
                    top: contextMenuY,
                }}
            >
                {contextMenuDeleteButton}
            </div>
        )
    }

    return (
        <div className="subtitle-editor-block" ref={$blockRef}>
            <div ref={$subsRef}>
                {currentSubs.map((sub, key) => {
                    return (
                        <div
                            className={[
                                'subtitle-editor-block__item',
                                key === currentIndex ? 'subtitle-editor-block__item--highlight' : '',
                                checkSubtitle(sub) ? 'subtitle-editor-block__item--illegal' : '',
                            ]
                                .join(' ')
                                .trim()}
                            key={key}
                            style={{
                                backgroundColor: sub.color ? sub.color : '',
                                left: render.padding * gridGap + (sub.startTime - render.beginTime) * gridGap * 10,
                                width: (sub.endTime - sub.startTime) * gridGap * 10,
                            }}
                            onClick={() => {
                                setContextMenuVisibility(false)
                                // TODO player not set on init?
                                if (player && player.duration >= sub.startTime) {
                                    player.seek = sub.startTime + 0.001
                                }
                            }}
                            onContextMenu={(event) => onContextMenu(sub, event)}
                        >
                            <div
                                className="subtitle-editor-block__handle"
                                style={{
                                    left: 0,
                                    width: gridGap,
                                }}
                                onMouseDown={(event) => onMouseDown(sub, event, 'left')}
                            ></div>
                            <div
                                className="subtitle-editor-block__text"
                                onMouseDown={(event) => onMouseDown(sub, event)}
                            >
                                {sub.text.split(/\r?\n/).map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>
                            <div
                                className="subtitle-editor-block__handle"
                                style={{
                                    right: 0,
                                    width: gridGap,
                                }}
                                onMouseDown={(event) => onMouseDown(sub, event, 'right')}
                            ></div>
                        </div>
                    )
                })}
            </div>
            {contextMenu}
        </div>
    )
}

export default React.memo(Block, (prevProps, nextProps) => {
    return (
        isEqual(prevProps.subtitles, nextProps.subtitles) &&
        isEqual(prevProps.render, nextProps.render) &&
        prevProps.currentTime === nextProps.currentTime
    )
})
