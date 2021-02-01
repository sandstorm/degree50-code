import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { CutOverlayIds } from '../CuttingMenu'
import CutListItem from 'Components/VideoEditor/CuttingContext/Overlays/CutListItem'
import Overlay from '../../Toolbar/OverlayContainer/Overlay'

const mapStateToProps = (state: VideoEditorState) => ({
    cutList: selectors.data.cuts.selectCutIds(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
}

type OwnProps = {
    // TODO: make readonly property a redux state
    itemUpdateCondition: boolean
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const CutlisOverlay: FC<Props> = (props) => {
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

export default connect(mapStateToProps, mapDispatchToProps)(memo(CutlisOverlay))
