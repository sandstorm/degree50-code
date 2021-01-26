import React from 'react'
import CloseButton from './CloseButton'

type Props = {
    closeCallback: () => void
    children: React.ReactNode
    title: string
}

const Overlay = ({ closeCallback, children, title }: Props) => {
    const handleKeyDown = (ev: React.KeyboardEvent<HTMLElement>) => {
        if (ev.key === 'Escape') {
            ev.preventDefault()
            closeCallback()
            return false
        }
    }

    return (
        <div className="video-editor__overlay" onKeyDown={handleKeyDown} aria-labelledby="overlay-title">
            <div className="video-editor__overlay__backdrop" onClick={closeCallback} />
            <div className="video-editor__overlay__content">
                <h3 className="video-editor__overlay__title">
                    <span>{title}</span>
                    <CloseButton onClick={closeCallback} />
                </h3>
                {children}
            </div>
        </div>
    )
}

export default React.memo(Overlay)
