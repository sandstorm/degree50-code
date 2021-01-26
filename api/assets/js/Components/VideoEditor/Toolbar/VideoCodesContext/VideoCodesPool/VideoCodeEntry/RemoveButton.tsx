import React from 'react'

type Props = {
    onClick: () => void
}

const RemoveButton = ({ onClick }: Props) => {
    return (
        <button
            type="button"
            className={'btn btn-outline-danger btn-sm'}
            title={'Video-Code löschen'}
            onClick={onClick}
        >
            <i className={'fas fa-trash'} />
        </button>
    )
}

export default React.memo(RemoveButton)
