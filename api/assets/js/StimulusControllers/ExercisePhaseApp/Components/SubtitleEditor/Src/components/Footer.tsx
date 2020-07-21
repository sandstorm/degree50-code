import React, { useState, useEffect } from 'react'
import Block from './Block'
import Metronome from './Metronome'
import { Translate } from 'react-i18nify'
import Sub from '../subtitle/sub'
import { Player } from './types'
import { sleep } from '../utils'

// TODO we need to fully replace the waveform (media-track) with a self-build react component
// WHY: because the waveform is super convoluted, written in an unsafe way with lots of mutation and a few features we don't need.
// Refactoring this is probably harder than actually writing our own component.
// That's why we opted to ts-ignore lots of code which interfaces between the SubtitleEditor and the waveform inside this file.

// @ts-ignore disable-line
import WF from '../waveform'

// @ts-ignore disable-line
let wf = null
const Waveform = React.memo(
    // @ts-ignore disable-line
    ({ options, player, setDecodeing, setFileSize, setChannelNum, setRender }: any) => {
        const $waveform = React.createRef()

        useEffect(() => {
            // @ts-ignore disable-line
            if (wf) wf.destroy()

            wf = new WF({
                container: $waveform.current,
                mediaElement: player.template.$video,
                backgroundColor: 'rgb(20, 23, 38)',
                waveColor: 'rgba(255, 255, 255, 0.1)',
                progressColor: 'rgba(255, 255, 255, 0.5)',
                gridColor: 'rgba(255, 255, 255, 0.05)',
                rulerColor: 'rgba(255, 255, 255, 0.5)',
            })

            wf.on('render', setRender)
            wf.on('decodeing', setDecodeing)
            wf.on('fileSize', setFileSize)
            // @ts-ignore disable-line
            wf.on('audiobuffer', (audiobuffer) => setChannelNum(audiobuffer.numberOfChannels))
            // @ts-ignore disable-line
            sleep(1000).then(() => wf.load(options.videoUrl))
        }, [player, $waveform, options.videoUrl, setDecodeing, setFileSize, setChannelNum, setRender])
        // @ts-ignore disable-line
        return <div className="waveform" ref={$waveform} />
    },

    // @ts-ignore disable-line
    (prevProps, nextProps) => prevProps.options.videoUrl === nextProps.options.videoUrl
)

export type Render = {
    padding: number
    duration: number
    gridNum: number
    beginTime: number
}

type Props = {
    currentTime: number
    subtitles: Sub[]
    addSubtitle: (index: number, sub?: Sub) => void
    player?: Player
    checkSubtitle: (sub: Sub) => boolean
    removeSubtitle: (sub?: Sub) => void
    updateSubtitle: (sub: Sub | undefined, key: string | Object, value?: string) => void // FIXME refine key
    hasSubtitle: (sub?: Sub) => number
    mergeSubtitle: (sub?: Sub) => void
    activeTab: string
}

const Footer = (props: Props) => {
    const [decodeing, setDecodeing] = useState(0)
    const [fileSize, setFileSize] = useState(0)
    const [channelNum, setChannelNum] = useState(1)

    const [metronome, setMetronome] = useState(false)
    const [render, setRender] = useState<Render>({
        padding: 5,
        duration: 10,
        gridNum: 110,
        beginTime: 0,
    })

    return (
        <div className="subtitle-editor-timeline">
            <div className="subtitle-editor-timeline__header">
                <div className="subtitle-editor-timeline__header-left">
                    <div className="item">
                        <div className="name">
                            <Translate value="unit-duration" />
                        </div>
                        <div className="value">
                            <input
                                defaultValue="10"
                                type="range"
                                min="5"
                                max="20"
                                step="1"
                                onChange={(event) => {
                                    // @ts-ignore disable-line
                                    if (!wf) return
                                    // @ts-ignore disable-line
                                    wf.setOptions({
                                        duration: Number(event.target.value || 10),
                                    })
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="subtitle-editor-timeline__body">
                {props.player ? (
                    <Waveform
                        {...props}
                        setDecodeing={setDecodeing}
                        setFileSize={setFileSize}
                        setChannelNum={setChannelNum}
                        setRender={setRender}
                    />
                ) : null}

                <Metronome {...props} render={render} metronome={metronome} setMetronome={setMetronome} />
                <Block {...props} render={render} />
            </div>
        </div>
    )
}

export default Footer
