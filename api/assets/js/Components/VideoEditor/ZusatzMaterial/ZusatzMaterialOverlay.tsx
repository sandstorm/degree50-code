import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import MaterialViewer from 'StimulusControllers/ExercisePhaseApp/Components/MaterialViewer/MaterialViewer'
import Overlay from '../components/Overlay'
import { actions } from '../VideoEditorSlice'

export const ZUSATZ_MATERIAL_OVERLAY_ID = 'overlay/zusatz-material'

const mapDispatchToProps = {
    unsetOverlay: actions.overlay.unsetOverlay,
}

type Props = typeof mapDispatchToProps

const ZusatzMaterialOverlay: FC<Props> = (props) => {
    const handleClose = () => {
        props.unsetOverlay(ZUSATZ_MATERIAL_OVERLAY_ID)
    }

    return (
        <Overlay title="Zusatzmaterial" closeCallback={handleClose} fullWidth>
            <MaterialViewer />
        </Overlay>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(ZusatzMaterialOverlay))
