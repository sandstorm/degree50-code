import React, { useState } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { Translate, translate } from 'react-i18nify'

import VideoContextPlayer from './VideoContextPlayer'
import MediaLane from '../components/MediaLane'

import Storage from '../utils/storage'
import MediaItemList from '../components/MediaItemList/MediaItemList'
import {
    getMediaItemFromCut,
    transformCutListToMediaItemsForCutContext,
    useCuttingMediaItemHandling,
    useVolume,
} from './util'
import { d2t } from 'duration-time-conversion'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import { Video } from 'Components/VideoPlayer/VideoPlayerWrapper'
import EditorTabs from '../../EditorTabs'
import { videoEditorPlayerTabs } from '../../Tabs'
import { TabsTypesEnum } from '../../../../types'
import AddItemButton from '../components/MediaItemList/AddItemButton'
import ReadonlyMediaLaneWithToolbar from '../components/MediaLane/ReadonlyMediaLaneWithToolbar'
import { MEDIA_LANE_HEIGHT } from '../components/MediaLane/useMediaLane'

const storage = new Storage()

type OwnProps = {
    height: number
    headerContent: React.ReactNode
    videos: Array<Video>
    itemUpdateCallback: () => void
    itemUpdateCondition: boolean
}

const mapStateToProps = (state: VideoEditorState) => ({
    playerSyncPlayPosition: selectors.player.selectSyncPlayPosition(state),
    cutList: selectors.lists.selectVideoEditorLists(state).cutList,
    previousSolutions: selectors.config.selectConfig(state.videoEditor).previousSolutions,
    mediaLaneRenderConfig: selectors.mediaLaneRenderConfig.selectRenderConfig(state.videoEditor),
})

