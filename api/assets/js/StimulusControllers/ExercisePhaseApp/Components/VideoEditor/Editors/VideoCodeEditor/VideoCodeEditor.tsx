import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'

import { setVideoCodes, selectSolution } from '../../../Solution/SolutionSlice'
import { syncSolutionAction } from '../../../Solution/SolutionSaga'
import { selectReadOnly, selectUserId } from '../../../Config/ConfigSlice'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { selectCurrentEditorId } from '../../../Presence/CurrentEditorSlice'

import MediaLane from '../components/MediaLane'
import PlayerComponent from '../components/Player'
import VideoCodes from './VideoCodes'
import { MediaItem } from '../components/types'
import { secondToTime, timeToSecond } from '../utils'
import { useMediaItemHandling } from '../utils/hooks'
import Storage from '../utils/storage'

const storage = new Storage()

type OwnProps = {
    height: number
    headerContent: React.ReactNode
    videos: Array<{ url: string }>
}

const mapStateToProps = (state: AppState) => {
    return {
        userId: selectUserId(state),
        readOnly: selectReadOnly(state),
        currentEditorId: selectCurrentEditorId(state),
        videoCodes: selectSolution(state).videoCodes,
    }
}

const mapDispatchToProps = {
    setVideoCodes,
    syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const VideoCodeEditor = (props: Props) => {
    const height = props.height

    // All videoCodes
    const mediaItems = props.videoCodes.map(
        (videoCode) => new MediaItem(videoCode.start, videoCode.end, videoCode.text, videoCode.color)
    )

    // All options
    const firstVideoUrl = props.videos[0] ? props.videos[0].url : ''

    const artPlayerOptions = {
        videoUrl: firstVideoUrl,
        uploadDialog: false,
        translationLanguage: 'en',
    }

    const {
        currentTime,
        player,

        setPlayer,
        setCurrentTime,
        updateMediaItems,
        updateMediaItem,
        copyMediaItems,
    } = useMediaItemHandling({
        userId: props.userId,
        currentEditorId: props.currentEditorId,
        mediaItems,
        readOnly: props.readOnly,
        setMediaItems: props.setVideoCodes,
        updateCallback: props.syncSolutionAction,
        storage,
    })

    const addVideoCode = useCallback(
        (index, videoCode) => {
            const videoCodes = copyMediaItems()
            const previous = videoCodes[index - 1]
            const start = previous ? secondToTime(previous.endTime + 0.1) : '00:00:00.001'
            const end = previous ? secondToTime(previous.endTime + 1.1) : '00:00:01.001'
            const code = new MediaItem(start, end, videoCode.name, videoCode.color)

            if (player) {
                player.seek = timeToSecond(start)
            }

            videoCodes.splice(index, 0, code)
            updateMediaItems(videoCodes)
        },
        [copyMediaItems, updateMediaItems]
    )

    return (
        <React.Fragment>
            <div className="subtitle-editor__main" style={{ height: height - 200 }}>
                <div className="subtitle-editor__section subtitle-editor__left">
                    <PlayerComponent options={artPlayerOptions} setPlayer={setPlayer} setCurrentTime={setCurrentTime} />
                </div>
                <div className="subtitle-editor__section subtitle-editor__right">
                    <header className="subtitle-editor__section-header">{props.headerContent}</header>

                    <div className="subtitle-editor__section-content">
                        <VideoCodes addVideoCode={addVideoCode} videoCodes={mediaItems} />
                    </div>
                </div>
            </div>

            {player && (
                <MediaLane
                    player={player}
                    currentTime={currentTime}
                    mediaItems={mediaItems}
                    updateMediaItem={updateMediaItem}
                />
            )}
            <ToastContainer />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(VideoCodeEditor)
