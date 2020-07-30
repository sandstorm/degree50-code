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
import ArtPlayer from '../components/ArtPlayer'
import Annotations from './Annotations'
import { MediaItem } from '../components/types'
import Storage from '../utils/storage'

import { useMediaItemHandling } from '../utils/hooks'
import { selectors, actions } from '../../PlayerSlice'

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
        annotations: selectSolution(state).annotations,
        playerSyncPlayPosition: selectors.selectSyncPlayPosition(state),
    }
}

const mapDispatchToProps = {
    setAnnotations,
    syncSolutionAction,
    setPlayPosition: actions.setPlayPosition,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

const AnnotationsEditor = (props: Props) => {
    const height = props.height

    // All annotations
    const itemsFromAnnotations = props.annotations.map((sub) => new MediaItem(sub.start, sub.end, sub.text))

    const mediaItems: MediaItem[] =
        itemsFromAnnotations.length > 0
            ? itemsFromAnnotations
            : [new MediaItem('00:00:00.000', '00:00:01.000', t('Kommentar'))]

    // All options
    const firstVideoUrl = props.videos[0] ? props.videos[0].url : ''

    const artPlayerOptions = {
        videoUrl: firstVideoUrl,
        uploadDialog: false,
        translationLanguage: 'en',
    }

    const {
        currentIndex,

        setCurrentTimeForMediaItems,
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
        storage,
    })

    return (
        <React.Fragment>
            <div className="video-editor__main" style={{ height: height - 200 }}>
                <div className="video-editor__section video-editor__left">
                    <ArtPlayer options={artPlayerOptions} currentTimeCallback={setCurrentTimeForMediaItems} />
                </div>
                <div className="video-editor__section video-editor__right">
                    <header className="video-editor__section-header">{props.headerContent}</header>

                    <div className="video-editor__section-content">
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

            <MediaLane
                currentTime={props.playerSyncPlayPosition}
                mediaItems={mediaItems}
                updateMediaItem={updateMediaItem}
                setPlayPosition={props.setPlayPosition}
            />
            <ToastContainer />
        </React.Fragment>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(AnnotationsEditor)
