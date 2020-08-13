import React from 'react'
import { Translate } from 'react-i18nify'

type Props = {
    contextMenuIsVisible: boolean
    posX: number
    posY: number
    removeMediaItem: () => void
    handleClose: () => void
}

const MediaItemContextMenu = ({ contextMenuIsVisible, posX, posY, removeMediaItem, handleClose }: Props) => {
    return (
        <div
            className="video-editor__media-items__contextmenu"
            style={{
                visibility: contextMenuIsVisible ? 'visible' : 'hidden',
                left: posX,
                top: posY,
            }}
        >
            <div
                className="video-editor__media-items__contextmenu-item"
                onClick={() => {
                    removeMediaItem()
                    handleClose()
                }}
            >
                <i className={'fas fa-trash'} /> <Translate value="delete" />
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
