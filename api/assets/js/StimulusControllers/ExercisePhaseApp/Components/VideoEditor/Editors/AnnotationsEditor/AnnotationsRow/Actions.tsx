import React from 'react'

import DeleteAnnotationButton from './DeleteAnnotationButton'
import AddAnnotationButton from './AddAnnotationButton'

type Props = {
    addAnnotation: () => void
    removeAnnotation: () => void
}

const Actions = ({ addAnnotation, removeAnnotation }: Props) => {
    return (
        <div
            className="video-editor__media-item-list__column video-editor__media-item-list__column--operation"
            style={{ width: 30 }}
        >
            <DeleteAnnotationButton removeAnnotation={removeAnnotation} />
            <AddAnnotationButton addAnnotation={addAnnotation} />
        </div>
    )
}

export default React.memo(Actions)
