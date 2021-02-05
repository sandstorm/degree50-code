import Button from 'Components/Button/Button'
import { CutId } from 'Components/VideoEditor/CuttingContext/CuttingSlice'
import { CutOverlayIds } from 'Components/VideoEditor/CuttingContext/CuttingMenu'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import End from '../../../components/End'
import Start from '../../../components/Start'
import { secondToTime } from 'Components/VideoEditor/utils'
import PositionControls from './PositionControls'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'

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
    syncSolution: syncSolutionAction,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutListItem: FC<Props> = (props) => {
    const handleRemove = () => {
        props.setCurrentlyEditedElementId(props.item.id)
        props.setOverlay({ overlayId: CutOverlayIds.remove, closeOthers: false })
    }

    const handleEdit = () => {
        props.setCurrentlyEditedElementId(props.item.id)
        props.setOverlay({ overlayId: CutOverlayIds.edit, closeOthers: false })
    }

    const handleMoveUp = () => {
        props.moveUp(props.item.id)
        props.syncSolution()
    }

    const handleMoveDown = () => {
        props.moveDown(props.item.id)
        props.syncSolution()
    }

    const ariaLabel = `
        ${props.index + 1}. Element
        Von: ${props.item.start}
        Bis: ${props.item.end}

        Text: ${props.item.text}
        Memo: ${props.item.memo}
    `

    return (
        <li className="cut-list-item" tabIndex={0} aria-label={ariaLabel} data-focus-id={props.item.id}>
            <Start start={props.item.start} />
            <End end={props.item.end} />
            <p>Offset: {secondToTime(props.item.offset)}</p>
            <br />
            <p>Text: {props.item.text}</p>
            <p>Memo: {props.item.memo}</p>
            {props.showPositionControls && <PositionControls moveUp={handleMoveUp} moveDown={handleMoveDown} />}
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
