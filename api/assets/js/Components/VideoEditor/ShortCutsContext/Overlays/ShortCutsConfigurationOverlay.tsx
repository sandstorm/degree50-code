import { actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { memo } from 'react'
import { connect } from 'react-redux'
import Overlay from '../../components/Overlay'
import { ShortCutsOverlayIds } from '../ShortCutsMenu'
import { shortCutIds, ShortCutsState } from '../ShortCutsSlice'
import ShortCutConfiguration from './ShortCutConfiguration'

const mapStateToProps = (state: { shortCuts: ShortCutsState }) => ({})

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ShortCutsConfigurationOverlay = (props: Props) => {
    const close = () => {
        props.closeOverlay(ShortCutsOverlayIds.configureShortCuts)
    }

    return (
        <Overlay closeCallback={close} title="Short Cut Konfiguration">
            {shortCutIds.map((shortCutId) => (
                <ShortCutConfiguration shortCutId={shortCutId} key={shortCutId} />
            ))}
        </Overlay>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(ShortCutsConfigurationOverlay))
