import React from 'react'
import { Translate } from 'react-i18nify'
import { RenderConfig } from './MediaTrack'

type Props = {
    zoomHandler: (event: React.ChangeEvent<HTMLInputElement>) => void
    videoDuration: number
    renderConfig: RenderConfig
    handleTimeLineAction: (clickTime: number) => void
    children?: React.ReactNode
}

const Toolbar = ({ zoomHandler, videoDuration, renderConfig, handleTimeLineAction, children }: Props) => {
    const leftInteractionAreaIsDisabled = renderConfig.timelineStartTime === 0
    const rightInteractionAreaIsDisabled = renderConfig.timelineStartTime + renderConfig.duration >= videoDuration

    const onClick = (direction: string) => {
        if (direction === 'right') {
            handleTimeLineAction(renderConfig.timelineStartTime + renderConfig.duration)
        } else {
            handleTimeLineAction(renderConfig.timelineStartTime - renderConfig.duration)
        }
    }

    return (
        <div className="video-editor-toolbar">
            <div className="video-editor-toolbar__item-group">
                <label>Timeline: </label>
                <div className="video-editor-toolbar__item">
                    <label htmlFor={'timeline-zoom-handler'}>
                        <Translate value="zoom" />
                    </label>
                    <input
                        name={'timeline-zoom-handöer'}
                        id={'timeline-zoom-handöer'}
                        defaultValue="25"
                        type="range"
                        min="5"
                        max="100"
                        step="1"
                        onChange={zoomHandler}
                    />
                </div>
                <div className="video-editor-toolbar__item">
                    <button
                        tabIndex={1}
                        className={'btn btn-primary btn-sm'}
                        disabled={leftInteractionAreaIsDisabled}
                        onClick={() => {
                            if (!leftInteractionAreaIsDisabled) {
                                onClick('left')
                            }
                        }}
                    >
                        <i className={'fas fa-chevron-left'} />
                    </button>
                </div>
                <div className="video-editor-toolbar__item">
                    <button
                        tabIndex={1}
                        className={'btn btn-primary btn-sm'}
                        disabled={rightInteractionAreaIsDisabled}
                        onClick={() => {
                            if (!rightInteractionAreaIsDisabled) {
                                onClick('right')
                            }
                        }}
                    >
                        <i className={'fas fa-chevron-right'} />
                    </button>
                </div>
            </div>
            {children}
        </div>
    )
}

export default React.memo(Toolbar)
