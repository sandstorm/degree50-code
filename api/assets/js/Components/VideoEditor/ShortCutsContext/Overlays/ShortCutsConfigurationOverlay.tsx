import { actions } from 'Components/VideoEditor/VideoEditorSlice'
import React, { memo } from 'react'
import { connect } from 'react-redux'
import Overlay from '../../components/Overlay'
import { ShortCutsOverlayIds } from '../ShortCutsMenu'
import { shortCutIds } from '../ShortCutsSlice'
import ShortCutConfiguration from './ShortCutConfiguration'

const mapDispatchToProps = {
    closeOverlay: actions.overlay.unsetOverlay,
}

type Props = typeof mapDispatchToProps

const ShortCutsConfigurationOverlay = (props: Props) => {
    const close = () => {
        props.closeOverlay(ShortCutsOverlayIds.configureShortCuts)
    }

    return (
        <Overlay closeCallback={close} title="Tastenkombinationen">
            <p className="short-cut-configuration__info-block">
                <i className="fas fa-info-circle" />
                <span>Hinweis: Änderungen werden sofort übernommen.</span>
            </p>
            {shortCutIds.map((shortCutId) => (
                <ShortCutConfiguration shortCutId={shortCutId} key={shortCutId} />
            ))}
        </Overlay>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(ShortCutsConfigurationOverlay))
