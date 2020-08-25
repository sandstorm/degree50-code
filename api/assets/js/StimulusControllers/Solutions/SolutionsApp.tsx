import React, { useRef, useState, useCallback, useEffect } from 'react'
import VideoPlayerWrapper, { Video } from '../../Components/VideoPlayer/VideoPlayerWrapper'
import { VideoEditorState } from '../../Components/VideoEditor/VideoEditorSlice'
import { Teams } from './Components/Teams/Teams'
import { TabsTypesEnum } from '../../types'

export type SolutionByTeam = {
    teamCreator: string
    teamMembers: Array<string>
    solution: VideoEditorState
}

type ReadOnlyExercisePhaseProps = {
    solutions: Array<SolutionByTeam>
    videos: Array<Video>
}

export const SolutionsApp: React.FC<ReadOnlyExercisePhaseProps> = ({ solutions, videos }) => {
    const [activeTab, setActiveTab] = useState<TabsTypesEnum>(TabsTypesEnum.VIDEO_ANNOTATIONS)
    const [currentTime, setCurrentTime] = useState(0)
    const [currentZoom, setCurrentZoom] = useState(25)
    const [player, setPlayer] = useState(null)

    const videoNodeRef: React.RefObject<HTMLVideoElement> = useRef(null)

    const updateActiveTab = useCallback(
        (event) => {
            setActiveTab(event.target.value)
        },
        [setActiveTab]
    )

    useEffect(() => {
        if (videoNodeRef.current) {
            // TODO set player to get the current duration for better ux, like better zooming
            //setPlayer(videoNodeRef.current)
        }
    }, [videoNodeRef.current?.duration])

    const updateCurrentTime = useCallback(
        (time: number) => {
            if (videoNodeRef.current) {
                videoNodeRef.current.currentTime = time
            }
        },
        [setCurrentTime]
    )

    const updateCurrentZoom = useCallback(
        (event) => {
            setCurrentZoom(parseInt(event.target.value))
        },
        [setCurrentZoom]
    )

    const firstVideo = videos[0]
    const firstVideoDuration = firstVideo ? parseFloat(firstVideo.duration) : 5 // duration in seconds

    return (
        <div className={'exercise-phase__inner'}>
            <div className={'exercise-phase__content'}>
                <div className={'solutions'}>
                    <VideoPlayerWrapper
                        videos={videos}
                        updateCurrentTime={setCurrentTime}
                        videoNodeRef={videoNodeRef}
                    />
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
                            </select>
                        </div>
                        <div className={'form-group'}>
                            <label htmlFor={'zoom'}>Zoom</label>
                            <input
                                type="range"
                                min="1"
                                max="100"
                                step="1"
                                className="form-control-range"
                                id="zoom"
                                value={currentZoom}
                                onChange={updateCurrentZoom}
                            />
                        </div>
                    </form>

                    <Teams
                        solutions={solutions}
                        activeTab={activeTab}
                        currentTime={currentTime}
                        currentZoom={currentZoom}
                        updateCurrentTime={updateCurrentTime}
                        videoDuration={firstVideoDuration}
                    />
                </div>
            </div>
        </div>
    )
}
