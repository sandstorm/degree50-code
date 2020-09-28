import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import ArtplayerComponent from 'artplayer-react'
import Hls from 'hls.js'
import { Player as PlayerType } from './types'

import { useMutablePlayer } from '../utils/hooks'
import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'

export type PlayerOptions = {
    videoUrl: string
    subtitleUrl?: string
}

type OwnProps = {
    worker?: Worker
    currentTimeCallback?: (time: number) => void
    options: PlayerOptions
    containerHeight: number
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        playPosition: selectors.player.selectPlayPosition(state),
        isPaused: selectors.player.selectIsPaused(state),
    }
}

const mapDispatchToProps = {
    setSyncPlayPosition: actions.player.setSyncPlayPosition,
    setPause: actions.player.setPause,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

// TODO handle pause from outside
const ArtPlayer = ({
    worker,
    options,
    currentTimeCallback,
    setSyncPlayPosition,
    playPosition,
    isPaused,
    setPause,
    containerHeight,
}: Props) => {
    const { player, setPlayer } = useMutablePlayer(worker)

    const height =
        containerHeight === 0
            ? 200 // min height
            : containerHeight

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
                    ...(options.subtitleUrl ? { subtitle: { url: options.subtitleUrl } } : {}),
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
                                if (currentTimeCallback) {
                                    currentTimeCallback(art.currentTime)
                                }
                                setSyncPlayPosition(art.currentTime)
                            }
                            loop()
                        })
                    })()

                    // FIXME
                    // @ts-ignore disable-line
                    art.on('seek', () => {
                        setSyncPlayPosition(art.currentTime)
                        if (currentTimeCallback) {
                            currentTimeCallback(art.currentTime)
                        }
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
