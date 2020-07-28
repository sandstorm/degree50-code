import React, { useState, useEffect } from 'react'
import ArtplayerComponent from 'artplayer-react'
import Hls from 'hls.js'
import { Player as PlayerType } from './types'

export type PlayerOptions = {
    videoUrl: string
    subtitleUrl?: string
}

type Props = {
    setPlayer: (player: PlayerType) => void
    setCurrentTime: (time: number) => void
    options: PlayerOptions
}

const Player = ({ options, setPlayer, setCurrentTime }: Props) => {
    const [height, setHeight] = useState(200)

    // Get initial height
    useEffect(() => {
        // FIXME use ref instead of direct DOM access
        const container = document.getElementsByClassName('subtitle-editor__main')[0]
        const clientHeight = container.clientHeight
        setHeight(clientHeight)
    }, [])

    return (
        <div className="subtitle-editor-player">
            <ArtplayerComponent
                style={{
                    width: '100%',
                    height: height + 'px',
                }}
                option={{
                    url: options.videoUrl,
                    customType: {
                        m3u8: function (video: HTMLMediaElement, url: string) {
                            var hls = new Hls()
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
                                setCurrentTime(art.currentTime)
                            }
                            loop()
                        })
                    })()

                    // FIXME
                    // @ts-ignore disable-line
                    art.on('seek', () => {
                        setCurrentTime(art.currentTime)
                    })
                }}
            />
        </div>
    )
}

export default React.memo(Player)
