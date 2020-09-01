import React from 'react'

import DeleteAnnotationButton from './DeleteButton'
import AddAnnotationButton from './AddButton'

type Props = {
    addMediaItem?: () => void
    removeMediaItem: () => void
}

const Actions = ({ addMediaItem, removeMediaItem }: Props) => {
    return (
        <div
            className="video-editor__media-item-list__column video-editor__media-item-list__column--operation"
            style={{ width: 30 }}
        >
            <DeleteAnnotationButton removeMediaItem={removeMediaItem} />
            {addMediaItem && <AddAnnotationButton addMediaItem={addMediaItem} />}
        </div>
    )
}

export default React.memo(Actions)
