import React from 'react'
import ReactDOM from 'react-dom'
import { Translate } from 'react-i18nify'

type Props = {
    contextMenuIsVisible: boolean
    posX: number
    posY: number
    removeMediaItem: () => void
    addMemoToMediaItem: () => void
    handleClose: () => void
}

const MediaItemContextMenu = ({
    contextMenuIsVisible,
    posX,
    posY,
    removeMediaItem,
    addMemoToMediaItem,
    handleClose,
}: Props) => {
    const domEl = document.getElementById('media-item-context-menu')
    if (!domEl) return null

    let timer: any

    const handleOnMouseOut = () => {
        timer = setTimeout(() => {
            handleClose()
        }, 250)
    }

    const handleOnMouseOver = () => {
        if (timer) {
            clearTimeout(timer)
        }
    }

    return ReactDOM.createPortal(
        <div
            className="video-editor__media-items__contextmenu"
            style={{
                visibility: contextMenuIsVisible ? 'visible' : 'hidden',
                left: posX,
                top: posY,
            }}
            onMouseOut={handleOnMouseOut}
            onMouseOver={handleOnMouseOver}
        >
            <div
                className="video-editor__media-items__contextmenu-item"
                onClick={() => {
                    addMemoToMediaItem()
                    handleClose()
                }}
            >
                <i className={'far fa-file-alt'} /> Edit Memo
            </div>
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
        </div>,
        domEl
    )
}

export default React.memo(MediaItemContextMenu)
