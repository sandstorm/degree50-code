import React from 'react'

import DeleteAnnotationButton from './DeleteButton'
import AddAnnotationButton from './AddButton'
import MoveUpButton from './MoveUpButton'
import MoveDownButton from './MoveDownButton'

type Props = {
    addMediaItem?: () => void
    removeMediaItem: () => void
    moveItemUp?: () => void
    moveItemDown?: () => void
}

const Actions = ({ moveItemUp, moveItemDown, addMediaItem, removeMediaItem }: Props) => {
    return (
        <div
            className="video-editor__media-item-list__column video-editor__media-item-list__column--operation"
            style={{ width: 30 }}
        >
            {moveItemUp && <MoveUpButton moveUp={moveItemUp} />}
            <DeleteAnnotationButton removeMediaItem={removeMediaItem} />
            {addMediaItem && <AddAnnotationButton addMediaItem={addMediaItem} />}
            {moveItemDown && <MoveDownButton moveDown={moveItemDown} />}
        </div>
    )
}

export default React.memo(Actions)
