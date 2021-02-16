import TimeInput from 'Components/VideoEditor/components/TimeInput'
import { secondToTime } from 'Components/VideoEditor/utils'
import { actions, selectors as videoEditorSelectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { generate } from 'shortid'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../components/Overlay'
import { VideoCodeOverlayIds } from '../VideoCodesMenu'
import { useVideoCodeEdit } from './useVideoCodeEdit'
import TextField from 'Components/VideoEditor/components/TextField'
import Button from 'Components/Button/Button'
import VideoCodeSelection from './VideoCodeSelection'
import { VideoCode } from 'Components/VideoEditor/types'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => ({
    currentTime: videoEditorSelectors.player.selectSyncPlayPosition(state),
    videos: configSelectors.selectVideos(state),
    prototoypes: videoEditorSelectors.data.selectDenormalizedPrototypes(state),
})

const mapDispatchToProps = {
    appendVideoCode: actions.data.videoCodes.append,
    closeOverlay: actions.overlay.unsetOverlay,
    syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CreateVideoCodeOverlay: FC<Props> = (props) => {
    const { currentTime, videos } = props
    const duration = videos[0].duration

    const close = () => {
        props.closeOverlay(VideoCodeOverlayIds.create)
    }

    const initialPrototypeId = props.prototoypes[0].id

    // transient videoCode
    // current as start
    // some default delta for end
    const initialVideoCode: VideoCode = {
        id: generate(),
        start: secondToTime(currentTime),
        end: secondToTime(Math.min(currentTime + duration / 10, duration)),
        text: '',
        memo: '',
        color: null,
        idFromPrototype: initialPrototypeId,
    }

    // TODO handle code selection
    const {
        transientVideoCode,
        handleStartTimeChange,
        handleEndTimeChange,
        handleMemoChange,
        updateSelectedCode,
    } = useVideoCodeEdit(initialVideoCode)

    if (props.prototoypes.length < 1) {
        return (
            <Overlay closeCallback={close} title="Neue Codierung">
                <p tabIndex={0}>Keine Codes vorhanden!</p>
            </Overlay>
        )
    }

    if (!transientVideoCode) {
        close()
        return null
    }

    const handleSave = () => {
        props.appendVideoCode(transientVideoCode)
        props.syncSolution()
        close()
    }

    return (
        <Overlay closeCallback={close} title="Neuer VideoCode">
            <TimeInput label="Start" value={transientVideoCode.start} onChange={handleStartTimeChange} />
            <TimeInput label="Ende" value={transientVideoCode.end} onChange={handleEndTimeChange} />
            <hr />
            <VideoCodeSelection
                defaultPrototypeId={initialPrototypeId}
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

export default connect(mapStateToProps, mapDispatchToProps)(memo(CreateVideoCodeOverlay))
