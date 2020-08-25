import React from 'react'

type Props = {
    addMediaItem: () => void
}

const AddAnnotationButton = ({ addMediaItem }: Props) => {
    return <i className="icon-plus" onClick={addMediaItem}></i>
}

export default React.memo(AddAnnotationButton)
