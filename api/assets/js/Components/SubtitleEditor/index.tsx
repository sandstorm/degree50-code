import React from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import MediaLane from './MediaLaneWithToolbar'
import MediaItemList from './MediaItemList/MediaItemList'

import { useMediaItemHandling } from '../VideoEditor/utils/useMediaItemHandling'
import { MediaItem } from '../VideoEditor/types'
import { vttToUrlUseWorker } from '../VideoEditor/utils/subtitleUtils'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import AddItemButton from './MediaItemList/AddItemButton'
import { MEDIA_LANE_HEIGHT } from '../VideoEditor/components/MediaLane/useMediaLane'
import VideoPlayer from 'Components/VideoPlayer/ConnectedVideoJSPlayer'
import {
    Subtitle,
    SubtitlesStateSlice,
    selectors as subtitleSelectors,
    actions as subtitleActions,
} from './SubtitlesSlice'
import { actions, PlayerStateSlice, selectors as playerSelectors } from 'Components/VideoEditor/PlayerSlice'
import {
    MediaLaneRenderConfigState,
    selectors as mediaLaneRenderConfigSelectors,
} from 'Components/VideoEditor/MediaLaneRenderConfigSlice'

const worker = new Worker(vttToUrlUseWorker())

type OwnProps = {
    height: number
    videos: Array<Video>
    itemUpdateCallback: () => void
    itemUpdateCondition: boolean
}

const mapStateToProps = (
    state: SubtitlesStateSlice & PlayerStateSlice & { videoEditor: MediaLaneRenderConfigState }
) => {
    return {
        subtitles: subtitleSelectors.selectDenormalizedSubtitles(state),
        playerSyncPlayPosition: playerSelectors.selectSyncPlayPosition(state),
        mediaLaneRenderConfig: mediaLaneRenderConfigSelectors.selectRenderConfig(state.videoEditor),
    }
}

const mapDispatchToProps = {
    setSubtitles: subtitleActions.set,
    setPlayPosition: actions.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const SubtitleEditor = ({
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
