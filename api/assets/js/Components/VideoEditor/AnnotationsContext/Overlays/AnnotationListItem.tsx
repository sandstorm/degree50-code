import Button from 'Components/Button/Button'
import { AnnotationId } from 'Components/VideoEditor/AnnotationsContext/AnnotationsSlice'
import { AnnotationOverlayIds } from 'Components/VideoEditor/AnnotationsContext/AnnotationsMenu'
import {
  actions,
  selectors,
} from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import { memo } from 'react'
import { connect, ConnectedProps } from 'react-redux'
import End from '../../components/End'
import Start from '../../components/Start'
import { t2d } from 'duration-time-conversion'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

type OwnProps = {
  annotationId: AnnotationId
  index: number
}

const mapStateToProps = (state: AppState, ownProps: OwnProps) => {
  const item = selectors.data.annotations.selectAnnotationById(state, ownProps)
  const canEdit = selectors.selectUserCanEditSolution(state, {
    solutionId: item.solutionId,
  })

  return {
    item,
    canEdit,
    isFromCurrentSolution: selectors.data.selectAnnotationIsFromCurrentSolution(
      state,
      ownProps
    ),
    creatorName: selectors.data.selectCreatorNameForAnnotation(state, ownProps),
  }
}

const mapDispatchToProps = {
  setOverlay: actions.videoEditor.overlay.setOverlay,
  setCurrentlyEditedElementId:
    actions.videoEditor.overlay.setCurrentlyEditedElementId,
  setPlayPosition: actions.videoEditor.player.setPlayPosition,
}

const connector = connect(mapStateToProps, mapDispatchToProps)

type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & OwnProps

const AnnotationListItem = (props: Props) => {
  const { item, index, setCurrentlyEditedElementId, setOverlay } = props

  const handleRemove = () => {
    setCurrentlyEditedElementId(item.id)
    setOverlay({ overlayId: AnnotationOverlayIds.remove, closeOthers: false })
  }

  const handleEdit = () => {
    setCurrentlyEditedElementId(item.id)
    setOverlay({ overlayId: AnnotationOverlayIds.edit, closeOthers: false })
  }

  const handleJumpToPosition = () => {
    props.setPlayPosition(t2d(item.start))
  }

  const creatorDescription = `Annotation von: ${props.creatorName}`

  const ariaLabel = `
        ${index + 1}. Element

        Beschreibung: ${item.text}
        Beschreibung zu Ende.

        ${creatorDescription}

        Von: ${item.start}
        Bis: ${item.end}

        ${item.memo.length > 0 ? `Memo: ${item.memo}` : ''}
    `

  return (
    <li
      className="annotation-list-item"
      tabIndex={0}
      aria-label={ariaLabel}
      data-focus-id={item.id}
    >
      <p>Beschreibung: {item.text}</p>
      <p>{creatorDescription}</p>
      <Start start={item.start} />
      <End end={item.end} />
      <br />
      {item.memo.length > 0 && <p>Memo: {item.memo}</p>}
      <Button
        className="btn btn-primary"
        onPress={handleJumpToPosition}
        title="Springe zu Position im Video"
      >
        Springe zu Position
      </Button>
      {props.isFromCurrentSolution && (
        <>
          <Button
            className="btn btn-secondary"
            onPress={handleRemove}
            title="Annotation Löschen"
          >
            Löschen
          </Button>
          <Button
            className="btn btn-primary"
            onPress={handleEdit}
            title="Annotation Bearbeiten"
          >
            Bearbeiten
          </Button>
        </>
      )}
    </li>
  )
}

export default connector(memo(AnnotationListItem))
