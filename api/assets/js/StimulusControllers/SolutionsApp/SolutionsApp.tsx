import React, { useRef, useState, useCallback } from 'react'
import { connect } from 'react-redux'
import VideoPlayerWrapper, { Video } from '../../Components/VideoPlayer/VideoPlayerWrapper'
import { VideoListsState } from '../../Components/VideoEditor/VideoListsSlice'
import { Teams } from './Components/Teams/Teams'
import { TabsTypesEnum } from '../../types'
import { OverlayProvider } from '@react-aria/overlays'
import { watchModals } from '@react-aria/aria-modal-polyfill'
import Toolbar from '../../Components/VideoEditor/Editors/components/MediaLane/Toolbar'
import { RenderConfig } from '../../Components/VideoEditor/Editors/components/MediaLane/MediaTrack'
import { INITIAL_ZOOM, useMediaLane } from '../../Components/VideoEditor/Editors/components/MediaLane/utils'
import { actions, selectors, VideoEditorState } from '../../Components/VideoEditor/VideoEditorSlice'

export type SolutionByTeam = {
    teamCreator: string
    teamMembers: Array<string>
    solution: VideoListsState
    cutVideo?: Video
}

type OwnProps = {
    solutions: Array<SolutionByTeam>
    videos: Array<Video>
}

const initialRender: RenderConfig = {
    padding: 0,
    duration: 10,
    gridNum: 110,
    gridGap: 10,
    currentTime: 0,
    timelineStartTime: 0,
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        playerSyncPlayPosition: selectors.player.selectSyncPlayPosition(state),
    }
}

const mapDispatchToProps = {
    setPlayPosition: actions.player.setPlayPosition,
}

type ReadOnlyExercisePhaseProps = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const SolutionsApp: React.FC<ReadOnlyExercisePhaseProps> = (props) => {
    // react-aria-modal watches a container element for aria-modal nodes and
    // hides the rest of the dom from screen readers with aria-hidden when one is open.
    watchModals()

    const $container: React.RefObject<HTMLDivElement> = useRef(null)
    const [renderConfig, setRender] = useState<RenderConfig>(initialRender)
    // TODO: reset to Annotations
    const [activeTab, setActiveTab] = useState<TabsTypesEnum>(TabsTypesEnum.VIDEO_CUTTING)
    const firstVideo = props.videos[0]
    const videoDuration: number = firstVideo ? parseFloat(firstVideo.duration) : 5 // duration in seconds
    const currentTime = props.playerSyncPlayPosition

    const { containerWidth, getDurationForRenderConfig, getRenderConfigForZoom } = useMediaLane({
        setRender,
        $container,
        renderConfig,
        currentTime,
        videoDuration,
    })

    initialRender.duration = getDurationForRenderConfig(INITIAL_ZOOM)
    initialRender.gridNum = initialRender.duration * 10 + initialRender.padding * 2
    initialRender.gridGap = containerWidth / initialRender.gridNum

    const updateActiveTab = useCallback(
        (event) => {
            setActiveTab(event.target.value)
        },
        [setActiveTab]
    )

    const updateCurrentTime = useCallback(
        (time: number) => {
            const newTimelineStartTime = Math.floor(time / renderConfig.duration) * renderConfig.duration

            props.setPlayPosition(time)

            setRender({
                ...renderConfig,
                currentTime: time,
                timelineStartTime: newTimelineStartTime,
            })
        },
        [currentTime]
    )

    const handleZoom = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newRenderConfig = getRenderConfigForZoom(parseInt(event.currentTarget.value))

            setRender({
                ...renderConfig,
                ...newRenderConfig,
            })
        },
        [renderConfig]
    )

    return (
        <OverlayProvider className={'exercise-phase__inner solutions'}>
            <div className={'exercise-phase__content'} ref={$container}>
                <VideoPlayerWrapper videos={props.videos} />
                <form className={'solutions__form'}>
                    <div className={'form-group'}>
                        <label htmlFor={'select-solution'}>Lösung auswählen</label>
                        <select
                            id={'select-solution'}
                            className={'form-control'}
                            onChange={updateActiveTab}
                            value={activeTab}
                        >
                            <option value={TabsTypesEnum.VIDEO_ANNOTATIONS}>Annotations</option>
                            <option value={TabsTypesEnum.VIDEO_CODES}>Video-Codes</option>
                            <option value={TabsTypesEnum.VIDEO_CUTTING}>Video-Cuts</option>
                        </select>
                    </div>
                </form>

                <Teams
                    solutions={props.solutions}
                    activeTab={activeTab}
                    renderConfig={renderConfig}
                    updateCurrentTime={updateCurrentTime}
                />
            </div>
            <Toolbar
                zoomHandler={handleZoom}
                videoDuration={videoDuration}
                renderConfig={renderConfig}
                handleTimeLineAction={updateCurrentTime}
            />
        </OverlayProvider>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(SolutionsApp)
