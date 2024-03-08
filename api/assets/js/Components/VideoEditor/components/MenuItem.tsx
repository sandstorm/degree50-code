import React, { memo } from 'react'

type Props = {
    label: string
    onClick: () => void
    ariaLabel: string
    disabled?: boolean
}

const MenuItem = (props: Props) => {
    const className = ['button button--type-grey menu-item', ...(props.disabled ? ['disabled'] : [])].join(' ')

    if (props.disabled) {
        // WHY:
        // For accessibility reasons we do want to keep the order of menus always the same.
        // To prevent the button from being skipped when tabbing, we don't actually disable it,
        // but just give it the correct styles and remove its click handler, when its disabled.
        // That way all menut items will always be reachable with the same amount of tab presses.
        return (
            <button className={className} aria-label={`${props.ariaLabel}-deaktiviert`}>
                {props.label}
            </button>
        )
    }

    return (
        <button className={className} onClick={props.onClick} aria-label={props.ariaLabel} disabled={props.disabled}>
            {props.label}
        </button>
    )
}

export default memo(MenuItem)
