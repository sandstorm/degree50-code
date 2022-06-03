import React from 'react'
import { connect } from 'react-redux'
import { actions } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import PrototypeEntry from './PrototypeEntry'
import { VideoCodePrototype } from 'Components/VideoEditor/types'
import Button from 'Components/Button/Button'
import { VideoCodeOverlayIds } from '../../VideoCodesMenu'
import {
  ConfigStateSlice,
  selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'

type OwnProps = {
  videoCodePrototypes: VideoCodePrototype[]
  parentPrototype?: VideoCodePrototype
}

const mapStateToProps = (state: ConfigStateSlice) => {
  const isSolutionView = configSelectors.selectIsSolutionView(state)

  return {
    isSolutionView,
  }
}

const mapDispatchToProps = {
  createVideoCodePrototype: actions.data.videoCodePrototypes.append,
  removeVideoCodePrototype: actions.data.videoCodePrototypes.remove,
  syncSolution: syncSolutionAction,
  openOverlay: actions.videoEditor.overlay.setOverlay,
  setCurrentlyEditedElementId:
    actions.videoEditor.overlay.setCurrentlyEditedElementId,
  setCurrentlyEditedElementParentId:
    actions.videoEditor.overlay.setCurrentlyEditedElementParentId,
}

type Props = ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps &
  OwnProps

const PrototypeList = (props: Props) => {
  const handleAdd = () => {
    props.setCurrentlyEditedElementId(undefined)
    props.setCurrentlyEditedElementParentId(props.parentPrototype?.id)
    props.openOverlay({
      overlayId: VideoCodeOverlayIds.editPrototype,
      closeOthers: false,
    })
  }

  return (
    <>
      {props.videoCodePrototypes?.length > 0 ? ( // exists, because we might have nested lists inside an Entry
        <ul className="video-editor__video-codes">
          {props.videoCodePrototypes.map((prototype) => (
            <PrototypeEntry
              key={prototype.id}
              videoCodePrototype={prototype}
              parentPrototype={props.parentPrototype}
            />
          ))}
        </ul>
      ) : null}

      {!props.isSolutionView && (
        <div className="video-code">
          <Button
            title={`Neuen ${
              props.parentPrototype ? 'Untercode' : 'Code'
            } erstellen`}
            className={'btn btn-outline-primary btn--full-width btn-sm'}
            onPress={handleAdd}
          >
            <i className="fas fa-plus" />
          </Button>
        </div>
      )}
    </>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(React.memo(PrototypeList))
