import Button from 'Components/Button/Button'
import TextField from 'Components/VideoEditor/components/TextField'
import TimeInput from 'Components/TimeInput'
import { Cut } from 'Components/VideoEditor/types'
import { getNewMediaItemStartAndEnd } from 'Components/VideoEditor/utils/useMediaItemHandling'
import {
  actions,
  selectors,
} from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import { t2d } from 'duration-time-conversion'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { generate } from 'shortid'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../components/Overlay'
import { CutOverlayIds } from '../CuttingMenu'
import { useCutEdit } from './useCutEdit'
import { secondToTime } from '../../utils/time'
import { ShortCutId } from '../../ShortCutsContext/ShortCutsSlice'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

const mapStateToProps = (state: AppState) => ({
  currentTime: selectors.videoEditor.player.selectSyncPlayPosition(state),
  videos: selectors.config.selectVideos(state),
  currentSolutionId: selectors.data.solutions.selectCurrentId(state),
})

const mapDispatchToProps = {
  appendCut: actions.data.cuts.append,
  closeOverlay: actions.videoEditor.overlay.unsetOverlay,
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
    minAllowedStartTime,
    maxAllowedStartTime,
    minAllowedEndTime,
    maxAllowedEndTime,
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

  const handleUseCurrentTimeForStartValue = () => {
    handleStartTimeChange(secondToTime(props.currentTime))
  }

  const handleUseCurrentTimeForEndValue = () => {
    handleEndTimeChange(secondToTime(props.currentTime))
  }

  return (
    <Overlay closeCallback={close} title="Neuer Schnitt">
      <div className="time-input-wrapper">
        <TimeInput
          label="Start"
          hoursLabel="Start Stunden"
          minutesLabel="Start Minuten"
          secondsLabel="Start Sekunden"
          value={transientCut.start}
          min={minAllowedStartTime}
          max={maxAllowedStartTime}
          onChange={handleStartTimeChange}
        />
        <Button
          className="btn btn-outline-primary"
          onPress={handleUseCurrentTimeForStartValue}
          title={'Aktuelle Zeit als Startzeit übernehmen'}
          data-short-cut-id={ShortCutId.SET_CURRENT_TIME_AS_START_VALUE}
        >
          <i className="fas fa-stopwatch" />
        </Button>
      </div>
      <div className="time-input-wrapper">
        <TimeInput
          label="Ende"
          hoursLabel="Ende Stunden"
          minutesLabel="End Minuten"
          secondsLabel="Ende Sekunden"
          value={transientCut.end}
          min={minAllowedEndTime}
          max={maxAllowedEndTime}
          onChange={handleEndTimeChange}
        />
        <Button
          className="btn btn-outline-primary"
          onPress={handleUseCurrentTimeForEndValue}
          title={'Aktuelle Zeit als Endzeit übernehmen'}
          data-short-cut-id={ShortCutId.SET_CURRENT_TIME_AS_END_VALUE}
        >
          <i className="fas fa-stopwatch" />
        </Button>
      </div>
      <hr />
      <label htmlFor="text">Beschreibung</label>
      <TextField id="text" text={transientCut.text} updateText={updateText} />
      <br />
      <label htmlFor="memo">Memo</label>
      <TextField id="memo" text={transientCut.memo} updateText={updateMemo} />
      <hr />
      <Button
        className="btn btn-secondary"
        onPress={close}
        title="Schnitt Verwerfen"
      >
        Verwerfen
      </Button>
      <Button
        className="btn btn-primary"
        onPress={handleSave}
        title="Schnitt Speichern"
      >
        Speichern
      </Button>
    </Overlay>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(memo(CreateCutOverlay))
