import React from 'react'
import MenuButton from '../MenuButton'
import MenuItem from '../MenuItem'
import { MediaLaneRenderConfigState, selectors, actions } from 'Components/VideoEditor/MediaLaneRenderConfigSlice'
import { MedialaneHeightModifier } from '../MediaLane/MediaTrack'
import { connect } from 'react-redux'
import { VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'

const getHeightModifierLabel = (modifier: MedialaneHeightModifier) => {
    return `${modifier * 100}%`
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        heightModifier: selectors.selectHeightModifier(state.videoEditor),
    }
}

const mapDispatchToProps = {
    setHeightModifier: actions.setHeightModifier,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const LaneHeightMenu = (props: Props) => {
    const heightModifierLabel = getHeightModifierLabel(props.heightModifier)
    const menuButtonLabel = `Zeilenhöhe: ${heightModifierLabel}`

    return (
        <div className="video-editor__menu">
            <MenuButton
                label={menuButtonLabel}
                ariaLabel={menuButtonLabel}
                pauseVideo
                className="media-lane-toolbar__menu-button"
                closeMenuOnItemSelect
            >
                <MenuItem ariaLabel="25% Höhe" label="25%" onClick={() => props.setHeightModifier(0.25)} />
                <MenuItem ariaLabel="50% Höhe" label="50%" onClick={() => props.setHeightModifier(0.5)} />
                <MenuItem ariaLabel="100% Höhe" label="100%" onClick={() => props.setHeightModifier(1)} />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(LaneHeightMenu))
