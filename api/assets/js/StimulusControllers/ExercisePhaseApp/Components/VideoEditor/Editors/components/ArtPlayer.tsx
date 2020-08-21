import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import ArtplayerComponent from 'artplayer-react'
import Hls from 'hls.js'
import { Player as PlayerType } from './types'

import { actions, selectors } from '../../PlayerSlice'
import { useMutablePlayer } from '../utils/hooks'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'

export type PlayerOptions = {
    videoUrl: string
    subtitleUrl?: string
}

type OwnProps = {
    currentTimeCallback: (time: number) => void
    options: PlayerOptions
}

const mapStateToProps = (state: AppState) => {
    return {
        playPosition: selectors.selectPlayPosition(state),
        isPaused: selectors.selectIsPaused(state),
    }
}

const mapDispatchToProps = {
    setSyncPlayPosition: actions.setSyncPlayPosition,
    setPause: actions.setPause,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

// TODO handle pause from outside
const ArtPlayer = ({ options, currentTimeCallback, setSyncPlayPosition, playPosition, isPaused, setPause }: Props) => {
    const [height, setHeight] = useState(200)

    const { player, setPlayer } = useMutablePlayer()

    // Set player position from the outside.
    useEffect(() => {
        if (player) {
            player.seek = playPosition
        }
    }, [player, playPosition])

    useEffect(() => {
        if (player) {
            // @ts-ignore
            player.play = !isPaused
        }
    }, [player, isPaused])

    // Get initial height
    useEffect(() => {
        const container = document.getElementsByClassName('video-editor__main')[0]
        const clientHeight = container.clientHeight
        setHeight(clientHeight)
    }, [])

    return (
        <div className="video-editor-player">
            <ArtplayerComponent
                style={{
                    width: '100%',
                    height: height + 'px',
                }}
                option={{
                    url: options.videoUrl,
                    customType: {
                        m3u8: function (video: HTMLMediaElement, url: string) {
                            const hls = new Hls()
                            hls.loadSource(url)
                            hls.attachMedia(video)
                            if (!video.src) {
                                video.src = url
                            }
                        },
                    },
                    loop: true,
                    autoSize: true,
                    aspectRatio: true,
                    playbackRate: true,
                    fullscreen: true,
                    fullscreenWeb: true,
                    miniProgressBar: true,
                    ...(options.subtitleUrl ? { url: options.subtitleUrl } : {}),
                    moreVideoAttr: {
                        crossOrigin: 'anonymous',
                        preload: 'auto',
                    },
                }}
                getInstance={(art: PlayerType) => {
                    setPlayer(art)
                    ;(function loop() {
                        window.requestAnimationFrame(() => {
                            if (art.playing) {
                                currentTimeCallback(art.currentTime)
                                setSyncPlayPosition(art.currentTime)
                            }
                            loop()
                        })
                    })()

                    // FIXME
                    // @ts-ignore disable-line
                    art.on('seek', () => {
                        setSyncPlayPosition(art.currentTime)
                        currentTimeCallback(art.currentTime)
                    })

                    // @ts-ignore disable-line
                    art.on('play', () => {
                        setPause(false)
                    })

                    // @ts-ignore disable-line
                    art.on('pause', () => {
                        setPause(true)
                    })
                }}
            />
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(ArtPlayer))
