import React from 'react'

type Props = {
    addMediaItemCallback: () => void
    children: React.ReactNodeArray | React.ReactNode
}

const AddItemButton = ({ addMediaItemCallback, children }: Props) => {
    return (
        <button
            className={['video-editor__media-items__add-item', 'btn', 'btn-outline-primary'].join(' ').trim()}
            onClick={addMediaItemCallback}
        >
            {children}
        </button>
    )
}

export default React.memo(AddItemButton)
