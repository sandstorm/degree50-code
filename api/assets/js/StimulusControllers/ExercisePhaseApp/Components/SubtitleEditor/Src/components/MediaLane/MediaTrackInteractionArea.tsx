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
            const clickTime = getEventTime(event)
            clickCallback(clickTime)
        },
        [getEventTime]
    )

    return (
        <div className="video-editor__interaction-area" onMouseDown={onMouseDown}>
            <div className="template"></div>
        </div>
    )
}

export default React.memo(InteractionArea)
