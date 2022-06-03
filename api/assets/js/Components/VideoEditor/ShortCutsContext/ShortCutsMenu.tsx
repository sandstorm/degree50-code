import React, { memo } from 'react'
import { connect } from 'react-redux'
import { actions } from '../VideoEditorSlice'
import Button from '../../Button/Button'

const prefix = 'SHORT_CUTS'
export const ShortCutsOverlayIds = {
  configureShortCuts: `${prefix}/configureShortCuts`,
}

const mapDispatchToProps = {
  setOverlay: actions.overlay.setOverlay,
}

type Props = typeof mapDispatchToProps

const ShortCutsMenu = (props: Props) => {
  const handleClick = () =>
    props.setOverlay({
      overlayId: ShortCutsOverlayIds.configureShortCuts,
      closeOthers: true,
    })

  return (
    <div className="video-editor__menu">
      <Button
        title="Tastenkombination zur Bedienung"
        className="btn btn-grey btn-sm video-editor__toolbar__button"
        onPress={handleClick}
      >
        <i className="fas fa-keyboard" />
      </Button>
    </div>
  )
}

export default connect(undefined, mapDispatchToProps)(memo(ShortCutsMenu))
