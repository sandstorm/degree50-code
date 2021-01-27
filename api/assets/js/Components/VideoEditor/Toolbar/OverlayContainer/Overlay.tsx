import React from 'react'

type Props = {
    closeCallback: () => void
    children: React.ReactNode
}

const Overlay = ({ closeCallback, children }: Props) => {
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
            <div className="video-editor__overlay__content">{children}</div>
        </div>
    )
}

export default React.memo(Overlay)
