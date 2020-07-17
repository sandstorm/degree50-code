import React from 'react'
import ArtplayerComponent from 'artplayer-react'
import Hls from 'hls.js'
import isEqual from 'lodash/isEqual'
import { Player } from './types'

export type PlayerOptions = {
    videoUrl: string
    subtitleUrl: string
}

type Props = {
    height: number
    setPlayer: (player: Player) => void
    setCurrentTime: (time: number) => void
    options: PlayerOptions
}

const Player = ({ options, setPlayer, setCurrentTime, height }: Props) => {
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
                    subtitle: {
                        url: options.subtitleUrl,
                    },
                    moreVideoAttr: {
                        crossOrigin: 'anonymous',
                        preload: 'auto',
                    },
                }}
                getInstance={(art: Player) => {
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

export default React.memo(Player, (prevProps, nextProps) => {
    return isEqual(prevProps.height, nextProps.height)
})
