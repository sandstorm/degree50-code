import React, { useRef } from 'react'
import ReactDOM from 'react-dom'
import { Translate } from 'react-i18nify'

type Props = {
    contextMenuIsVisible: boolean
    posX: number
    posY: number
    removeMediaItem: () => void
    handleClose: () => void
}

const MediaItemContextMenu = ({ contextMenuIsVisible, posX, posY, removeMediaItem, handleClose }: Props) => {
    const timeOut = useRef<NodeJS.Timeout | null>(null)

    const domEl = document.getElementById('media-item-context-menu')
    if (!domEl) return null

    const handleOnMouseOut = () => {
        // eslint-disable-next-line
        timeOut.current = setTimeout(() => {
            handleClose()
        }, 250)
    }

    const handleOnMouseOver = () => {
        if (timeOut.current) {
            clearTimeout(timeOut.current)
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
