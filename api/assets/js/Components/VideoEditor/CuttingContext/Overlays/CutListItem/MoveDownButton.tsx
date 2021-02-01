import React from 'react'

type Props = {
    moveDown: () => void
}

const MoveDownButton = ({ moveDown }: Props) => {
    return <i className="fas fa-caret-down" onClick={moveDown} style={{ marginBottom: 5 }} />
}

export default React.memo(MoveDownButton)
