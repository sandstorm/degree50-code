import React from 'react'

type Props = {
    removeAnnotation: () => void
}

const DeleteAnnotationButton = ({ removeAnnotation }: Props) => {
    return <i className="icon-trash-empty" onClick={removeAnnotation} style={{ marginBottom: 5 }}></i>
}

export default React.memo(DeleteAnnotationButton)
