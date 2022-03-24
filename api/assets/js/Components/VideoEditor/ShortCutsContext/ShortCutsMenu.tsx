import React, { memo } from 'react'
import { connect } from 'react-redux'
import { actions } from '../VideoEditorSlice'
import MenuButton from '../components/MenuButton'
import MenuItem from '../components/MenuItem'

const prefix = 'SHORT_CUTS'
export const ShortCutsOverlayIds = {
    configureShortCuts: `${prefix}/configureShortCuts`,
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
}

type Props = typeof mapDispatchToProps

const ShortCutsMenu = (props: Props) => {
    const label = 'ShortCuts anpassen'

    return (
        <div className="video-editor__menu">
            <MenuButton icon={<i className="fas  fa-universal-access" />} ariaLabel="Filter">
                <MenuItem
                    ariaLabel={label}
                    label={label}
                    onClick={() =>
                        props.setOverlay({ overlayId: ShortCutsOverlayIds.configureShortCuts, closeOthers: true })
                    }
                />
            </MenuButton>
        </div>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(ShortCutsMenu))
