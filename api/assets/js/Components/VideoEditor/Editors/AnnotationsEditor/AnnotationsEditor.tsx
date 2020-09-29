import React, { useCallback, useState } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import MediaLane, { MEDIA_LANE_HEIGHT } from '../components/MediaLane'
import ArtPlayer from '../components/ArtPlayer'
import MediaItemList from '../components/MediaItemList/MediaItemList'
import Storage from '../utils/storage'

import { useMediaItemHandling } from '../utils/hooks'
import { MediaItem } from '../components/types'
import { solveConflicts } from '../helpers'
import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import { Annotation } from 'Components/VideoEditor/VideoListsSlice'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import AddItemButton from '../components/MediaItemList/AddItemButton'

const storage = new Storage()

type OwnProps = {
    height: number
    headerContent: React.ReactNode
    videos: Array<Video>
    itemUpdateCallback: () => void
    itemUpdateCondition: boolean
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        annotations: selectors.lists.selectVideoEditorLists(state).annotations,
        playerSyncPlayPosition: selectors.player.selectSyncPlayPosition(state),
    }
}

const mapDispatchToProps = {
    setAnnotations: actions.lists.setAnnotations,
    setPlayPosition: actions.player.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const AnnotationsEditor = (props: Props) => {
    const height = props.height - MEDIA_LANE_HEIGHT

    // All annotations
    const itemsFromAnnotations = props.annotations.map(
        (sub) =>
            new MediaItem({
                start: sub.start,
                end: sub.end,
                text: sub.text,
                memo: sub.memo,
                originalData: sub,
                lane: 0,
                idFromPrototype: null,
            })
    )

    const mediaItems: MediaItem<Annotation>[] = solveConflicts(itemsFromAnnotations)

    // All options
    const firstVideo = props.videos[0]
    const firstVideoDuration = firstVideo ? parseFloat(firstVideo.duration) : 5 // duration in seconds

    const artPlayerOptions = {
        videoUrl: firstVideo?.url?.hls || '',
        subtitleUrl: firstVideo?.url?.vtt || '',
        uploadDialog: false,
        translationLanguage: 'en',
    }

    const {
        currentIndex,

        setCurrentTimeForMediaItems,
        appendMediaItem,
        removeMediaItem,
        updateMediaItem,
    } = useMediaItemHandling<Annotation>({
        updateCondition: props.itemUpdateCondition,
        mediaItems,
        setMediaItems: props.setAnnotations,
        updateCallback: props.itemUpdateCallback,
        storage,
    })

    const checkMediaItem = useCallback(() => {
        // false means no conflict => item is legal
        // true means conflict => item is illegal
        //
        // WHY: this hard coded check?
        // We currently do not yet have defined conditions under which annotations
        // are considered to be illegal.
        // Because they may also overlap etc., we do not use the checkMediaItem() function
        // provided by useMediaItemHandling().
        return false
    }, [])

    const amountOfLanes = Math.max.apply(
        Math,
        mediaItems.map((item: MediaItem<any>) => {
            return item.lane
        })
    )

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
                        <MediaItemList
                            mediaItems={mediaItems}
                            currentIndex={currentIndex}
                            updateMediaItem={updateMediaItem}
                            removeMediaItem={removeMediaItem}
                            checkMediaItem={checkMediaItem}
                        >
                            <AddItemButton addMediaItemCallback={appendMediaItem}>
                                <i className={'fas fa-plus'} /> Neue Annotation
                            </AddItemButton>
                        </MediaItemList>
                    </div>
                </div>
            </div>

            <MediaLane
                currentTime={props.playerSyncPlayPosition}
                mediaItems={mediaItems}
                updateMediaItem={updateMediaItem}
                setPlayPosition={props.setPlayPosition}
                amountOfLanes={amountOfLanes}
                checkMediaItem={checkMediaItem}
                removeMediaItem={removeMediaItem}
                videoDuration={firstVideoDuration}
            />
            <ToastContainer />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnotationsEditor)
