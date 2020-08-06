import React from 'react'
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

const storage = new Storage()

type OwnProps = {
    height: number
    headerContent: React.ReactNode
    videos: Array<{ url: string }>
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

    // TODO actually use this
    const firstVideoUrl = videos[0] ? videos[0].url : ''

    // TODO
    // change hard codings as soon as backend is in place
    const mediaItems: MediaItem<Cut>[] =
        cutList.length > 0
            ? cutList.map(
                  (cut) =>
                      new MediaItem({
                          start: cut.start,
                          end: cut.end,
                          text: typeof cut.text === 'string' ? cut.text : cut.url,
                          originalData: cut,
                          lane: 0,
                      })
              )
            : [
                  new MediaItem({
                      start: '00:00:00.000',
                      end: '00:00:05.000',
                      text: 'sample.mp4',
                      originalData: {
                          url: '/sample.mp4',
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
                        <button onClick={handleSplitAtCursor}>Split at cursor</button>
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
