import { selectors, actions } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { CutOverlayIds } from '../CuttingMenu'
import CutListItem from 'Components/VideoEditor/CuttingContext/Overlays/CutListItem'
import Overlay from '../../components/Overlay'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

const mapStateToProps = (state: AppState) => ({
    cutList: selectors.data.solutions.selectCurrentCutIds(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.videoEditor.overlay.unsetOverlay,
}

type OwnProps = {
    // TODO: make readonly property a redux state
    itemUpdateCondition: boolean
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutlistOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(CutOverlayIds.allByCutOrder)
    }

    return (
        <Overlay closeCallback={close} title="Schnittreihenfolge">
            <ol className="video-editor__media-item-list-new">
                {props.cutList.map((id, index) => (
                    <CutListItem key={id} cutId={id} index={index} showPositionControls />
                ))}
            </ol>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(CutlistOverlay))
