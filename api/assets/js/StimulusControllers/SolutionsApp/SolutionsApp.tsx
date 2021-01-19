import React, { useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { VideoListsState } from '../../Components/VideoEditor/VideoListsSlice'
import { Teams } from './Components/Teams/Teams'
import { TabsTypesEnum } from '../../types'
import { OverlayProvider } from '@react-aria/overlays'
import { watchModals } from '@react-aria/aria-modal-polyfill'
import Toolbar from '../../Components/VideoEditor/Editors/components/MediaLane/Toolbar'
import { useMediaLane } from '../../Components/VideoEditor/Editors/components/MediaLane/useMediaLane'
import { actions, selectors, VideoEditorState } from '../../Components/VideoEditor/VideoEditorSlice'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/Editors/utils/useDebouncedResizeObserver'
import EditorTabs from '../../Components/VideoEditor/EditorTabs'
import { solutionTabs } from '../../Components/VideoEditor/Tabs'
import { Video } from '../../Components/VideoPlayer/VideoPlayerWrapper'
import ResultsFilter from './Components/Filters/ResultsFilter'
import SolutionFilter from './Components/Filters/SolutionFilter'
import { ComponentId } from '../ExercisePhaseApp/Components/Config/ConfigSlice'
import { RenderConfig } from '../../Components/VideoEditor/Editors/components/MediaLane/MediaTrack'
import { initialRenderConfig } from '../../Components/VideoEditor/MediaLaneRenderConfigSlice'
import { translate } from 'react-i18nify'
import VideoPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'

export type SolutionByTeam = {
    teamCreator: string
    teamMembers: Array<string>
    solution: VideoListsState
    visible: boolean
    cutVideo?: Video
}

export type SolutionFilterType = {
    id: ComponentId
    label: string
    visible: boolean
}

const renderTabContent = ({
    activeTabId,
    visibleSolutions,
    setVisibleSolutions,
    visibleSolutionFilters,
    setVisibleSolutionFilters,
}: {
    activeTabId: TabsTypesEnum
    visibleSolutions: SolutionByTeam[]
    setVisibleSolutions: (solutions: SolutionByTeam[]) => void
    visibleSolutionFilters: SolutionFilterType[]
    setVisibleSolutionFilters: (filters: SolutionFilterType[]) => void
}) => {
    switch (activeTabId) {
        case TabsTypesEnum.SOLUTIONS: {
            return <ResultsFilter solutions={visibleSolutions} setVisibleSolutions={setVisibleSolutions} />
        }
        case TabsTypesEnum.SOLUTION_FILTERS: {
            return (
                <SolutionFilter
                    solutionFilters={visibleSolutionFilters}
                    setVisibleSolutionFilters={setVisibleSolutionFilters}
                />
            )
        }
        default: {
            return null
        }
    }
}

type OwnProps = {
    solutions: Array<SolutionByTeam>
    videos: Array<Video>
    availableComponents: Array<ComponentId>
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

    const [renderConfig, setRenderConfig] = useState<RenderConfig>(initialRenderConfig)

    const $container: React.RefObject<HTMLDivElement> = useRef(null)

    const availableTabs = Object.values(solutionTabs)
    const [activeTabId, setActiveTabId] = useState<TabsTypesEnum>(availableTabs[0].id)

    const firstVideo = props.videos[0]
    const videoDuration: number = firstVideo ? firstVideo.duration : 5 // duration in seconds
    const currentTime = props.playerSyncPlayPosition

    const videoComponents = Object.values(TabsTypesEnum).filter((tabType) =>
        props.availableComponents.includes(tabType)
    )

    const { height } = useDebouncedResizeObserver($container, 500)
    const heightOrDefault = height === 0 ? 400 : height

    const { handleZoom, handleLaneClick } = useMediaLane({
        $container,
        currentTime,
        videoDuration,
        laneClickCallback: props.setPlayPosition,
        renderConfig,
        setRenderConfig,
    })

    const updateCurrentTime = handleLaneClick

    // Run only once
    useEffect(() => {
        setVisibleSolutions(
            props.solutions.map((solutionsEntry: SolutionByTeam) => {
                return {
                    ...solutionsEntry,
                    visible: true,
                }
            })
        )

        setVisibleSolutionFilters(
            videoComponents.map((componentId: ComponentId) => {
                return {
                    id: componentId,
                    label: translate(componentId),
                    visible: true,
                }
            })
        )
    }, [])

    const [visibleSolutions, setVisibleSolutions] = useState<Array<SolutionByTeam>>([])
    const [visibleSolutionFilters, setVisibleSolutionFilters] = useState<Array<SolutionFilterType>>([])

    return (
        <OverlayProvider className={'exercise-phase__inner solutions-container'}>
            <div className={'exercise-phase__content'} ref={$container}>
                <div className={'video-editor__main'} style={{ height: heightOrDefault * 0.4 }}>
                    <div className={'video-editor__section video-editor__left'}>
                        <VideoPlayer
                            videoJsOptions={{
                                autoplay: false,
                                controls: true,
                                sources: [
                                    {
                                        src: firstVideo?.url?.hls || '',
                                    },
                                ],
                            }}
                            videoMap={firstVideo}
                        />
                    </div>
                    <div className={'video-editor__section video-editor__right'}>
                        <header className={'video-editor__section-header'}>
                            <EditorTabs
                                tabs={availableTabs}
                                activeTabId={activeTabId}
                                setActiveTabId={setActiveTabId}
                            />
                        </header>
                        <div className={'video-editor__section-content'}>
                            {renderTabContent({
                                activeTabId,
                                visibleSolutions,
                                setVisibleSolutions,
                                visibleSolutionFilters,
                                setVisibleSolutionFilters,
                            })}
                        </div>
                    </div>
                </div>
                <div className={'solutions'} style={{ height: heightOrDefault * 0.6 }}>
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
