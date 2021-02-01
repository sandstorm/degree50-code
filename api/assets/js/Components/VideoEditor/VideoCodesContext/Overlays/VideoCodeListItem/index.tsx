import { VideoCodeId, VideoCodesSlice } from 'Components/VideoEditor/VideoCodesContext/VideoCodesSlice'
import { VideoCodeOverlayIds } from 'Components/VideoEditor/VideoCodesContext/VideoCodesMenu'
import Button from 'Components/Button/Button'
import { actions, selectors } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import End from '../../../components/End'
import Start from '../../../components/Start'
import { VideoCodePoolStateSlice } from 'Components/VideoEditor/VideoCodesContext/VideoCodePoolSlice'
import PrototypeInformation from './PrototypeInformation'

type OwnProps = {
    videoCodeId: VideoCodeId
}

const mapStateToProps = (state: VideoCodesSlice & VideoCodePoolStateSlice, ownProps: OwnProps) => {
    const item = selectors.data.videoCodes.selectVideoCodeById(state, ownProps)
    const videoCodePrototype = item.idFromPrototype
        ? selectors.data.videoCodePool.selectVideoCodeById(state, { videoCodeId: item.idFromPrototype })
        : undefined

    return {
        item,
        videoCodePrototype,
    }
}

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const VideoCodeListItem: FC<Props> = ({ item, setCurrentlyEditedElementId, setOverlay, videoCodePrototype }) => {
    const handleRemove = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: VideoCodeOverlayIds.remove, closeOthers: false })
    }

    const handleEdit = () => {
        setCurrentlyEditedElementId(item.id)
        setOverlay({ overlayId: VideoCodeOverlayIds.edit, closeOthers: false })
    }

    const ariaLabel = `
        Von: ${item.start}
        Bis: ${item.end}

        Code: ${videoCodePrototype?.name ?? 'Kein Code ausgewählt'}
        Memo: ${item.memo}
    `

    return (
        <li tabIndex={0} aria-label={ariaLabel}>
            <Start start={item.start} />
            <End end={item.end} />
            <PrototypeInformation videoCodePrototype={videoCodePrototype} />
            <p>Memo: {item.memo}</p>
            <Button className="btn btn-secondary" onPress={handleRemove}>
                Löschen
            </Button>
            <Button className="btn btn-primary" onPress={handleEdit}>
                Bearbeiten
            </Button>
        </li>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(VideoCodeListItem))
