import Button from 'Components/Button/Button'
import TextField from 'Components/VideoEditor/Editors/components/MediaItemList/Row/TextField'
import TimeInput from 'Components/VideoEditor/Editors/components/TimeInput/TimeInput'
import { secondToTime } from 'Components/VideoEditor/Editors/utils'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import { Annotation } from 'Components/VideoEditor/VideoListsSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { generate } from 'shortid'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../OverlayContainer/Overlay'
import { AnnotationOverlayIds } from './AnnotationsMenu'
import { useAnnotationEdit } from './useAnnotationEdit'

const mapStateToProps = (state: VideoEditorState) => ({
    currentTime: selectors.player.selectSyncPlayPosition(state),
    videos: selectors.config.selectVideos(state.videoEditor),
})

const mapDispatchToProps = {
    appendAnnotation: actions.data.annotations.append,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CreateAnnotationOverlay: FC<Props> = (props) => {
    const { currentTime, videos } = props
    const duration = videos[0].duration

    // transient annotation
    // current as start
    // some default delta for end
    const initialAnnotation: Annotation = {
        id: generate(),
        start: secondToTime(currentTime),
        end: secondToTime(Math.min(currentTime + duration / 10, duration)),
        text: '',
        memo: '',
        color: null,
        idFromPrototype: null,
    }

    const {
        transientAnnotation,
        handleStartTimeChange,
        handleEndTimeChange,
        updateText,
        updateMemo,
    } = useAnnotationEdit(initialAnnotation)

    const close = () => {
        props.closeOverlay(AnnotationOverlayIds.create)
    }

    if (!transientAnnotation) {
        close()
        return null
    }

    const handleSave = () => {
        props.appendAnnotation(transientAnnotation)
        props.syncSolution()
        close()
    }

    return (
        <Overlay closeCallback={close}>
            <h3>Neue Annotation</h3>
            <TimeInput label="Start" value={transientAnnotation.start} onChange={handleStartTimeChange} />
            <TimeInput label="Ende" value={transientAnnotation.end} onChange={handleEndTimeChange} />
            <hr />
            <label htmlFor="text">Text</label>
            <TextField id="text" text={transientAnnotation.text} updateText={updateText} />
            <br />
            <label htmlFor="memo">Memo</label>
            <TextField id="memo" text={transientAnnotation.memo} updateText={updateMemo} />
            <hr />
            <Button className="btn btn-secondary" onPress={close}>
                Verwerfen
            </Button>
            <Button className="btn btn-primary" onPress={handleSave}>
                Speichern
            </Button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(CreateAnnotationOverlay))
