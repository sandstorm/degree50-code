import React, { useCallback, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import ArtPlayer from '../components/ArtPlayer'
import MediaLane from '../components/MediaLane'
import { MediaItem } from '../components/types'
import { solveConflicts } from '../helpers'
import { secondToTime, timeToSecond } from '../utils'
import { useMediaItemHandling } from '../utils/hooks'
import Storage from '../utils/storage'
import VideoCodes from './VideoCodes'
import { VideoCode } from 'Components/VideoEditor/VideoListsSlice'
import { VideoCodePrototype } from './types'
import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'

const storage = new Storage()

type OwnProps = {
    height: number
    headerContent: React.ReactNode
    videos: Array<Video>
    itemUpdateCallback: () => void
    itemUpdateCondition: boolean
    videoCodesPool: VideoCodePrototype[]
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        videoCodes: selectors.lists.selectVideoEditorLists(state).videoCodes,
        customVideoCodesPool: selectors.lists.selectVideoEditorLists(state).customVideoCodesPool,
        playerSyncPlayPosition: selectors.player.selectSyncPlayPosition(state),
    }
}

const mapDispatchToProps = {
    setVideoCodes: actions.lists.setVideoCodes,
    setCustomVideoCodesPool: actions.lists.setCustomVideoCodesPool,
    setPlayPosition: actions.player.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoCodeEditor = (props: Props) => {
    const height = props.height
    const [containerHeight, setContainerHeight] = useState(0)

    const measuredContainerRef = useCallback((node) => {
        if (node !== null) {
            setContainerHeight(node.getBoundingClientRect().height)
        }
    }, [])

    // All videoCodes
    const mediaItems = solveConflicts(
        props.videoCodes.map(
            (videoCode) =>
                new MediaItem({
                    start: videoCode.start,
                    end: videoCode.end,
                    text: videoCode.text,
                    memo: videoCode.memo,
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
        updateCondition: props.itemUpdateCondition,
        mediaItems,
        setMediaItems: props.setVideoCodes,
        updateCallback: props.itemUpdateCallback,
        storage,
    })

    // All options
    const firstVideo = props.videos[0]
    const firstVideoDuration = firstVideo ? parseFloat(firstVideo.duration) : 5 // duration in seconds
    const firstVideoUrl = firstVideo?.url?.hls || ''
    const subtitleUrl = firstVideo?.url?.vtt || undefined

    const artPlayerOptions = {
        videoUrl: firstVideoUrl,
        subtitleUrl,
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
                memo: videoCode.memo,
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
        props.itemUpdateCallback()
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
        props.itemUpdateCallback()
    }

    return (
        <React.Fragment>
            <div ref={measuredContainerRef} className="video-editor__main" style={{ height: height - 200 }}>
                <div className="video-editor__section video-editor__left">
                    <ArtPlayer
                        containerHeight={containerHeight}
                        options={artPlayerOptions}
                        currentTimeCallback={setCurrentTimeForMediaItems}
                    />
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
                videoDuration={firstVideoDuration}
                showTextInMediaItems={false}
            />
            <ToastContainer />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoCodeEditor)
