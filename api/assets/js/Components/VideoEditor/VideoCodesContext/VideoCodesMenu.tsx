import { actions, selectors as videoEditorSelectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import {
    ConfigStateSlice,
    selectors as configSelectors,
} from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import MenuButton from '../components/MenuButton'
import MenuItem from '../components/MenuItem'
import { ExercisePhaseTypesEnum } from 'StimulusControllers/ExercisePhaseApp/Store/ExercisePhaseTypesEnum'

const prefix = 'VIDEO_CODE'
export const VideoCodeOverlayIds = {
    list: `{$prefix}/list`,
    active: `${prefix}/active`,
    create: `${prefix}/create`,
    all: `${prefix}/all`,
    edit: `${prefix}/edit`,
    editPrototype: `${prefix}/editPrototype`,
    remove: `${prefix}/remove`,
    removePrototype: `${prefix}/removePrototype`,
}

const mapStateToProps = (state: VideoEditorState & ConfigStateSlice) => {
    return {
        allVideoCodesCount: videoEditorSelectors.selectAllVideoCodeIdsByStartTime(state).length,
        activeVideoCodeCount: videoEditorSelectors.selectAllActiveVideoCodeIdsAtCursor(state).length,
        activePhase: configSelectors.selectPhaseType(state),
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
    const activeCodesLabel = `Aktive Codierungen (${props.activeVideoCodeCount})`
    const allCodesLabel = `Alle Codierungen (${props.allVideoCodesCount})`

    return (
        <div className="video-editor__menu">
            {props.activeVideoCodeCount > 0 && (
                <div className="video-editor__menu__count-badge">{props.activeVideoCodeCount}</div>
            )}
            <MenuButton icon={<i className="fa fa-tag" />} ariaLabel="Codierungen">
                <MenuItem
                    ariaLabel={activeCodesLabel}
                    label={activeCodesLabel}
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.active, closeOthers: true })}
                />
                <MenuItem
                    ariaLabel="Erstelle Codierung"
                    label="Erstelle Codierung"
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.create, closeOthers: true })}
                    disabled={props.activePhase === ExercisePhaseTypesEnum.VIDEO_CUTTING}
                />
                <MenuItem
                    ariaLabel={allCodesLabel}
                    label={allCodesLabel}
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.all, closeOthers: true })}
                />
                <MenuItem
                    ariaLabel="Code-Liste"
                    label="Code-Liste"
                    onClick={() => props.setOverlay({ overlayId: VideoCodeOverlayIds.list, closeOthers: true })}
                    disabled={props.activePhase === ExercisePhaseTypesEnum.VIDEO_CUTTING}
                />
            </MenuButton>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(VideoCodesMenu))
