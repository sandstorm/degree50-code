import React, { useCallback, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { VideoListsState } from '../../Components/VideoEditor/VideoListsSlice'
import { Teams } from './Components/Teams/Teams'
import { TabsTypesEnum } from '../../types'
import { OverlayProvider } from '@react-aria/overlays'
import { watchModals } from '@react-aria/aria-modal-polyfill'
import Toolbar from '../../Components/VideoEditor/Editors/components/MediaLane/Toolbar'
import { RenderConfig } from '../../Components/VideoEditor/Editors/components/MediaLane/MediaTrack'
import { INITIAL_ZOOM, useMediaLane } from '../../Components/VideoEditor/Editors/components/MediaLane/utils'
import { actions, selectors, VideoEditorState } from '../../Components/VideoEditor/VideoEditorSlice'
import ArtPlayer from '../../Components/VideoEditor/Editors/components/ArtPlayer'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/Editors/utils/useDebouncedResizeObserver'
import EditorTabs from '../../Components/VideoEditor/EditorTabs'
import { solutionTabs } from '../../Components/VideoEditor/Tabs'
import { Video } from '../../Components/VideoPlayer/VideoPlayerWrapper'
import ResultsFilter from './Components/Filters/ResultsFilter'
import SolutionFilter from './Components/Filters/SolutionFilter'
import { ComponentId } from '../ExercisePhaseApp/Components/Config/ConfigSlice'

export type SolutionByTeam = {
    teamCreator: string
    teamMembers: Array<string>
    solution: VideoListsState
    visible: boolean
    cutVideo?: Video
}

export type SolutionFilterType = {
    id: ComponentId
    label: ComponentId
    visible: boolean
}

type OwnProps = {
    solutions: Array<SolutionByTeam>
    videos: Array<Video>
    availableComponents: Array<ComponentId>
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

const SolutionsApp: React.FC<ReadOnlyExercisePhaseProps> = (props: ReadOnlyExercisePhaseProps) => {
    // react-aria-modal watches a container element for aria-modal nodes and
    // hides the rest of the dom from screen readers with aria-hidden when one is open.
    watchModals()

    const $container: React.RefObject<HTMLDivElement> = useRef(null)
    const [renderConfig, setRender] = useState<RenderConfig>(initialRender)

    const availableTabs = Object.values(solutionTabs)
    const [activeTabId, setActiveTabId] = useState<TabsTypesEnum>(availableTabs[0].id)

    const firstVideo = props.videos[0]
    const videoDuration: number = firstVideo ? parseFloat(firstVideo.duration) : 5 // duration in seconds
    const currentTime = props.playerSyncPlayPosition

    let { width, height } = useDebouncedResizeObserver($container, 500)
    // workaround to avoid height of 0 at intial render
    if (height === 0) {
        height = 400
    }

    const { getDurationForRenderConfig, getRenderConfigForZoom } = useMediaLane({
        setRender,
        $container,
        renderConfig,
        currentTime,
        videoDuration,
    })

    initialRender.duration = getDurationForRenderConfig(INITIAL_ZOOM)
    initialRender.gridNum = initialRender.duration * 10 + initialRender.padding * 2
    initialRender.gridGap = width / initialRender.gridNum

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

    const firstVideoUrl = firstVideo?.url?.hls || ''
    const subtitleUrl = firstVideo?.url?.vtt || undefined
    const artPlayerOptions = {
        videoUrl: firstVideoUrl,
        subtitleUrl,
        uploadDialog: false,
        translationLanguage: 'en',
    }

    // Run only once
    useEffect(() => {
        setVisibleSolutions(
            props.solutions.map((solutionsEntry: SolutionByTeam) => {
                solutionsEntry.visible = true
                return solutionsEntry
            })
        )

        setVisibleSolutionFilters(
            props.availableComponents.map((componentId: ComponentId) => {
                return {
                    id: componentId,
                    label: componentId, // TODO translate
                    visible: true,
                }
            })
        )
    }, [])

    const [visibleSolutions, setVisibleSolutions] = useState<Array<SolutionByTeam>>([])
    const [visibleSolutionFilters, setVisibleSolutionFilters] = useState<Array<SolutionFilterType>>([])

    let tabContent = null
    switch (activeTabId) {
        case TabsTypesEnum.SOLUTIONS:
            tabContent = <ResultsFilter solutions={visibleSolutions} setVisibleSolutions={setVisibleSolutions} />
            break
        case TabsTypesEnum.SOLUTION_FILTERS:
            tabContent = (
                <SolutionFilter
                    solutionFilters={visibleSolutionFilters}
                    setVisibleSolutionFilters={setVisibleSolutionFilters}
                />
            )
            break
        default:
    }

    return (
        <OverlayProvider className={'exercise-phase__inner solutions-container'}>
            <div className={'exercise-phase__content'} ref={$container}>
                <div className={'video-editor__main'} style={{ height: height * 0.4 }}>
                    <div className={'video-editor__section video-editor__left'}>
                        <ArtPlayer containerHeight={height * 0.4 - 40} options={artPlayerOptions} />
                    </div>
                    <div className={'video-editor__section video-editor__right'}>
                        <header className={'video-editor__section-header'}>
                            <EditorTabs
                                tabs={availableTabs}
                                activeTabId={activeTabId}
                                setActiveTabId={setActiveTabId}
                            />
                        </header>
                        <div className={'video-editor__section-content'}>{tabContent}</div>
                    </div>
                </div>
                <div className={'solutions'} style={{ height: height * 0.6 }}>
                    <Toolbar
                        zoomHandler={handleZoom}
                        videoDuration={videoDuration}
                        renderConfig={renderConfig}
                        handleTimeLineAction={updateCurrentTime}
                    />
                    <Teams
                        solutions={visibleSolutions}
                        visibleSolutionFilters={visibleSolutionFilters}
                        renderConfig={renderConfig}
                        updateCurrentTime={updateCurrentTime}
                    />
                </div>
            </div>
        </OverlayProvider>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(SolutionsApp)
