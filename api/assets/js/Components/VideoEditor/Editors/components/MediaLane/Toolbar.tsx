import React from 'react'
import { connect } from 'react-redux'
import { Translate } from 'react-i18nify'
import { RenderConfig } from './MediaTrack'
import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import { MEDIA_LANE_TOOLBAR_HEIGHT } from './index'
import { INITIAL_ZOOM } from './utils'

type OwnProps = {
    zoomHandler: (event: React.ChangeEvent<HTMLInputElement>) => void
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

const Toolbar = ({
    zoomHandler,
    videoDuration,
    renderConfig,
    handleTimeLineAction,
    children,
    playerIsPaused,
    togglePlay,
}: Props) => {
    const leftInteractionAreaIsDisabled = renderConfig.timelineStartTime === 0
    const rightInteractionAreaIsDisabled = renderConfig.timelineStartTime + renderConfig.duration >= videoDuration

    const onClick = (direction: string) => {
        if (direction === 'right') {
            handleTimeLineAction(renderConfig.timelineStartTime + renderConfig.duration)
        } else {
            handleTimeLineAction(renderConfig.timelineStartTime - renderConfig.duration)
        }
    }

    const onPlayPauseClick = () => {
        togglePlay()
    }

    return (
        <div className="video-editor-toolbar" style={{ height: MEDIA_LANE_TOOLBAR_HEIGHT }}>
            <div className="video-editor-toolbar__item-group">
                <label className={'video-editor-toolbar__item-group-label'}>Timeline: </label>
                <div className="video-editor-toolbar__item">
                    <label htmlFor={'timeline-zoom-handler'}>
                        <Translate value="zoom" />
                    </label>
                    <input
                        name={'timeline-zoom-handler'}
                        id={'timeline-zoom-handler'}
                        defaultValue={INITIAL_ZOOM}
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
                        title={'Shift timeline left'}
                        onClick={() => {
                            onClick('left')
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
                        title={'Shift timeline right'}
                        onClick={() => {
                            onClick('right')
                        }}
                    >
                        <i className={'fas fa-chevron-right'} />
                    </button>
                </div>
            </div>
            <div className="video-editor-toolbar__item-group">
                <label className={'video-editor-toolbar__item-group-label'}>Playback: </label>
                <div className="video-editor-toolbar__item">
                    <button tabIndex={1} className={'btn btn-primary btn-sm'} onClick={onPlayPauseClick}>
                        {playerIsPaused ? (
                            <span>
                                <i className="fas fa-play" /> Play
                            </span>
                        ) : (
                            <span>
                                <i className="fas fa-pause" /> Pause
                            </span>
                        )}
                    </button>
                </div>
            </div>
            {children}
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Toolbar))
