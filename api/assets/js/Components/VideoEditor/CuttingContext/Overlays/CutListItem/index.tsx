import Button from 'Components/Button/Button'
import { CutId } from 'Components/VideoEditor/CuttingContext/CuttingSlice'
import { CutOverlayIds } from 'Components/VideoEditor/CuttingContext/CuttingMenu'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import End from '../../../Editors/components/MediaItemList/Row/End'
import Start from '../../../Editors/components/MediaItemList/Row/Start'
import { secondToTime } from 'Components/VideoEditor/Editors/utils'
import PositionControls from './PositionControls'

type OwnProps = {
    cutId: CutId
    index: number
    showPositionControls?: boolean
}

const mapStateToProps = (state: VideoEditorState, ownProps: OwnProps) => ({
    item: selectors.data.cuts.selectCutById(state, ownProps),
})

const mapDispatchToProps = {
    moveUp: actions.data.cuts.moveUp,
    moveDown: actions.data.cuts.moveDown,
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutListItem: FC<Props> = ({
    item,
    index,
    setCurrentlyEditedElementId,
    setOverlay,
    showPositionControls,
    moveUp,
    moveDown,
}) => {
    const handleRemove = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: CutOverlayIds.remove, closeOthers: false })
    }

    const handleEdit = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: CutOverlayIds.edit, closeOthers: false })
    }

    const ariaLabel = `
        ${index + 1}. Element
        Von: ${item.start}
        Bis: ${item.end}

        Text: ${item.text}
        Memo: ${item.memo}
    `

    return (
        <li className="cut-list-item" tabIndex={0} aria-label={ariaLabel} data-focus-id={item.id}>
            {showPositionControls && (
                <PositionControls moveUp={() => moveUp(item.id)} moveDown={() => moveDown(item.id)} />
            )}
            <Start start={item.start} />
            <End end={item.end} />
            <p>Offset: {secondToTime(item.offset)}</p>
            <br />
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

export default connect(mapStateToProps, mapDispatchToProps)(memo(CutListItem))
