import { VideoCodeId, VideoCodesStateSlice } from 'Components/VideoEditor/VideoCodesContext/VideoCodesSlice'
import { VideoCodeOverlayIds } from 'Components/VideoEditor/VideoCodesContext/VideoCodesMenu'
import Button from 'Components/Button/Button'
import { actions, selectors } from 'Components/VideoEditor/VideoEditorSlice'
import React, { memo } from 'react'
import { connect } from 'react-redux'
import End from '../../../components/End'
import Start from '../../../components/Start'
import { VideoCodePoolStateSlice } from 'Components/VideoEditor/VideoCodesContext/VideoCodePrototypesSlice'
import PrototypeInformation from './PrototypeInformation'
import { SolutionStateSlice } from 'Components/VideoEditor/SolutionSlice'
import { CurrentEditorStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Presence/CurrentEditorSlice'
import { ConfigStateSlice } from 'StimulusControllers/ExercisePhaseApp/Components/Config/ConfigSlice'
import { selectUserCanEditSolution } from 'StimulusControllers/ExerciseAndSolutionStore/Store'
import { t2d } from 'duration-time-conversion'
import { getColorName } from 'ntc-ts'

type OwnProps = {
    videoCodeId: VideoCodeId
    index: number
}

const mapStateToProps = (
    state: VideoCodesStateSlice &
        SolutionStateSlice &
        VideoCodePoolStateSlice &
        CurrentEditorStateSlice &
        ConfigStateSlice,
    ownProps: OwnProps
) => {
    const item = selectors.data.videoCodes.selectVideoCodeById(state, ownProps)
    const canEdit = selectUserCanEditSolution(state, { solutionId: item.solutionId })
    const videoCodePrototype = item.idFromPrototype
        ? selectors.data.videoCodePrototypes.selectPrototypeById(state, { videoCodeId: item.idFromPrototype })
        : undefined

    const parentVideoCodePrototype = videoCodePrototype?.parentId
        ? selectors.data.videoCodePrototypes.selectPrototypeById(state, { videoCodeId: videoCodePrototype.parentId })
        : undefined

    return {
        item,
        canEdit,
        videoCodePrototype,
        parentVideoCodePrototype,
        isFromCurrentSolution: selectors.data.selectVideoCodeIsFromCurrentSolution(state, ownProps),
        creatorName: selectors.data.selectCreatorNameForVideoCode(state, ownProps),
    }
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
    setPlayPosition: actions.player.setPlayPosition,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const VideoCodeListItem = (props: Props) => {
    const { item, setCurrentlyEditedElementId, setOverlay, videoCodePrototype, index, parentVideoCodePrototype } = props

    const handleRemove = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: VideoCodeOverlayIds.remove, closeOthers: false })
    }

    const handleEdit = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: VideoCodeOverlayIds.edit, closeOthers: false })
    }

    const handleJumpToPosition = () => {
        props.setPlayPosition(t2d(item.start))
    }

    const creatorDescription = `Codierung von: ${props.creatorName}`

    /**
     * WHY:
     * This will be read by the screen reader when the list element if focused (when tabbing through list).
     *
     * Example:
     * "
     *   1. Element
     *
     *   Code: Gelungener Einsatz von Medien.
     *   Farbe: Grün.
     *   Vordefinierter Video Code.
     *
     *   Codierung von student@sandstorm.de
     *
     *   Von: 00:00:00
     *   Bis: 00:04:20
     *
     *   Memo: Gut gemacht.
     * "
     * oder
     * "
     *   2. Element
     *
     *   Code: Smart Whiteboard.
     *   Farbe: Grün.
     *   Selbsterstellter Video Code.
     *   Unter-Code von Gelungener Einsatz von Medien.
     *
     *   Codierung von student2@sandstorm.de
     *
     *   Von: 00:01:23
     *   Bis: 00:02:42
     *
     *   Memo: Klasse Einsatz des Smart Whiteboards.
     * "
     */
    const ariaLabel = `
        ${index + 1}. Element

        Code: ${videoCodePrototype?.name ?? 'Kein Code ausgewählt'}
        Farbe: ${videoCodePrototype?.color ? getColorName(videoCodePrototype.color).name : ''}
        ${videoCodePrototype?.userCreated ? 'Selbsterstellter Code' : 'Vordefinierter Code'}
        ${parentVideoCodePrototype ? `Unter-Code von ${parentVideoCodePrototype.name}` : ''}

        ${creatorDescription}

        Von: ${item.start}
        Bis: ${item.end}

        Memo: ${item.memo}
    `

    return (
        <li tabIndex={0} aria-label={ariaLabel}>
            <p>{creatorDescription}</p>
            <Start start={item.start} />
            <End end={item.end} />
            <PrototypeInformation videoCodePrototype={videoCodePrototype} />
            <p>Memo: {item.memo}</p>
            <Button className="btn btn-primary" onPress={handleJumpToPosition} title="Springe zu Position im Video">
                Springe zu Position
            </Button>
            {props.isFromCurrentSolution && (
                <>
                    <Button className="btn btn-secondary" onPress={handleRemove} title="Codierung Löschen">
                        Löschen
                    </Button>
                    <Button className="btn btn-primary" onPress={handleEdit} title="Codierung Bearbeiten">
                        Bearbeiten
                    </Button>
                </>
            )}
        </li>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(VideoCodeListItem))
