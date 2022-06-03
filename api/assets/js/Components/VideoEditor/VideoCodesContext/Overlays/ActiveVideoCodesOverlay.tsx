import {
  selectors,
  actions,
} from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { VideoCodeOverlayIds } from '../VideoCodesMenu'
import VideoCodeListItem from 'Components/VideoEditor/VideoCodesContext/Overlays/VideoCodeListItem'
import Overlay from '../../components/Overlay'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

const mapStateToProps = (state: AppState) => ({
  activeVideoCodeIds: selectors.selectAllActiveVideoCodeIdsAtCursor(state),
})

const mapDispatchToProps = {
  closeOverlay: actions.videoEditor.overlay.unsetOverlay,
}

type OwnProps = {
  // TODO: make readonly property a redux state
  itemUpdateCondition: boolean
}

type Props = OwnProps &
  ReturnType<typeof mapStateToProps> &
  typeof mapDispatchToProps

const ActiveVideoCodesOverlay: FC<Props> = (props) => {
  const close = () => {
    props.closeOverlay(VideoCodeOverlayIds.active)
  }

  return (
    <Overlay closeCallback={close} title="Aktive Codierungen">
      {props.activeVideoCodeIds.length > 0 ? (
        <ol className="video-editor__media-item-list-new">
          {props.activeVideoCodeIds.map((id, index) => (
            <VideoCodeListItem key={id} videoCodeId={id} index={index} />
          ))}
        </ol>
      ) : (
        <p tabIndex={0}>Keine Codierungen aktiv</p>
      )}
    </Overlay>
  )
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(memo(ActiveVideoCodesOverlay))
