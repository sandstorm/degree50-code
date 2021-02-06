import React from 'react'

type Props = {
    onClick: () => void
    showChildren: boolean
}

const ToggleChildrenButton = ({ onClick, showChildren }: Props) => {
    return (
        <button type="button" className={'btn btn-outline-primary btn-sm'} onClick={onClick}>
            <i className={showChildren ? 'fas fa-chevron-up' : 'fas fa-chevron-down'} />
        </button>
    )
}

export default React.memo(ToggleChildrenButton)
