import Button from 'Components/Button/Button'
import React from 'react'

type Props = {
    onClick: () => void
}

const RemoveButton = ({ onClick }: Props) => {
    return (
        <Button className={'btn btn-outline-danger btn-sm'} title={'Code löschen'} onPress={onClick}>
            <i className={'fas fa-trash'} />
        </Button>
    )
}

export default React.memo(RemoveButton)
