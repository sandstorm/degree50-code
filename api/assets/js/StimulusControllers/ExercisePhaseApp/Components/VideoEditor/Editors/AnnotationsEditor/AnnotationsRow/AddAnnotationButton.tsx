import React from 'react'

type Props = {
    addAnnotation: () => void
}

const AddAnnotationButton = ({ addAnnotation }: Props) => {
    return <i className="icon-plus" onClick={addAnnotation}></i>
}

export default React.memo(AddAnnotationButton)
