import { selectors, actions } from 'StimulusControllers/ExerciseAndSolutionStore/rootSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { CutOverlayIds } from '../CuttingMenu'
import Overlay from '../../components/Overlay'
import VideoContextPlayer from '../VideoContextPlayer/VideoContextPlayer'
import { AppState } from 'StimulusControllers/ExerciseAndSolutionStore/Store'

const mapStateToProps = (state: AppState) => ({
    cutList: selectors.data.selectCurrentCuts(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.videoEditor.overlay.unsetOverlay,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutPreviewOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(CutOverlayIds.cutPreview)
    }

    return (
        <Overlay closeCallback={close} title="Schnitt Ansehen">
            <VideoContextPlayer cutList={props.cutList} />
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(CutPreviewOverlay))
