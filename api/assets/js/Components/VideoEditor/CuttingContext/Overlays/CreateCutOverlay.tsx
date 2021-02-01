import Button from 'Components/Button/Button'
import TextField from 'Components/VideoEditor/Editors/components/MediaItemList/Row/TextField'
import TimeInput from 'Components/VideoEditor/Editors/components/TimeInput/TimeInput'
import { secondToTime } from 'Components/VideoEditor/Editors/utils'
import { getNewMediaItemStartAndEnd } from 'Components/VideoEditor/Editors/utils/useMediaItemHandling'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import { Cut } from 'Components/VideoEditor/VideoListsSlice'
import { t2d } from 'duration-time-conversion'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { generate } from 'shortid'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../Toolbar/OverlayContainer/Overlay'
import { CutOverlayIds } from '../CuttingMenu'
import { useCutEdit } from './useCutEdit'

const mapStateToProps = (state: VideoEditorState) => ({
    currentTime: selectors.player.selectSyncPlayPosition(state),
    videos: selectors.config.selectVideos(state.videoEditor),
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
        idFromPrototype: null,
    }

    const {
        transientCut,
        handleStartTimeChange,
        handleEndTimeChange,
        handleOffsetChange,
        updateText,
        updateMemo,
    } = useCutEdit(initialCut)

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
            <TimeInput label="Start" value={transientCut.start} onChange={handleStartTimeChange} />
            <TimeInput label="Ende" value={transientCut.end} onChange={handleEndTimeChange} />
            <TimeInput label="Offset" value={secondToTime(transientCut.offset)} onChange={handleOffsetChange} />
            <hr />
            <label htmlFor="text">Text</label>
            <TextField id="text" text={transientCut.text} updateText={updateText} />
            <br />
            <label htmlFor="memo">Memo</label>
            <TextField id="memo" text={transientCut.memo} updateText={updateMemo} />
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

export default connect(mapStateToProps, mapDispatchToProps)(memo(CreateCutOverlay))
