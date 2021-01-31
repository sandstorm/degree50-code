import TimeInput from 'Components/VideoEditor/Editors/components/TimeInput/TimeInput'
import { secondToTime } from 'Components/VideoEditor/Editors/utils'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import { VideoCode } from 'Components/VideoEditor/VideoListsSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { generate } from 'shortid'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../Toolbar/OverlayContainer/Overlay'
import { VideoCodeOverlayIds } from '../VideoCodesMenu'
import { useVideoCodeEdit } from './useVideoCodeEdit'
import TextField from 'Components/VideoEditor/Editors/components/MediaItemList/Row/TextField'
import Button from 'Components/Button/Button'
import VideoCodeSelection from './VideoCodeSelection'

const mapStateToProps = (state: VideoEditorState) => ({
    currentTime: selectors.player.selectSyncPlayPosition(state),
    videos: selectors.config.selectVideos(state.videoEditor),
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
        idFromPrototype: null,
    }

    // TODO handle code selection
    const {
        transientVideoCode,
        handleStartTimeChange,
        handleEndTimeChange,
        handleMemoChange,
        updateSelectedCode,
    } = useVideoCodeEdit(initialVideoCode)

    const close = () => {
        props.closeOverlay(VideoCodeOverlayIds.create)
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
