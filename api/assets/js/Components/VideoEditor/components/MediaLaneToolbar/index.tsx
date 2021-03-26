import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { Translate } from 'react-i18nify'
import { RenderConfig } from '../MediaLane/MediaTrack'
import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import { MEDIA_LANE_TOOLBAR_HEIGHT } from '../MediaLane/useMediaLaneRendering'
import MediaLaneToolbarItem from './MediaLaneToolbarItem'

type OwnProps = {
    updateZoom: (value: number) => void
    videoDuration: number
    renderConfig: RenderConfig
    handleTimeLineAction: (clickTime: number) => void
    children?: React.ReactNode
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        playerIsPaused: selectors.player.selectIsPaused(state),
    }
}

const mapDispatchToProps = {
    togglePlay: actions.player.togglePlay,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const Toolbar = ({ updateZoom, videoDuration, renderConfig, handleTimeLineAction, children }: Props) => {
    const leftInteractionAreaIsDisabled = renderConfig.timelineStartTime === 0
    const rightInteractionAreaIsDisabled = renderConfig.timelineStartTime + renderConfig.duration >= videoDuration

    const onClick = (direction: string) => {
        if (direction === 'right') {
            handleTimeLineAction(renderConfig.timelineStartTime + renderConfig.duration)
        } else {
            handleTimeLineAction(renderConfig.timelineStartTime - renderConfig.duration)
        }
    }

    const zoomHandler = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            updateZoom(parseInt(ev.currentTarget.value))
        },
        [updateZoom]
    )

    return (
        <div className="video-editor-toolbar" style={{ height: MEDIA_LANE_TOOLBAR_HEIGHT }}>
            <div className="video-editor-toolbar__item-group">
                <MediaLaneToolbarItem>
                    <label htmlFor="timeline-zoom-handler">
                        <Translate value="zoom" />
                    </label>
                    <input
                        name="timeline-zoom-handler"
                        id="timeline-zoom-handler"
                        value={renderConfig.zoom}
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        onChange={zoomHandler}
                    />
                </MediaLaneToolbarItem>
                <MediaLaneToolbarItem>
                    <button
                        tabIndex={1}
                        className={'btn btn-primary btn-sm'}
                        disabled={leftInteractionAreaIsDisabled}
                        title={'Timeline nach links verschieben'}
                        onClick={() => {
                            onClick('left')
                        }}
                    >
                        <i className={'fas fa-chevron-left'} />
                    </button>
                </MediaLaneToolbarItem>
                <MediaLaneToolbarItem>
                    <button
                        tabIndex={1}
                        className={'btn btn-primary btn-sm'}
                        disabled={rightInteractionAreaIsDisabled}
                        title={'Timeline nach rechts verschieben'}
                        onClick={() => {
                            onClick('right')
                        }}
                    >
                        <i className={'fas fa-chevron-right'} />
                    </button>
                </MediaLaneToolbarItem>
            </div>
            {children && <div className="video-editor-toolbar__item-group">{children}</div>}
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Toolbar))
