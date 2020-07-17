import React, { useEffect, useCallback, useState } from 'react'
import Sub from '../subtitle/sub'
import { secondToTime, getKeyCode } from '../utils'
import { t } from 'react-i18nify'
import { Render } from './Footer'

function findIndex(subs: Sub[], startTime: number) {
    return subs.findIndex((item, index) => {
        return (
            (startTime >= item.endTime && !subs[index + 1]) ||
            (item.startTime <= startTime && item.endTime > startTime) ||
            (startTime >= item.endTime && subs[index + 1] && startTime < subs[index + 1].startTime)
        )
    })
}

let isDraging = false

type Props = {
    render: Render
    metronome: boolean
    currentTime: number
    subtitles: Sub[]
    addSubtitle: (index: number, sub?: Sub) => void
    player?: {
        pause: boolean
        duration: number
        seek: number
        playing: boolean
    }
    setMetronome: (value: boolean) => void
}

const Metronome = ({ render, metronome, currentTime, subtitles, addSubtitle, player, setMetronome }: Props) => {
    const [metronomeStartTime, setMetronomeStartTime] = useState(0)
    const [drogStartTime, setDrogStartTime] = useState(0)
    const [drogEndTime, setDrogEndTime] = useState(0)

    const gridGap = document.body.clientWidth / render.gridNum
    const $metronomeRef: React.RefObject<HTMLDivElement> = React.createRef()

    const onKeyDown = useCallback(
        (event) => {
            if (metronome) {
                const keyCode = getKeyCode(event)
                if (keyCode === 32) {
                    event.preventDefault()

                    if (!metronomeStartTime) {
                        setMetronomeStartTime(currentTime)
                    }

                    if (metronomeStartTime && metronome && currentTime - metronomeStartTime >= 0.2) {
                        const index = findIndex(subtitles, metronomeStartTime) + 1
                        const start = secondToTime(metronomeStartTime)
                        const end = secondToTime(currentTime)
                        addSubtitle(index, new Sub(start, end, t('subtitle-text')))
                        setMetronomeStartTime(0)
                    }
                }
            }
        },
        [addSubtitle, currentTime, metronome, metronomeStartTime, subtitles]
    )

    const getEventTime = useCallback(
        (event) => {
            return (event.pageX - render.padding * gridGap) / gridGap / 10 + render.beginTime
        },
        [gridGap, render]
    )

    const onMouseDown = useCallback(
        (event) => {
            const clickTime = getEventTime(event)

            if (player) {
                player.seek = clickTime
            }

            isDraging = true
            setDrogStartTime(clickTime)
        },
        [getEventTime, player]
    )

    const onMouseMove = useCallback(
        (event) => {
            if (isDraging) {
                if (player) {
                    player.pause = true
                }
                setDrogEndTime(getEventTime(event))
            }
        },
        [setDrogEndTime, getEventTime, player]
    )

    const onDocumentMouseUp = useCallback(() => {
        if (isDraging) {
            setMetronome(false)
            setMetronomeStartTime(0)
            if (drogStartTime && drogEndTime && drogEndTime - drogStartTime >= 0.2) {
                const index = findIndex(subtitles, drogStartTime) + 1
                const start = secondToTime(drogStartTime)
                const end = secondToTime(drogEndTime)
                addSubtitle(index, new Sub(start, end, t('subtitle-text')))
            }
        }
        isDraging = false
        setDrogStartTime(0)
        setDrogEndTime(0)
    }, [addSubtitle, drogEndTime, drogStartTime, setMetronome, subtitles])

    const onDocumentClick = useCallback(
        (event) => {
            if (event.composedPath) {
                const composedPath = event.composedPath() || []
                if (player?.playing && composedPath.includes($metronomeRef.current)) {
                    setMetronome(true)
                    isDraging = false
                    setDrogStartTime(0)
                    setDrogEndTime(0)
                } else {
                    setMetronome(false)
                    setMetronomeStartTime(0)
                }
            }
        },
        [player, $metronomeRef, setMetronome]
    )

    useEffect(() => {
        window.addEventListener('keydown', onKeyDown)
        document.addEventListener('click', onDocumentClick)
        document.addEventListener('mouseup', onDocumentMouseUp)
        return () => {
            window.removeEventListener('keydown', onKeyDown)
            document.removeEventListener('click', onDocumentClick)
            document.removeEventListener('mouseup', onDocumentMouseUp)
        }
    }, [onKeyDown, onDocumentClick, onDocumentMouseUp])

    return (
        <div
            className="subtitle-editor-metronome"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            ref={$metronomeRef}
        >
            {player && player.playing && metronomeStartTime && metronome && currentTime > metronomeStartTime ? (
                <div
                    className="template"
                    style={{
                        left: render.padding * gridGap + (metronomeStartTime - render.beginTime) * gridGap * 10,
                        width: (currentTime - metronomeStartTime) * gridGap * 10,
                    }}
                ></div>
            ) : null}
            {player && !player.playing && drogStartTime && drogEndTime && drogEndTime > drogStartTime ? (
                <div
                    className="template"
                    style={{
                        left: render.padding * gridGap + (drogStartTime - render.beginTime) * gridGap * 10,
                        width: (drogEndTime - drogStartTime) * gridGap * 10,
                    }}
                ></div>
            ) : null}
        </div>
    )
}

export default Metronome
