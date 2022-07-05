import React from 'react'
import { connect, ConnectedProps } from 'react-redux'
import { actions } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'
import Button from 'Components/Button/Button'

export const prefix = 'MATERIAL_SOLUTION'

export const MaterialSolutionMenuOverlayIds = {
  compare: `${prefix}/compare`,
}

const mapStateToProps = (state: AppState) => {
  return {}
}

const mapDispatchToProps = {
  setOverlay: actions.videoEditor.overlay.setOverlay,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux

const menuButtonAriaLabel = 'Lösung Auswählen und Vergleichen'

const MaterialSolutionMenu = (props: Props) => {
  const { setOverlay } = props

  return (
    <div className="vide-editor__menu">
      <Button
        title={menuButtonAriaLabel}
        className="btn btn-grey btn-sm video-editor__toolbar__button"
        onPress={() =>
          setOverlay({
            overlayId: MaterialSolutionMenuOverlayIds.compare,
            closeOthers: true,
          })
        }
      >
        <i className="fa-solid fa-eye" />
      </Button>
    </div>
  )
}

export default connector(React.memo(MaterialSolutionMenu))
