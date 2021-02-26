import Button from 'Components/Button/Button'
import { AnnotationId } from 'Components/VideoEditor/AnnotationsContext/AnnotationsSlice'
import { AnnotationOverlayIds } from 'Components/VideoEditor/AnnotationsContext/AnnotationsMenu'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { memo } from 'react'
import { connect } from 'react-redux'
import End from '../../components/End'
import Start from '../../components/Start'
import { ConfigStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { CurrentEditorStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import { selectUserCanEditSolution } from 'StimulusControllers/ExerciseAndSolutionStore/Store'
import { t2d } from 'duration-time-conversion'

type OwnProps = {
    annotationId: AnnotationId
    index: number
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice & CurrentEditorStateSlice, ownProps: OwnProps) => {
    const item = selectors.data.annotations.selectAnnotationById(state, ownProps)
    const canEdit = selectUserCanEditSolution(state, { solutionId: item.solutionId })

    return {
        item,
        canEdit,
        isFromCurrentSolution: selectors.data.selectAnnotationIsFromCurrentSolution(state, ownProps),
        creatorName: selectors.data.selectCreatorNameForAnnotation(state, ownProps),
    }
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
    setPlayPosition: actions.player.setPlayPosition,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

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

        ${creatorDescription}

        Von: ${item.start}
        Bis: ${item.end}

        Text: ${item.text}
        Memo: ${item.memo}
    `

    return (
        <li className="annotation-list-item" tabIndex={0} aria-label={ariaLabel} data-focus-id={item.id}>
            <p>{creatorDescription}</p>
            <Start start={item.start} />
            <End end={item.end} />
            <br />
            <p>Text: {item.text}</p>
            <p>Memo: {item.memo}</p>
            <Button className="btn btn-primary" onPress={handleJumpToPosition} title="Springe zu Position im Video">
                Springe zu Position
            </Button>
            {props.isFromCurrentSolution && (
                <>
                    <Button className="btn btn-secondary" onPress={handleRemove}>
                        Löschen
                    </Button>
                    <Button className="btn btn-primary" onPress={handleEdit}>
                        Bearbeiten
                    </Button>
                </>
            )}
        </li>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AnnotationListItem))
