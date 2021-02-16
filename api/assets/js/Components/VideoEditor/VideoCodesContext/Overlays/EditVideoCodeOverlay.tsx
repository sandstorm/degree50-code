import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { VideoCodeOverlayIds } from '../VideoCodesMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import TimeInput from 'Components/VideoEditor/components/TimeInput'
import { useVideoCodeEdit } from './useVideoCodeEdit'
import Overlay from '../../components/Overlay'
import TextField from 'Components/VideoEditor/components/TextField'
import Button from 'Components/Button/Button'
import VideoCodeSelection from './VideoCodeSelection'

const mapStateToProps = (state: VideoEditorState) => {
    const currentlyEditedElementId = selectors.overlay.currentlyEditedElementId(state)
    const videoCodesById = selectors.data.videoCodes.selectById(state)
    const videoCode = currentlyEditedElementId ? videoCodesById[currentlyEditedElementId] : undefined

    return {
        videoCode,
        prototoypes: selectors.data.selectDenormalizedPrototypes(state),
    }
}

const mapDispatchToProps = {
    updateVideoCode: actions.data.videoCodes.update,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

// TODO this should probably be consolidated into a single component with the CreateVideoCodeOverlay
const EditVideoCodeOverlay: FC<Props> = (props) => {
    const defaultPrototypeId = props.prototoypes[0].id

    const {
        transientVideoCode,
        handleStartTimeChange,
        handleEndTimeChange,
        handleMemoChange,
        updateSelectedCode,
    } = useVideoCodeEdit(props.videoCode)

    const close = () => {
        props.closeOverlay(VideoCodeOverlayIds.edit)
    }

    if (!transientVideoCode) {
        close()
        return null
    }

    const handleSave = () => {
        props.updateVideoCode({ transientVideoCode })
        props.syncSolution()
        close()
    }

    return (
        <Overlay closeCallback={close} title="Codierung bearbeiten">
            <TimeInput label="Start" value={transientVideoCode.start} onChange={handleStartTimeChange} />
            <TimeInput label="Ende" value={transientVideoCode.end} onChange={handleEndTimeChange} />
            <hr />
            <VideoCodeSelection
                defaultPrototypeId={defaultPrototypeId}
                onSelect={updateSelectedCode}
                selectedPrototypeId={transientVideoCode.idFromPrototype}
            />
            <br />

            <label htmlFor="memo">Memo</label>
            <TextField id="memo" text={transientVideoCode.memo} updateText={handleMemoChange} />
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

export default connect(mapStateToProps, mapDispatchToProps)(memo(EditVideoCodeOverlay))
