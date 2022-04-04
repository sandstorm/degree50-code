import Button from 'Components/Button/Button'
import TextField from 'Components/VideoEditor/components/TextField'
import TimeInput from 'Components/TimeInput'
import { Cut } from 'Components/VideoEditor/types'
import { getNewMediaItemStartAndEnd } from 'Components/VideoEditor/utils/useMediaItemHandling'
import { actions, selectors as videoEditorSelectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import { t2d } from 'duration-time-conversion'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { generate } from 'shortid'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../components/Overlay'
import { CutOverlayIds } from '../CuttingMenu'
import { useCutEdit } from './useCutEdit'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { SolutionStateSlice } from 'Components/VideoEditor/SolutionSlice'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice & SolutionStateSlice) => ({
    currentTime: videoEditorSelectors.player.selectSyncPlayPosition(state),
    videos: configSelectors.selectVideos(state),
    currentSolutionId: videoEditorSelectors.data.solutions.selectCurrentId(state),
})

const mapDispatchToProps = {
    appendCut: actions.data.cuts.append,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CreateCutOverlay: FC<Props> = (props) => {
    const { currentTime, videos } = props
    const firstVideo = videos[0]
    const { duration, url } = firstVideo

    const { start, end } = getNewMediaItemStartAndEnd(currentTime, duration)

    // transient cut
    // current as start
    // some default delta for end
    const initialCut: Cut = {
        id: generate(),
        start: start,
        end: end,
        offset: t2d(start),
        playbackRate: 1,
        url: url.mp4 ?? '',
        text: '',
        memo: '',
        color: null,
        solutionId: props.currentSolutionId,
    }

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
    } = useCutEdit(duration, initialCut)

    const close = () => {
        props.closeOverlay(CutOverlayIds.create)
    }

    if (!transientCut) {
        close()
        return null
    }

    const handleSave = () => {
        props.appendCut(transientCut)
        props.syncSolution()
        close()
    }

    return (
        <Overlay closeCallback={close} title="Neuer Schnitt">
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
            <Button className="btn btn-secondary" onPress={close} title="Schnitt Verwerfen">
                Verwerfen
            </Button>
            <Button className="btn btn-primary" onPress={handleSave} title="Schnitt Speichern">
                Speichern
            </Button>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(CreateCutOverlay))
