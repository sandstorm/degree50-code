import React from 'react'
import { Translate } from 'react-i18nify'

type Props = {
    contextMenuIsVisible: boolean
    removeMediaItem: () => void
    handleClose: () => void
}

const MediaItemContextMenu = ({ contextMenuIsVisible, removeMediaItem, handleClose }: Props) => {
    return (
        <div
            className="video-editor__media-items__contextmenu"
            style={{
                visibility: contextMenuIsVisible ? 'visible' : 'hidden',
            }}
        >
            <div
                className="video-editor__media-items__contextmenu-item"
                onClick={() => {
                    removeMediaItem()
                    handleClose()
                }}
            >
                <Translate value="delete" />
            </div>
            <div
                className="video-editor__media-items__contextmenu-item"
                onClick={() => {
                    handleClose()
                }}
            >
                <Translate value="close" />
            </div>
        </div>
    )
}

export default React.memo(MediaItemContextMenu)
