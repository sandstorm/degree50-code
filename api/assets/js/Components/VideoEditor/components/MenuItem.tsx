import React, { memo } from 'react'

const MenuItem = (props: { label: string; onClick: () => void; ariaLabel: string }) => {
    return (
        <button className="btn btn-grey menu-item" onClick={props.onClick} aria-label={props.ariaLabel}>
            {props.label}
        </button>
    )
}

export default memo(MenuItem)
