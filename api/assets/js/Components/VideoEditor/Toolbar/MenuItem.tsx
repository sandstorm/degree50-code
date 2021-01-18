import React, { memo } from 'react'

const MenuItem = ({ label, onClick }: { label: string; onClick: () => void }) => {
    const handleClick = (ev: React.MouseEvent<HTMLButtonElement>) => onClick()

    return (
        <button className="menu-item" onClick={handleClick}>
            {label}
        </button>
    )
}

export default memo(MenuItem)
