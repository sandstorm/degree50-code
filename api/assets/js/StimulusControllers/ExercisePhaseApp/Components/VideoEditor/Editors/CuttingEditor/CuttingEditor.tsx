import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { Translate } from 'react-i18nify'

import VideoContextPlayer from './VideoContextPlayer'
import MediaLane from '../components/MediaLane'

import { selectReadOnly, selectUserId } from '../../../Config/ConfigSlice'
import { selectCurrentEditorId } from '../../../Presence/CurrentEditorSlice'
import * as sagas from '../../../Solution/SolutionSaga'
import { setCutList, selectSolution } from '../../../Solution/SolutionSlice'
import { selectors, actions } from '../../PlayerSlice'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import Storage from '../utils/storage'
import MediaItemList from '../components/MediaItemList/MediaItemList'
import { MediaItem } from '../components/types'
import { Cut } from './types'
import { useVolume, useCuttingMediaItemHandling } from './util'
import { d2t } from 'duration-time-conversion'

const storage = new Storage()

type OwnProps = {
    height: number
    headerContent: React.ReactNode
    videos: Array<{ url: { hls: string; mp4: string }; name: string; duration: string }>
}

const mapStateToProps = (state: AppState) => ({
    playerSyncPlayPosition: selectors.selectSyncPlayPosition(state),
    userId: selectUserId(state),
    readOnly: selectReadOnly(state),
    currentEditorId: selectCurrentEditorId(state),
    cutList: selectSolution(state).cutlist,
})

const mapDispatchToProps = {
    syncSolutionAction: sagas.syncSolutionAction,
    setPlayPosition: actions.setPlayPosition,
    setCutList,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const CuttingEditor = ({
    userId,
    currentEditorId,
    setCutList,
    readOnly,
    height,
    headerContent,
    playerSyncPlayPosition,
    setPlayPosition,
    cutList,
    videos,
    syncSolutionAction,
}: Props) => {
    const { volume, handleVolumeChange } = useVolume()

    const firstVideo = videos[0]
    const firstVideoUrl = firstVideo ? firstVideo.url.mp4 : ''

    // WHY: we need  the full duration of the video to create a cut media item
    // of the same length on the media track.
    // If we somehow do not have a duration, we default to 5 seconds.
    const firstVideoDuration = firstVideo ? parseFloat(firstVideo.duration) : 5 // duration in seconds

    const mediaItems: MediaItem<Cut>[] =
        cutList.length > 0
            ? cutList.map(
                  (cut) =>
                      new MediaItem({
                          start: cut.start,
                          end: cut.end,
                          text: typeof cut.text === 'string' ? cut.text : cut.url,
                          memo: '',
                          originalData: cut,
                          lane: 0,
                      })
              )
            : [
                  new MediaItem({
                      start: '00:00:00.000',
                      end: d2t(firstVideoDuration.toFixed(3)),
                      text: videos[0]?.name || '',
                      memo: '',
                      originalData: {
                          url: firstVideoUrl,
                          offset: 0,
                          playbackRate: 1,
                      } as Cut,
                      lane: 0,
                  }),
              ]

    const {
        currentIndex,

        setCurrentTimeForMediaItems,
        removeMediaItem,
        checkMediaItem,
        updateMediaItem,
        updateMediaItems,
        duplicateCut,
        handleSplitAtCursor,
    } = useCuttingMediaItemHandling({
        userId: userId,
        currentEditorId: currentEditorId,
        mediaItems,
        readOnly: readOnly,
        setCutList,
        updateCallback: syncSolutionAction,
        storage,
        playerSyncPlayPosition,
        setPlayPosition,
    })

    useEffect(() => {
        if (cutList.length < 1) {
            // WHY: Force update to create initial cut list (otherwise we would need to interact
            // with a media item to write it to the store).
            // This is a bit hacky. Perhaps we should find a better way than to force this.
            // The issue currently is, that 'updateMediaItems' does make an equality check comparing
            // its inital items with the new media items.
            // Initially, when a video is opened the very first time
            // inside the cutting editor, both lists will be identical and the cutlist wont be written to the store.
            updateMediaItems(mediaItems, true, true)
        }
    }, [cutList, mediaItems])

    return (
        <React.Fragment>
            <div className="video-editor__main" style={{ height: height - 200 }}>
                <div className="video-editor__section video-editor__left">
                    <VideoContextPlayer
                        cutList={cutList}
                        currentTimeCallback={setCurrentTimeForMediaItems}
                        volume={volume}
                    />
                </div>
                <div className="video-editor__section video-editor__right">
                    <header className="video-editor__section-header">{headerContent}</header>

                    <div className="video-editor__section-content">
                        <MediaItemList
                            mediaItems={mediaItems}
                            addMediaItem={duplicateCut}
                            currentIndex={currentIndex}
                            updateMediaItem={updateMediaItem}
                            removeMediaItem={removeMediaItem}
                            checkMediaItem={checkMediaItem}
                        />
                    </div>
                </div>
            </div>

            <MediaLane
                currentTime={playerSyncPlayPosition}
                mediaItems={mediaItems}
                updateMediaItem={updateMediaItem}
                setPlayPosition={setPlayPosition}
                checkMediaItem={checkMediaItem}
                removeMediaItem={removeMediaItem}
                ToolbarActions={
                    <>
                        <button className={'btn btn-outline-primary btn-sm'} onClick={handleSplitAtCursor}>
                            Split at cursor
                        </button>
                        <div className="item">
                            <div className="name">
                                <Translate value="volume" />
                            </div>
                            <div className="value">
                                <input
                                    defaultValue={volume}
                                    type="range"
                                    min="0"
                                    max="10"
                                    step="1"
                                    onChange={handleVolumeChange}
                                />
                            </div>
                        </div>
                    </>
                }
            />
            <ToastContainer />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CuttingEditor))
