import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import { setVideoCodes, setCustomVideoCodesPool, selectSolution, VideoCode } from '../../../Solution/SolutionSlice'
import { syncSolutionAction } from '../../../Solution/SolutionSaga'
import { selectConfig, selectReadOnly, selectUserId, VideoCodePrototype } from '../../../Config/ConfigSlice'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { selectCurrentEditorId } from '../../../Presence/CurrentEditorSlice'

import MediaLane from '../components/MediaLane'
import PlayerComponent from '../components/ArtPlayer'
import VideoCodes from './VideoCodes'
import { MediaItem } from '../components/types'
import { secondToTime, timeToSecond } from '../utils'
import { useMediaItemHandling } from '../utils/hooks'
import Storage from '../utils/storage'
import { selectors, actions } from '../../PlayerSlice'
import { solveConflicts } from './helpers'

const storage = new Storage()

type OwnProps = {
    height: number
    headerContent: React.ReactNode
    videos: Array<{ url: { hls: string; mp4: string } }>
}

const mapStateToProps = (state: AppState) => {
    return {
        userId: selectUserId(state),
        readOnly: selectReadOnly(state),
        currentEditorId: selectCurrentEditorId(state),
        videoCodes: selectSolution(state).videoCodes,
        videoCodesPool: selectConfig(state).videoCodesPool,
        customVideoCodesPool: selectSolution(state).customVideoCodesPool,
        playerSyncPlayPosition: selectors.selectSyncPlayPosition(state),
    }
}

const mapDispatchToProps = {
    setVideoCodes,
    setCustomVideoCodesPool,
    syncSolutionAction,
    setPlayPosition: actions.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoCodeEditor = (props: Props) => {
    const height = props.height

    // All videoCodes
    const mediaItems = solveConflicts(
        props.videoCodes.map(
            (videoCode) =>
                new MediaItem({
                    start: videoCode.start,
                    end: videoCode.end,
                    text: videoCode.text,
                    color: videoCode.color,
                    originalData: videoCode,
                    lane: 0,
                })
        )
    )

    // pool of available video-codes
    const videoCodesPool = props.customVideoCodesPool.length > 0 ? props.customVideoCodesPool : props.videoCodesPool

    const amountOfLanes = Math.max.apply(
        Math,
        mediaItems.map((item: MediaItem<VideoCode>) => {
            return item.lane
        })
    )

    const {
        setCurrentTimeForMediaItems,
        updateMediaItems,
        updateMediaItem,
        copyMediaItems,
        checkMediaItem,
        removeMediaItem,
    } = useMediaItemHandling<VideoCode>({
        userId: props.userId,
        currentEditorId: props.currentEditorId,
        mediaItems,
        readOnly: props.readOnly,
        setMediaItems: props.setVideoCodes,
        updateCallback: props.syncSolutionAction,
        storage,
    })

    // All options
    const firstVideoUrl = props.videos[0] ? props.videos[0].url.hls : ''

    const artPlayerOptions = {
        videoUrl: firstVideoUrl,
        uploadDialog: false,
        translationLanguage: 'en',
    }

    const addVideoCode = useCallback(
        (videoCode) => {
            const index = mediaItems.length
            const videoCodes = copyMediaItems()
            const previous = videoCodes[index - 1]
            const start = previous ? secondToTime(previous.endTime + 0.1) : '00:00:00.001'
            const end = previous ? secondToTime(previous.endTime + 1.1) : '00:00:01.001'
            const code = new MediaItem({
                start,
                end,
                text: videoCode.name,
                color: videoCode.color,
                originalData: videoCode,
                lane: 0,
            })

            props.setPlayPosition(timeToSecond(start))

            videoCodes.splice(index, 0, code)
            updateMediaItems(videoCodes)
        },
        [copyMediaItems, updateMediaItems]
    )

    const createVideoCode = (newVideoCode: VideoCodePrototype, parentVideoCode?: VideoCodePrototype) => {
        let currentVideoCodes = [...videoCodesPool]
        if (parentVideoCode) {
            currentVideoCodes = currentVideoCodes.map((item: VideoCodePrototype) => {
                if (item.id === parentVideoCode.id) {
                    return {
                        ...item,
                        videoCodes: [...item.videoCodes, newVideoCode],
                    }
                } else {
                    return item
                }
            })
        } else {
            currentVideoCodes.push(newVideoCode)
        }
        props.setCustomVideoCodesPool(currentVideoCodes)
        props.syncSolutionAction()
    }

    const removeVideoCode = (videoCodeToDelete: VideoCodePrototype) => {
        const newVideoCodes = videoCodesPool
            .map((videoCode: VideoCodePrototype) => {
                return {
                    ...videoCode,
                    videoCodes: videoCode.videoCodes.filter((childVideoCode: VideoCodePrototype) => {
                        return childVideoCode.id !== videoCodeToDelete.id
                    }),
                }
            })
            .filter((videoCode: VideoCodePrototype) => {
                return videoCode.id !== videoCodeToDelete.id
            })

        props.setCustomVideoCodesPool(newVideoCodes)
        props.syncSolutionAction()
    }

    return (
        <React.Fragment>
            <div className="video-editor__main" style={{ height: height - 200 }}>
                <div className="video-editor__section video-editor__left">
                    <PlayerComponent options={artPlayerOptions} currentTimeCallback={setCurrentTimeForMediaItems} />
                </div>
                <div className="video-editor__section video-editor__right">
                    <header className="video-editor__section-header">{props.headerContent}</header>
                    <div className="video-editor__section-content">
                        <VideoCodes
                            addVideoCode={addVideoCode}
                            createVideoCode={createVideoCode}
                            removeVideoCode={removeVideoCode}
                            videoCodesPool={videoCodesPool}
                        />
                    </div>
                </div>
            </div>

            <MediaLane
                currentTime={props.playerSyncPlayPosition}
                mediaItems={mediaItems}
                updateMediaItem={updateMediaItem}
                removeMediaItem={removeMediaItem}
                setPlayPosition={props.setPlayPosition}
                checkMediaItem={checkMediaItem}
                amountOfLanes={amountOfLanes}
            />
            <ToastContainer />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoCodeEditor)
