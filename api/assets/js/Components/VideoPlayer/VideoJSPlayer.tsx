import React, { useRef, useState, useEffect, useMemo } from 'react'
import videojs, { VideoJsPlayerOptions, VideoJsPlayer } from 'video.js'
import videojsDE from 'video.js/dist/lang/de.json'

import 'video.js/dist/video-js.css'
import { Video } from './VideoPlayerWrapper'
import { generate } from 'shortid'
import { AnyAction } from '@reduxjs/toolkit'

export type CustomVideoControl<T extends AnyAction | (() => void)> = {
    controlText: string
    ariaLabel: string
    iconClassNames: Array<string>
    action: T
    indexPosition: number
}

type Props = {
    videoJsOptions: VideoJsPlayerOptions
    videoMap?: Video
    worker?: Worker
    updateTimeCallback?: (currentTime: number) => void
    setPauseCallback?: (pause: boolean) => void
    isPaused?: boolean
    playPosition?: number
    customControls?: Array<CustomVideoControl<() => void>>
}

const defaultVideoJsOptions: VideoJsPlayerOptions = {
    fluid: true,
    language: 'de',
}

const VideoJSPlayer: React.FC<Props> = (props) => {
    const [player, setPlayer] = useState<VideoJsPlayer | undefined>(undefined)
    const videoRef: React.RefObject<HTMLVideoElement> = useRef(null)
    const [vttPath, setVttPath] = useState(props?.videoMap?.url?.vtt)
    const [customComponentsInitialized, setCustomComponentsInitialized] = useState(false)

    // WHY: We create a UID to support multiple players on a single page
    const playerId = useMemo(() => generate(), [])

    useEffect(() => {
        if (videoRef.current !== null) {
            videojs.addLanguage('de', videojsDE)
            setPlayer(videojs(videoRef.current, { ...defaultVideoJsOptions, ...props.videoJsOptions }))
        }

        return () => {
            player?.dispose()
        }
    }, [])

    useEffect(() => {
        if (player && !customComponentsInitialized) {
            setCustomComponentsInitialized(true)
            props.customControls?.forEach((customControl) => {
                const button = player.getChild('ControlBar')?.addChild('button', undefined, customControl.indexPosition)

                if (button) {
                    button.controlText(customControl.controlText)
                    button.el().setAttribute('aria-label', customControl.ariaLabel)

                    const icon = document.createElement('i')
                    icon.classList.add(
                        'vjs-icon-placeholder',
                        'video-player__custom-control__icon',
                        ...customControl.iconClassNames
                    )
                    icon.setAttribute('aria-hidden', 'true')
                    button.el().querySelector('.vjs-icon-placeholder')?.replaceWith(icon)

                    button.on('click', () => {
                        console.log('clicked')
                        customControl.action()
                    })
                }
            })
        }
    }, [player, props.customControls, customComponentsInitialized, setCustomComponentsInitialized])

    useEffect(() => {
        // FIXME switching/adding new subtitles on the fly does currently not work
        // This is only relevant for the SubtitleEditor, because as soon as the .vtt file
        // has been transmitted to the server it will be available to all player occurrences!
        if (player && props.worker && !props.worker.onmessage) {
            // eslint-disable-next-line
            props.worker.onmessage = (event) => {
                setVttPath(event.data)
            }
        }
    }, [player, props.worker])

    useEffect(() => {
        if (player && props.isPaused !== undefined) {
            if (props.isPaused) {
                player.pause()
            } else {
                player.play()
            }
        }
    }, [player, props.isPaused])

    useEffect(() => {
        if (player && props.playPosition !== undefined) {
            player.currentTime(props.playPosition)
        }
    }, [player, props.playPosition])

    const updateTime = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
        if (props.updateTimeCallback) {
            props.updateTimeCallback(event.currentTarget.currentTime)
        }
    }

    const handlePause = (pause: boolean) => {
        if (props.setPauseCallback) {
            props.setPauseCallback(pause)
        }
    }

    return (
        <div className={'video-player'}>
            <div data-vjs-player>
                <video
                    id={playerId}
                    ref={videoRef}
                    onTimeUpdate={updateTime}
                    onPause={() => handlePause(true)}
                    onPlay={() => handlePause(false)}
                    className="video-js"
                >
                    <track kind="captions" src={vttPath} label="Standard" default />
                </video>
            </div>
        </div>
    )
}

export default React.memo(VideoJSPlayer)
