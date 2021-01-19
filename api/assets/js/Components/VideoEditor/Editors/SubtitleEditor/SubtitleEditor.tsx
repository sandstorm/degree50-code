import React from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import MediaLane from '../components/MediaLane'
import MediaItemList from '../components/MediaItemList/MediaItemList'

import { useMediaItemHandling } from '../utils/useMediaItemHandling'
import { MediaItem } from '../components/types'
import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import { Subtitle } from 'Components/VideoEditor/VideoListsSlice'
import { vttToUrlUseWorker } from '../utils/subtitleUtils'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import AddItemButton from '../components/MediaItemList/AddItemButton'
import { MEDIA_LANE_HEIGHT } from '../components/MediaLane/useMediaLane'
import VideoPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'

const worker = new Worker(vttToUrlUseWorker())

type OwnProps = {
    height: number
    headerContent: React.ReactNode
    videos: Array<Video>
    itemUpdateCallback: () => void
    itemUpdateCondition: boolean
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        subtitles: selectors.lists.selectVideoEditorLists(state).subtitles,
        playerSyncPlayPosition: selectors.player.selectSyncPlayPosition(state),
        mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
    }
}

const mapDispatchToProps = {
    setSubtitles: actions.lists.setSubtitles,
    setPlayPosition: actions.player.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const SubtitleEditor = ({
    headerContent,
    height,
    itemUpdateCallback,
    itemUpdateCondition,
    mediaLaneRenderConfig,
    playerSyncPlayPosition,
    setPlayPosition,
    setSubtitles,
    subtitles,
    videos,
}: Props) => {
    const containerHeight = height - MEDIA_LANE_HEIGHT

    // All annotations
    const mediaItems: MediaItem<Subtitle>[] = subtitles.map(
        (sub) =>
            new MediaItem({
                start: sub.start,
                end: sub.end,
                text: sub.text,
                memo: sub.memo,
                originalData: sub,
                lane: 0,
                idFromPrototype: sub.idFromPrototype,
            })
    )

    // All options
    const firstVideo = videos[0]
    const firstVideoDuration = firstVideo ? firstVideo.duration : 5 // duration in seconds

    const {
        currentIndex,

        appendMediaItem,
        removeMediaItem,
        updateMediaItem,
        checkMediaItem,
    } = useMediaItemHandling<Subtitle>({
        currentTime: mediaLaneRenderConfig.currentTime,
        mediaItems,
        setMediaItems: setSubtitles,
        timelineDuration: mediaLaneRenderConfig.duration,
        updateCallback: itemUpdateCallback,
        updateCondition: itemUpdateCondition,
        worker,
    })

    const amountOfLanes = 1

    return (
        <React.Fragment>
            <div className="video-editor__main" style={{ height: containerHeight }}>
                <div className="video-editor__section video-editor__left">
                    <VideoPlayer
                        worker={worker}
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
                <div className="video-editor__section video-editor__right">
                    <header className="video-editor__section-header">{headerContent}</header>

                    <div className="video-editor__section-content">
                        <MediaItemList
                            mediaItems={mediaItems}
                            currentIndex={currentIndex}
                            updateMediaItem={updateMediaItem}
                            removeMediaItem={removeMediaItem}
                            checkMediaItem={checkMediaItem}
                        >
                            <AddItemButton addMediaItemCallback={appendMediaItem}>
                                <i className={'fas fa-plus'} /> Neuer Untertitel
                            </AddItemButton>
                        </MediaItemList>
                    </div>
                </div>
            </div>

            <MediaLane
                currentTime={playerSyncPlayPosition}
                mediaItems={mediaItems}
                updateMediaItem={updateMediaItem}
                setPlayPosition={setPlayPosition}
                amountOfLanes={amountOfLanes}
                checkMediaItem={checkMediaItem}
                removeMediaItem={removeMediaItem}
                videoDuration={firstVideoDuration}
            />
            <ToastContainer />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(SubtitleEditor))
