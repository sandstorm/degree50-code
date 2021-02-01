import React from 'react'

type Props = {
    moveUp: () => void
}

const MoveUpButton = ({ moveUp }: Props) => {
    return <i className="fas fa-caret-up" onClick={moveUp} style={{ marginBottom: 5 }} />
}

export default React.memo(MoveUpButton)
