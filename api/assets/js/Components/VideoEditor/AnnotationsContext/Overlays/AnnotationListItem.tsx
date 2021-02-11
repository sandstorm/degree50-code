import Button from 'Components/Button/Button'
import { AnnotationId } from 'Components/VideoEditor/AnnotationsContext/AnnotationsSlice'
import { AnnotationOverlayIds } from 'Components/VideoEditor/AnnotationsContext/AnnotationsMenu'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { memo } from 'react'
import { connect } from 'react-redux'
import End from '../../components/End'
import Start from '../../components/Start'

type OwnProps = {
    annotationId: AnnotationId
    index: number
}

const mapStateToProps = (state: VideoEditorState, ownProps: OwnProps) => ({
    item: selectors.data.annotations.selectAnnotationById(state, ownProps),
    isFromCurrentSolution: selectors.data.selectAnnotationIsFromCurrentSolution(state, ownProps),
    creatorName: selectors.data.selectCreatorNameForAnnotation(state, ownProps),
})

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
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
