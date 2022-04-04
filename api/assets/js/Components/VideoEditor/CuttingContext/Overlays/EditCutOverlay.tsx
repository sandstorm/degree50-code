import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { CutOverlayIds } from '../CuttingMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import TimeInput from 'Components/TimeInput'
import Overlay from '../../components/Overlay'
import TextField from 'Components/VideoEditor/components/TextField'
import Button from 'Components/Button/Button'
import { useCutEdit } from './useCutEdit'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => {
    const currentlyEditedElementId = selectors.overlay.currentlyEditedElementId(state)
    const cutsById = selectors.data.cuts.selectById(state)
    const cut = currentlyEditedElementId ? cutsById[currentlyEditedElementId] : undefined
    const duration = configSelectors.selectVideos(state)[0].duration

    return {
        cut,
        duration,
    }
}

const mapDispatchToProps = {
    updateCut: actions.data.cuts.update,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

// TODO this should probably be consolidated into a single component with the CreateCutOverlay
const EditCutOverlay: FC<Props> = (props) => {
    const {
        transientCut,
        handleStartTimeChange,
        handleEndTimeChange,
        updateText,
        updateMemo,
        minStart,
        maxStart,
        minEnd,
        maxEnd,
    } = useCutEdit(props.duration, props.cut)

    const close = () => {
        props.closeOverlay(CutOverlayIds.edit)
    }

    if (!transientCut) {
        close()
        return null
    }

    const handleSave = () => {
        props.updateCut({ transientCut })
        props.syncSolution()
        close()
    }

    return (
        <Overlay closeCallback={close} title="Schnitt bearbeiten">
            <TimeInput
                label="Start"
                hoursLabel="Start Stunden"
                minutesLabel="Start Minuten"
                secondsLabel="Start Sekunden"
                value={transientCut.start}
                min={minStart}
                max={maxStart}
                onChange={handleStartTimeChange}
            />
            <TimeInput
                label="Ende"
                hoursLabel="Ende Stunden"
                minutesLabel="End Minuten"
                secondsLabel="Ende Sekunden"
                value={transientCut.end}
                min={minEnd}
                max={maxEnd}
                onChange={handleEndTimeChange}
            />
            <hr />
            <label htmlFor="text">Beschreibung</label>
            <TextField id="text" text={transientCut.text} updateText={updateText} />
            <br />
            <label htmlFor="memo">Memo</label>
            <TextField id="memo" text={transientCut.memo} updateText={updateMemo} />
            <hr />
            <Button className="btn btn-secondary" onPress={close} title="Änderungen Verwerfen">
                Verwerfen
            </Button>
            <Button className="btn btn-primary" onPress={handleSave} title="Änderungen Speichern">
                Speichern
            </Button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(EditCutOverlay))
