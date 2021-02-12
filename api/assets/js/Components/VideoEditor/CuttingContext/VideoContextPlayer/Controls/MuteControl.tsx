import Button from 'Components/Button/Button'
import React, { FC, memo, useMemo } from 'react'

type Props = {
    isMuted: boolean
    toggleIsMuted: () => void
}

const MuteControl: FC<Props> = (props) => {
    const muteButtonLabel = useMemo(() => (props.isMuted ? 'Unmute' : 'Mute'), [props.isMuted])
    const muteButtonIcon = useMemo(() => `fas fa-${props.isMuted ? 'volume-mute' : 'volume-up'}`, [props.isMuted])

    return (
        <Button className="btn btn-grey menu-button btn-sm" title={muteButtonLabel} onPress={props.toggleIsMuted}>
            <i className={muteButtonIcon} />
        </Button>
    )
}

export default memo(MuteControl)