const mapDispatchToProps = {
    setPlayPosition: actions.player.setPlayPosition,
    setPause: actions.player.setPause,
    setCutList: actions.lists.setCutList,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const getCutForCompleteVideo = (video: Video) => ({
    url: video.url.mp4 ?? '',
    start: '00:00:00.000',
    end: d2t(parseFloat(video.duration).toFixed(3)),
    offset: 0,
    playbackRate: 1,
    text: video.name,
    memo: '',
    color: null,
    idFromPrototype: null,
})

// false means no conflict => item is legal
// true means conflict => item is illegal
//
// WHY: this hard coded check?
// We currently do not yet have defined conditions under which annotations
// are considered to be illegal.
// Because they may also overlap etc., we do not use the checkMediaItem() function
// provided by useMediaItemHandling().
const checkMediaItem = () => false

const CuttingEditor = ({
    setCutList,
    height,
    headerContent,
    playerSyncPlayPosition,
    setPlayPosition,
    setPause,
    cutList,
    videos,
    itemUpdateCallback,
    itemUpdateCondition,
    previousSolutions,
    mediaLaneRenderConfig,
}: Props) => {
    const { volume, handleVolumeChange } = useVolume()
    const [activeContext, setActiveContext] = useState<TabsTypesEnum>(TabsTypesEnum.ORIGINAL_VIDEO)
    const handleActiveContextSwitch = (context: TabsTypesEnum) => {
        setPause(true)
        // FIXME: Somehow does not always work
        setPlayPosition(0)
        setActiveContext(context)
    }
    const containerHeight = height - MEDIA_LANE_HEIGHT

    // WHY: hard code source videos to the first video
    const originalVideo = videos[0]
    const [originalVideoCutList] = useState([getCutForCompleteVideo(originalVideo)])
    const originalVideoDuration = parseFloat(originalVideo.duration)

    // WHY:
    // Depending on which context is selected, multile things happen:
    //      context = ORIGINAL_VIDEO:
    //      1. Player shows the original video
    //      2. MediaLane shows each cut in contextual relation to the original video (think: "which part of the video will this cut play")
    //      3. Moving a cut up or down inside the mediaItemList (to the right of the player) WILL affect the video display of the cutlist in CUT_VIDEO context!
    //
    //      context = CUT_VIDEO
    //      1. The cutlist is no being represented in two ways:
    //         * in the mediaItemList to the right
    //         * and inside the mediaLane
    //      2. All cuts made in the context of ORIGINAL_VIDEO are now played in immediate succsession. This is represented inside the mediaLane as well as the mediaItemsList
    //      3. Moving an item up or down inside the mediaItem list determines at what position the cut will be played.
    //      4. The start values from the ORIGINAL_VIDEO cutlist are used as video-offsets for each item
    //
    // Important:
    //    The actual cutlist state (which is part of our Redux store and is being sent to the server) is not altered.
    //    We just use the cutlist for the representation inside the frontend!
    const videoContextCutList = activeContext === TabsTypesEnum.ORIGINAL_VIDEO ? originalVideoCutList : cutList
    const useReadonlyMediaLane = activeContext === TabsTypesEnum.CUT_VIDEO

    // TODO: prevent recalculation if cutList did not change!
    const mediaItems =
        activeContext === TabsTypesEnum.ORIGINAL_VIDEO
            ? cutList.map(getMediaItemFromCut)
            : transformCutListToMediaItemsForCutContext(cutList)

    const {
        appendCut,
        currentIndex,
        handleSplitAtCursor,
        removeMediaItem,
        setCurrentIndex,
        setCurrentTimeForMediaItems,
        updateMediaItem,
    } = useCuttingMediaItemHandling({
        currentTime: mediaLaneRenderConfig.currentTime,
        mediaItems,
        originalVideoUrl: originalVideo.url.mp4,
        playerSyncPlayPosition,
        setCutList,
        storage,
        timelineDuration: mediaLaneRenderConfig.duration,
        updateCallback: itemUpdateCallback,
        updateCondition: itemUpdateCondition,
    })

    // If there is no video, we can't cut any
    // TODO: What needs to happen here?
    if (!originalVideo) {
        return null
    }

    const moveCutUp = (indexToMove: number) => {
        if (indexToMove <= 0) {
            throw new Error('Can not move first item further up')
        }

        setCutList(
            cutList.map((cut, index, all) => {
                if (index === indexToMove - 1) {
                    return all[indexToMove]
                } else if (index === indexToMove) {
                    return all[indexToMove - 1]
                } else {
                    return cut
                }
            })
        )
    }

    const moveCutDown = (indexToMove: number) => {
        if (indexToMove >= mediaItems.length - 1) {
            throw new Error('Can not move last item further down!')
        }

        setCutList(
            cutList.map((cut, index, all) => {
                if (index === indexToMove + 1) {
                    return all[indexToMove]
                } else if (index === indexToMove) {
                    return all[indexToMove + 1]
                } else {
                    return cut
                }
            })
        )
    }

    const toolbarActions = (
        <div className="video-editor-toolbar__item-group">
            <label className={'video-editor-toolbar__item-group-label'}>{translate('context')}: </label>
            <EditorTabs
                tabs={Object.values(videoEditorPlayerTabs)}
                activeTabId={activeContext}
                setActiveTabId={handleActiveContextSwitch}
            />
            <label className={'video-editor-toolbar__item-group-label'}>{translate('cutting')}: </label>
            <div className={'video-editor-toolbar__item'}>
                <button className={'btn btn-outline-primary btn-sm'} onClick={handleSplitAtCursor}>
                    {translate('splitAtCursor')}
                </button>
            </div>
            <div className="video-editor-toolbar__item">
                <label htmlFor={'timeline-volume-handler'}>
                    <Translate value="volume" />
                </label>
                <input
                    name={'timeline-volume-handler'}
                    id={'timeline-volume-handler'}
                    defaultValue={volume}
                    type="range"
                    min="0"
                    max="100"
                    step="10"
                    onChange={handleVolumeChange}
                />
            </div>
        </div>
    )

    return (
        <React.Fragment>
            <div className="video-editor__main" style={{ height: containerHeight }}>
                <div className="video-editor__section video-editor__left">
                    <header className="video-editor__section-header" />
                    <div className="video-editor__section-content">
                        <VideoContextPlayer
                            cutList={videoContextCutList}
                            currentTimeCallback={setCurrentTimeForMediaItems}
                            volume={volume}
                        />
                    </div>
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
                            moveItemUp={moveCutUp}
                            moveItemDown={moveCutDown}
                            setCurrentIndex={setCurrentIndex}
                        >
                            <AddItemButton addMediaItemCallback={appendCut}>
                                <i className={'fas fa-plus'} /> Schnitt hinzufügen
                            </AddItemButton>
                        </MediaItemList>
                    </div>
                </div>
            </div>

            {useReadonlyMediaLane ? (
                <ReadonlyMediaLaneWithToolbar
                    currentTime={playerSyncPlayPosition}
                    mediaItems={mediaItems}
                    setPlayPosition={setPlayPosition}
                    videoDuration={originalVideoDuration}
                    ToolbarActions={toolbarActions}
                />
            ) : (
                <MediaLane
                    amountOfLanes={0}
                    currentTime={playerSyncPlayPosition}
                    mediaItems={mediaItems}
                    previousSolutions={previousSolutions}
                    updateMediaItem={updateMediaItem}
                    setPlayPosition={setPlayPosition}
                    checkMediaItem={checkMediaItem}
                    removeMediaItem={removeMediaItem}
                    videoDuration={originalVideoDuration}
                    ToolbarActions={toolbarActions}
                />
            )}
            <ToastContainer />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CuttingEditor))
