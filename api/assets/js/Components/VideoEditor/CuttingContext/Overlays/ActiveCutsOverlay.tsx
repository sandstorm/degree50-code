import { VideoEditorState, selectors, actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { CutOverlayIds } from '../CuttingMenu'
import CutListItem from 'Components/VideoEditor/CuttingContext/Overlays/CutListItem'
import Overlay from '../../components/Overlay'

const mapStateToProps = (state: VideoEditorState) => ({
    activeCutIds: selectors.selectActiveCutIds(state),
})

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
}

type OwnProps = {
    // TODO: make readonly property a redux state
    itemUpdateCondition: boolean
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ActiveCutsOverlay: FC<Props> = (props) => {
    const close = () => {
        props.closeOverlay(CutOverlayIds.active)
    }

    return (
        <Overlay closeCallback={close} title="Aktive Schnitte">
            {props.activeCutIds.length > 0 ? (
                <ol className="video-editor__media-item-list-new">
                    {props.activeCutIds.map((id, index) => (
                        <CutListItem key={id} cutId={id} index={index} />
                    ))}
                </ol>
            ) : (
                <p>Keine Cuten aktiv</p>
            )}
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(ActiveCutsOverlay))
