import React from 'react'

type Props = {
    removeMediaItem: () => void
}

const DeleteAnnotationButton = ({ removeMediaItem }: Props) => {
    return <i className="icon-trash-empty" onClick={removeMediaItem} style={{ marginBottom: 5 }}></i>
}

export default React.memo(DeleteAnnotationButton)
