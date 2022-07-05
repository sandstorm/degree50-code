import Button from 'Components/Button/Button'
import { FC, memo } from 'react'
import { connect } from 'react-redux'
import { ConfigStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { actions } from 'Components/VideoEditor/VideoEditorSlice'
import { AUFGABE_OVERLAY_ID } from './AufgabeOverlay'

const mapStateToProps = (state: ConfigStateSlice) => ({})

const mapDispatchToProps = {
  setOverlay: actions.overlay.setOverlay,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AufgabeMenu: FC<Props> = (props) => {
  const handleClick = () => {
    props.setOverlay({ overlayId: AUFGABE_OVERLAY_ID, closeOthers: true })
  }

  return (
    <div className="video-editor__menu">
      <Button
        title="Aufgabe"
        className="btn btn-grey btn-sm video-editor__toolbar__button"
        onPress={handleClick}
      >
        <i className="fas fa-clipboard" />
      </Button>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AufgabeMenu))
