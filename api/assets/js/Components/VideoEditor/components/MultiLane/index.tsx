import React, { useRef, useState } from 'react'
import { connect } from 'react-redux'
import AnnotationMedialane from 'Components/VideoEditor/AnnotationsContext/AnnotationMedialane'
import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import Filter from './Filter'
import Toolbar from '../MediaLaneToolbar'
import { useMediaLane, MEDIA_LANE_HEIGHT, MEDIA_LANE_TOOLBAR_HEIGHT } from '../MediaLane/useMediaLane'
import { TabsTypesEnum } from 'types'
import { ComponentId } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import VideoCodesMedialane from 'Components/VideoEditor/VideoCodesContext/VideoCodesMedialane'

export const getComponentName = (componentId: ComponentId) => {
    switch (componentId) {
        case TabsTypesEnum.VIDEO_CODES: {
            return 'Codierungen'
        }

        case TabsTypesEnum.VIDEO_ANNOTATIONS: {
            return 'Annotationen'
        }

        case TabsTypesEnum.VIDEO_CUTTING: {
            return 'Schnitte'
        }

        default: {
            return '<Unbekannte Komponente>'
        }
    }
}

const getMediaLaneComponentById = (componentId: ComponentId) => {
    switch (componentId) {
        case TabsTypesEnum.VIDEO_ANNOTATIONS: {
            return AnnotationMedialane
        }

        case TabsTypesEnum.VIDEO_CODES: {
            return VideoCodesMedialane
        }

        default: {
            return undefined
        }
    }
}

const mapStateToProps = (state: VideoEditorState) => ({
    videos: selectors.config.selectVideos(state.videoEditor),
    playerSyncPlayPosition: selectors.player.selectSyncPlayPosition(state),
    mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
    components: selectors.config.selectComponents(state.videoEditor),
})

const mapDispatchToProps = {
    setPlayPosition: actions.player.setPlayPosition,
    setRenderConfig: actions.mediaLaneRenderConfig.setRenderConfig,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const MultiLane = React.memo((props: Props) => {
    const firstVideoDuration = props.videos[0].duration

    const [activeComponents, setActiveComponents] = useState(props.components.map((id) => ({ id, visible: true })))

    const $container: React.RefObject<HTMLDivElement> = useRef(null)

    const { containerWidth, containerHeight, handleLaneClick, handleZoom } = useMediaLane({
        $container,
        currentTime: props.playerSyncPlayPosition,
        videoDuration: firstVideoDuration,
        laneClickCallback: props.setPlayPosition,
        renderConfig: props.mediaLaneRenderConfig,
        setRenderConfig: props.setRenderConfig,
    })

    return (
        <div className="video-editor-timeline" style={{ height: MEDIA_LANE_HEIGHT }}>
            <Toolbar
                handleTimeLineAction={handleLaneClick}
                renderConfig={props.mediaLaneRenderConfig}
                videoDuration={firstVideoDuration}
                zoomHandler={handleZoom}
            />
            <div
                className="video-editor-timeline__entries multilane"
                style={{ height: MEDIA_LANE_HEIGHT - MEDIA_LANE_TOOLBAR_HEIGHT }}
            >
                <Filter components={activeComponents} setActiveComponents={setActiveComponents} />

                <div className="multilane__content">
                    {activeComponents.map((component) => {
                        if (!component.visible) {
                            return null
                        }

                        const MediaLane = getMediaLaneComponentById(component.id)
                        if (!MediaLane) {
                            return null
                        }

                        return (
                            <>
                                <div className="multilane__medialane-description">{getComponentName(component.id)}</div>
                                <MediaLane
                                    key={`current-user-${component.id}`}
                                    videoDuration={firstVideoDuration}
                                    containerHeight={containerHeight}
                                    containerWidth={containerWidth}
                                    $containerRef={$container}
                                    onClickLane={handleLaneClick}
                                />
                            </>
                        )
                    })}
                </div>
            </div>
        </div>
    )
})

export default connect(mapStateToProps, mapDispatchToProps)(MultiLane)
