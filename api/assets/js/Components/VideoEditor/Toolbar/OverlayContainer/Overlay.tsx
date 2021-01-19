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

    return <div onKeyDown={handleKeyDown}>{children}</div>
}

export default React.memo(Overlay)
