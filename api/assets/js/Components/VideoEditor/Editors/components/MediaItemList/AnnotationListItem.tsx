import { AnnotationId } from 'Components/VideoEditor/AnnotationsSlice'
import { AnnotationOverlayIds } from 'Components/VideoEditor/Toolbar/AnnotationsContext/AnnotationsMenu'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import End from './Row/End'
import Start from './Row/Start'

type OwnProps = {
    annotationId: AnnotationId
}

const mapStateToProps = (state: VideoEditorState, ownProps: OwnProps) => ({
    item: selectors.data.annotations.selectAnnotationById(state, ownProps),
})

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AnnotationListItem: FC<Props> = ({ item, setCurrentlyEditedElementId, setOverlay }) => {
    const handleRemove = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: AnnotationOverlayIds.remove, closeOthers: false })
    }

    const handleEdit = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: AnnotationOverlayIds.edit, closeOthers: false })
    }

    const ariaLabel = `
        Von: ${item.start}
        Bis: ${item.end}

        Text: ${item.text}
        Memo: ${item.memo}
    `

    return (
        <li tabIndex={0} aria-label={ariaLabel}>
            <Start start={item.start} />
            <End end={item.end} />
            <p>{item.text}</p>
            <p>{item.memo}</p>
            <button onClick={handleRemove}>Löschen</button>
            <button onClick={handleEdit}>Bearbeiten</button>
        </li>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AnnotationListItem))
