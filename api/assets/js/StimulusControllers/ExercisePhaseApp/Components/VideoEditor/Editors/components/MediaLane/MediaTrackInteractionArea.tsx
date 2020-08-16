import React, { useCallback } from 'react'
import { RenderConfig } from './MediaTrack'

type Props = {
    renderConfig: RenderConfig
    clickCallback: (clickTime: number) => void
    gridGap: number
}

const InteractionArea = ({ renderConfig, clickCallback, gridGap }: Props) => {
    const getEventTime = useCallback(
        (event) => {
            return (event.pageX - renderConfig.padding * gridGap) / gridGap / 10 + renderConfig.timelineStartTime
        },
        [gridGap, renderConfig]
    )

    const onMouseDown = useCallback(
        (event) => {
            if (
                event.target?.className &&
                (event.target.className.includes('video-editor__interaction-area-left') ||
                    event.target.className.includes('video-editor__interaction-area-right'))
            ) {
                return
            }
            const clickTime = getEventTime(event)
            clickCallback(clickTime)
        },
        [getEventTime]
    )

    const onClick = (direction: string) => {
        if (direction === 'right') {
            clickCallback(renderConfig.timelineStartTime + renderConfig.duration)
        } else {
            clickCallback(renderConfig.timelineStartTime - renderConfig.duration)
        }
    }

    const leftInteractionAreaIsDisabledCssClass =
        renderConfig.timelineStartTime === 0 ? 'video-editor__interaction-area-left--is-disabled' : ''

    return (
        <div className="video-editor__interaction-area" onMouseDown={onMouseDown}>
            <div
                className={'video-editor__interaction-area-left ' + leftInteractionAreaIsDisabledCssClass}
                style={{ width: gridGap * renderConfig.padding }}
                onClick={() => {
                    onClick('left')
                }}
            >
                <i className={'fas fa-chevron-left'} />
            </div>
            <div
                className={'video-editor__interaction-area-right'}
                style={{ width: gridGap * renderConfig.padding }}
                onClick={() => {
                    onClick('right')
                }}
            >
                <i className={'fas fa-chevron-right'} />
            </div>
            <div className="video-editor__media-item__template" />
        </div>
    )
}

export default React.memo(InteractionArea)
