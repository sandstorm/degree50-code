import React, { useCallback } from 'react'
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
import { MEDIA_LANE_HEIGHT } from '../components/MediaLane/useMediaLane'

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
        mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
    }
}

const mapDispatchToProps = {
    setVideoCodes: actions.lists.setVideoCodes,
    setCustomVideoCodesPool: actions.lists.setCustomVideoCodesPool,
    setPlayPosition: actions.player.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoCodeEditor = (props: Props) => {
    const height = props.height - MEDIA_LANE_HEIGHT

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
                    idFromPrototype: videoCode.idFromPrototype,
                })
        )
    )

    // pool of available video-codes
    const videoCodesPool = props.customVideoCodesPool.length > 0 ? props.customVideoCodesPool : props.videoCodesPool

    // TODO we have multiple duplicates of this function -> extract into helper
    const amountOfLanes = Math.max(
        0,
        ...mediaItems.map((item: MediaItem<VideoCode>) => {
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
        currentTime: props.mediaLaneRenderConfig.currentTime,
        updateCondition: props.itemUpdateCondition,
        mediaItems,
        setMediaItems: props.setVideoCodes,
        timelineDuration: props.mediaLaneRenderConfig.duration,
        updateCallback: props.itemUpdateCallback,
        storage,
    })

    // All options
    const firstVideo = props.videos[0]
    const firstVideoDuration = firstVideo ? parseFloat(firstVideo.duration) : 5 // duration in seconds

    const artPlayerOptions = {
        videoUrl: firstVideo?.url?.hls || '',
        subtitleUrl: firstVideo?.url?.vtt || '',
        uploadDialog: false,
        translationLanguage: 'en',
    }

    const addVideoCode = useCallback(
        (videoCode: VideoCodePrototype) => {
            const index = mediaItems.length
            const videoCodes = copyMediaItems()

            const { currentTime, duration } = props.mediaLaneRenderConfig

            const start = secondToTime(currentTime)
            const end = secondToTime(Math.ceil(currentTime + duration / 10))

            const mediaItem = {
                start,
                end,
                text: videoCode.name,
                memo: '',
                color: videoCode.color,
                idFromPrototype: videoCode.id,
            }
            const code: MediaItem<VideoCode> = new MediaItem({
                ...mediaItem,
                originalData: mediaItem,
                lane: 0,
            })

            props.setPlayPosition(timeToSecond(start))

            videoCodes.splice(index, 0, code)
            updateMediaItems(videoCodes)
        },
        [copyMediaItems, updateMediaItems]
    )

    const createVideoCode = (newVideoCode: VideoCodePrototype, parentVideoCode?: VideoCodePrototype) => {
        const updatedVideoCodes = parentVideoCode
            ? videoCodesPool.map((item) => {
                  if (item.id === parentVideoCode.id) {
                      return { ...item, videoCodes: [...item.videoCodes, newVideoCode] }
                  } else {
                      return item
                  }
              })
            : [...videoCodesPool, newVideoCode]

        props.setCustomVideoCodesPool(updatedVideoCodes)
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
            <div className="video-editor__main" style={{ height: height }}>
                <div className="video-editor__section video-editor__left">
                    <ArtPlayer
                        containerHeight={height - 40}
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
