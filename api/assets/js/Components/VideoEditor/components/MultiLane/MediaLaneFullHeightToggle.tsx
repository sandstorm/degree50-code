import React from 'react'
import Button from 'Components/Button/Button'

type Props = {
    isFullHeight: boolean
    toggleFullHeight: () => void
}

const LaneHeightMenu = (props: Props) => {
    const label = props.isFullHeight ? 'Exit Full Screen' : 'Enter Full Screen'
    const iconName = props.isFullHeight ? 'minimize' : 'maximize'
    return (
        <Button
            className="button button--type-primary menu-button media-lane-toolbar__menu-button"
            onPress={() => props.toggleFullHeight()}
        >
            <i className={`far fa-${iconName}`}></i> {label}
        </Button>
    )
}

export default React.memo(LaneHeightMenu)
