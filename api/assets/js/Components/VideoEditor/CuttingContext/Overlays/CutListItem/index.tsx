import Button from 'Components/Button/Button'
import { CutId } from 'Components/VideoEditor/CuttingContext/CuttingSlice'
import { CutOverlayIds } from 'Components/VideoEditor/CuttingContext/CuttingMenu'
import { actions, selectors } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import End from '../../../components/End'
import Start from '../../../components/Start'
import PositionControls from './PositionControls'
import { syncSolutionAction } from 'StimulusControllers/ExercisePhaseApp/Components/Solution/SolutionSaga'
import { t2d } from 'duration-time-conversion'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

type OwnProps = {
    cutId: CutId
    index: number
    showPositionControls?: boolean
}

const mapStateToProps = (state: AppState, ownProps: OwnProps) => {
    const item = selectors.data.cuts.selectCutById(state, ownProps)
    const canEdit = selectors.selectUserCanEditSolution(state, { solutionId: item.solutionId })

    return {
        item,
        canEdit,
        creatorName: selectors.data.selectCreatorNameForCut(state, ownProps),
    }
}

const mapDispatchToProps = {
    moveUp: actions.data.solutions.moveCutUp,
    moveDown: actions.data.solutions.moveCutDown,
    setOverlay: actions.videoEditor.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.videoEditor.overlay.setCurrentlyEditedElementId,
    syncSolution: syncSolutionAction,
    setPlayPosition: actions.videoEditor.player.setPlayPosition,
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

    const handleJumpToPosition = () => {
        props.setPlayPosition(t2d(props.item.start))
    }

    const creatorDescription = `Schnitt von: ${props.creatorName}`

    const ariaLabel = `
        ${props.index + 1}. Element

        Beschreibung: ${props.item.text}

        ${creatorDescription}

        Von: ${props.item.start}
        Bis: ${props.item.end}

        ${props.item.memo.length > 0 ? `Memo: ${props.item.memo}` : ''}
    `

    return (
        <li className="cut-list-item" tabIndex={0} aria-label={ariaLabel} data-focus-id={props.item.id}>
            <p>Beschreibung: {props.item.text}</p>
            <p>{creatorDescription}</p>
            <Start start={props.item.start} />
            <End end={props.item.end} />
            <br />
            {props.item.memo.length > 0 && <p>Memo: {props.item.memo}</p>}
            <Button className="btn btn-primary" onPress={handleJumpToPosition} title="Springe zu Position im Video">
                Springe zu Position
            </Button>
            {props.showPositionControls && <PositionControls moveUp={handleMoveUp} moveDown={handleMoveDown} />}
            {props.canEdit && (
                <>
                    <Button className="btn btn-secondary" onPress={handleRemove} title="Schnitt Löschen">
                        Löschen
                    </Button>
                    <Button className="btn btn-primary" onPress={handleEdit} title="Schnitt Bearbeiten">
                        Bearbeiten
                    </Button>
                </>
            )}
        </li>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(CutListItem))
