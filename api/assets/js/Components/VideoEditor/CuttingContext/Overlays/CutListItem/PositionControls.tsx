import React from 'react'
import MoveDownButton from './MoveDownButton'
import MoveUpButton from './MoveUpButton'

type Props = {
    moveUp: () => void
    moveDown: () => void
}

const PositionControls = ({ moveUp, moveDown }: Props) => {
    return (
        <div>
            <MoveUpButton moveUp={moveUp} />
            <MoveDownButton moveDown={moveDown} />
        </div>
    )
}

export default React.memo(PositionControls)
