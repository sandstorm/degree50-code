import Button from 'Components/Button/Button'
import { AnnotationId } from 'Components/VideoEditor/AnnotationsContext/AnnotationsSlice'
import { AnnotationOverlayIds } from 'Components/VideoEditor/AnnotationsContext/AnnotationsMenu'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import End from '../../components/End'
import Start from '../../components/Start'

type OwnProps = {
    annotationId: AnnotationId
    index: number
}

const mapStateToProps = (state: VideoEditorState, ownProps: OwnProps) => ({
    item: selectors.data.annotations.selectAnnotationById(state, ownProps),
})

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AnnotationListItem: FC<Props> = ({ item, index, setCurrentlyEditedElementId, setOverlay }) => {
    const handleRemove = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: AnnotationOverlayIds.remove, closeOthers: false })
    }

    const handleEdit = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: AnnotationOverlayIds.edit, closeOthers: false })
    }

    const ariaLabel = `
        ${index + 1}. Element
        Von: ${item.start}
        Bis: ${item.end}

        Text: ${item.text}
        Memo: ${item.memo}
    `

    return (
        <li className="annotation-list-item" tabIndex={0} aria-label={ariaLabel} data-focus-id={item.id}>
            <Start start={item.start} />
            <End end={item.end} />
            <p>Text: {item.text}</p>
            <p>Memo: {item.memo}</p>
            <Button className="btn btn-secondary" onPress={handleRemove}>
                Löschen
            </Button>
            <Button className="btn btn-primary" onPress={handleEdit}>
                Bearbeiten
            </Button>
        </li>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AnnotationListItem))
