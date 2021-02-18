import Button from 'Components/Button/Button'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import { ConfigStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { actions } from '../VideoEditorSlice'
import { ZUSATZ_MATERIAL_OVERLAY_ID } from './ZusatzMaterialOverlay'

const mapStateToProps = (state: ConfigStateSlice) => ({})

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ZusatzMaterialMenu: FC<Props> = (props) => {
    const handleClick = () => {
        props.setOverlay({ overlayId: ZUSATZ_MATERIAL_OVERLAY_ID, closeOthers: true })
    }

    return (
        <div className="video-editor__menu">
            <Button
                title="Zusatzmaterialien"
                className="btn btn-grey btn-sm video-editor__toolbar__button"
                onPress={handleClick}
            >
                <i className="fas fa-folder-open" />
            </Button>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(ZusatzMaterialMenu))
