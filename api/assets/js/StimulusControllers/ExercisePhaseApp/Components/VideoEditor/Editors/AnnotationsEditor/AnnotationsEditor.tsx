import React from 'react'
import { connect } from 'react-redux'
import { ToastContainer } from 'react-toastify'
import { t } from 'react-i18nify'

import { setAnnotations, selectSolution } from '../../../Solution/SolutionSlice'
import { syncSolutionAction } from '../../../Solution/SolutionSaga'
import { selectReadOnly, selectUserId } from '../../../Config/ConfigSlice'
import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'
import { selectCurrentEditorId } from '../../../Presence/CurrentEditorSlice'

import MediaLane from '../components/MediaLane'
import PlayerComponent from '../components/Player'
import Annotations from './Annotations'
import { MediaItem } from '../components/types'
import { vttToUrlUseWorker } from '../utils/subtitleUtils'
import Storage from '../utils/storage'

import { useMediaItemHandling } from '../utils/hooks'

const history: Array<MediaItem[]> = []
const storage = new Storage()
const worker = new Worker(vttToUrlUseWorker())

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
        annotations: selectSolution(state).annotations,
    }
}

const mapDispatchToProps = {
    setAnnotations,
    syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const AnnotationsEditor = (props: Props) => {
    const height = props.height

    // All annotations
    const itemsFromAnnotations = props.annotations.map((sub) => new MediaItem(sub.start, sub.end, sub.text))

    const mediaItems: MediaItem[] =
        itemsFromAnnotations.length >= 0 ? itemsFromAnnotations : [new MediaItem('00:00:00.000', '00:00:01.000', t('Kommentar'))]

    // All options
    const firstVideoUrl = props.videos[0] ? props.videos[0].url : ''

    const artPlayerOptions = {
        videoUrl: firstVideoUrl,
        uploadDialog: false,
        translationLanguage: 'en',
    }

    const {
        currentIndex,
        currentTime,
        player,

        setPlayer,
        setCurrentTime,
        addMediaItem,
        removeMediaItem,
        updateMediaItem,
        checkMediaItem,
    } = useMediaItemHandling({
        userId: props.userId,
        currentEditorId: props.currentEditorId,
        mediaItems,
        readOnly: props.readOnly,
        setMediaItems: props.setAnnotations,
        updateCallback: props.syncSolutionAction,
        history,
        storage,
        worker,
    })

    return (
        <React.Fragment>
            <div className="subtitle-editor__main" style={{ height: height - 200 }}>
                <div className="subtitle-editor__section subtitle-editor__left">
                    <PlayerComponent options={artPlayerOptions} setPlayer={setPlayer} setCurrentTime={setCurrentTime} />
                </div>
                <div className="subtitle-editor__section subtitle-editor__right">
                    <header className="subtitle-editor__section-header">{props.headerContent}</header>

                    <div className="subtitle-editor__section-content">
                        <Annotations
                            annotations={mediaItems}
                            addAnnotation={addMediaItem}
                            currentIndex={currentIndex}
                            updateAnnotation={updateMediaItem}
                            removeAnnotation={removeMediaItem}
                            checkAnnotation={checkMediaItem}
                        />
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

export default connect(mapStateToProps, mapDispatchToProps)(AnnotationsEditor)
