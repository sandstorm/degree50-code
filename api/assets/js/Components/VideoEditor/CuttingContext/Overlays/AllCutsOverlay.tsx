import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { CutOverlayIds } from '../CuttingMenu'
import CutListItem from 'Components/VideoEditor/CuttingContext/Overlays/CutListItem'
import Overlay from '../../Toolbar/OverlayContainer/Overlay'

const mapStateToProps = (state: VideoEditorState) => ({
    cutIdsByStartTime: selectors.data.cuts.selectIdsSortedByStartTime(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
}

type OwnProps = {
    // TODO: make readonly property a redux state
    itemUpdateCondition: boolean
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const AllCutsOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(CutOverlayIds.all)
    }

    return (
        <Overlay closeCallback={close} title="Alle Schnitte">
            <ol className="video-editor__media-item-list-new">
                {props.cutIdsByStartTime.map((id, index) => (
                    <CutListItem key={id} cutId={id} index={index} />
                ))}
            </ol>
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(AllCutsOverlay))
