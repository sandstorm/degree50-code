import Button from 'Components/Button/Button'
import React from 'react'

type Props = {
    moveUp: () => void
}

const MoveUpButton = ({ moveUp }: Props) => {
    return (
        <Button title="Schnitt nach vorn schieben" className="btn btn-primary btn-sm" onPress={moveUp}>
            <i className="fas fa-caret-up" />
        </Button>
    )
}

export default React.memo(MoveUpButton)
