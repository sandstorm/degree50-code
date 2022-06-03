import {
  actions,
  selectors,
} from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { VideoCodeOverlayIds } from '../VideoCodesMenu'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import Overlay from '../../components/Overlay'
import Button from 'Components/Button/Button'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

const mapStateToProps = (state: AppState) => ({
  currentlyEditedElementId:
    selectors.videoEditor.overlay.currentlyEditedElementId(state),
})

const mapDispatchToProps = {
  removeVideoCode: actions.data.videoCodes.remove,
  closeOverlay: actions.videoEditor.overlay.unsetOverlay,
  syncSolution: syncSolutionAction,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const DeleteVideoCodeOverlay: FC<Props> = (props) => {
  const close = () => {
    props.closeOverlay(VideoCodeOverlayIds.remove)
  }

  const handleRemove = () => {
    if (props.currentlyEditedElementId !== undefined) {
      props.removeVideoCode(props.currentlyEditedElementId)
      props.syncSolution()
    }
    close()
  }

  return (
    <Overlay closeCallback={close} title="Codierung wirklich löschen?">
      <Button
        className="btn btn-grey"
        onPress={close}
        title="Löschvorgang Abbrechen"
      >
        <i className="fas fa-times" />
        <span>Abbrechen</span>
      </Button>
      <Button
        className="btn btn-primary"
        onPress={handleRemove}
        title="Löschvorgang Bestätigen"
      >
        <i className="fas fa-check" />
        <span>Löschen</span>
      </Button>
    </Overlay>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(memo(DeleteVideoCodeOverlay))
