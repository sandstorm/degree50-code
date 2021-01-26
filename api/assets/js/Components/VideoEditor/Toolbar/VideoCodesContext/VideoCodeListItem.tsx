import { VideoCodeId } from 'Components/VideoEditor/VideoCodesSlice'
import { VideoCodeOverlayIds } from 'Components/VideoEditor/Toolbar/VideoCodesContext/VideoCodesMenu'
import { actions, selectors, VideoEditorState } from 'Components/VideoEditor/VideoEditorSlice'
import React, { FC, memo } from 'react'
import { connect } from 'react-redux'
import End from '../../Editors/components/MediaItemList/Row/End'
import Start from '../../Editors/components/MediaItemList/Row/Start'

type OwnProps = {
    videoCodeId: VideoCodeId
}

const mapStateToProps = (state: VideoEditorState, ownProps: OwnProps) => ({
    item: selectors.data.videoCodes.selectVideoCodeById(state, ownProps),
})

const mapDispatchToProps = {
    setOverlay: actions.overlay.setOverlay,
    setCurrentlyEditedElementId: actions.overlay.setCurrentlyEditedElementId,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const VideoCodeListItem: FC<Props> = ({ item, setCurrentlyEditedElementId, setOverlay }) => {
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

        Text: ${item.text}
        Memo: ${item.memo}
    `

    return (
        <li tabIndex={0} aria-label={ariaLabel}>
            <Start start={item.start} />
            <End end={item.end} />
            <p>{item.text}</p>
            <p>{item.memo}</p>
            <button onClick={handleRemove}>Löschen</button>
            <button onClick={handleEdit}>Bearbeiten</button>
        </li>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(VideoCodeListItem))
