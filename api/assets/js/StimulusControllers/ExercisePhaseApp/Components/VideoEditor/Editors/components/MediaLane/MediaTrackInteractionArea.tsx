import React, { useCallback } from 'react'
import { RenderConfig } from './MediaTrack'

type Props = {
    renderConfig: RenderConfig
    clickCallback: (clickTime: number) => void
    videoDuration: number
}

const InteractionArea = ({ renderConfig, clickCallback, videoDuration }: Props) => {
    const getEventTime = useCallback(
        (event) => {
            return (
                (event.pageX - renderConfig.padding * renderConfig.gridGap) / renderConfig.gridGap / 10 +
                renderConfig.timelineStartTime
            )
        },
        [renderConfig]
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

    const leftInteractionAreaIsDisabled = renderConfig.timelineStartTime === 0
    const leftInteractionAreaIsDisabledCssClass = leftInteractionAreaIsDisabled
        ? 'video-editor__interaction-area-left--is-disabled'
        : ''

    const rightInteractionAreaIsDisabled = renderConfig.timelineStartTime + renderConfig.duration >= videoDuration
    const rightInteractionAreaIsDisabledCssClass = rightInteractionAreaIsDisabled
        ? 'video-editor__interaction-area-right--is-disabled'
        : ''

    return (
        <div className="video-editor__interaction-area" onMouseDown={onMouseDown}>
            <div
                tabIndex={1}
                role={'button'}
                className={'video-editor__interaction-area-left ' + leftInteractionAreaIsDisabledCssClass}
                style={{ width: renderConfig.gridGap * renderConfig.padding }}
                onClick={() => {
                    if (!leftInteractionAreaIsDisabled) {
                        onClick('left')
                    }
                }}
            >
                <i className={'fas fa-chevron-left'} />
            </div>
            <div
                tabIndex={1}
                role={'button'}
                className={'video-editor__interaction-area-right ' + rightInteractionAreaIsDisabledCssClass}
                style={{ width: renderConfig.gridGap * renderConfig.padding }}
                onClick={() => {
                    if (!rightInteractionAreaIsDisabled) {
                        onClick('right')
                    }
                }}
            >
                <i className={'fas fa-chevron-right'} />
            </div>
            <div className="video-editor__media-item__template" />
        </div>
    )
}

export default React.memo(InteractionArea)
