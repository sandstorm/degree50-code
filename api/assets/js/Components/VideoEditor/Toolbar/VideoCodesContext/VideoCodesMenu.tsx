import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import MenuButton from '../MenuButton'
import MenuItem from '../MenuItem'

const prefix = 'VIDEO_CODE'
export const VideoCodeOverlayIds = {
    list: `{$prefix}/list`,
    active: `${prefix}/active`,
    create: `${prefix}/create`,
    all: `${prefix}/all`,
    edit: `${prefix}/edit`,
    remove: `${prefix}/remove`,
}

const mapStateToProps = (state: VideoEditorState) => {
    return {
        activeVideoCodeCount: selectors.selectActiveVideoCodeIds(state).length,
    }
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementIndex: actions.overlay.setCurrentlyEditedElementId,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

// TODO
// 1. Handle custom video codes pool / video code liste --> own menu entry
// 2. Create/Edit-UI --> no text, instead choose from available codes (still has memo) display code color

const VideoCodesMenu: FC<Props> = (props) => {
    return (
        <div className="video-editor__menu">
            {props.activeVideoCodeCount > 0 && (
                <div className="video-editor__menu__count-badge">{props.activeVideoCodeCount}</div>
            )}
            <MenuButton icon={<i className="fa fa-tag" />}>
                <MenuItem
                    label="Code-Liste"
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.list, closeOthers: true })}
                />
                <MenuItem
                    label="Aktive Codierungen"
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.active, closeOthers: true })}
                />
                <MenuItem
                    label="Erstelle Eintrag"
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.create, closeOthers: true })}
                />
                <MenuItem
                    label="Alle Codierungen"
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.all, closeOthers: true })}
                />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(VideoCodesMenu))
