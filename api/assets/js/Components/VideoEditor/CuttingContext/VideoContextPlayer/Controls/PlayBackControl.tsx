import Button from 'Components/Button/Button'
import React, { FC, memo, useCallback, useMemo } from 'react'

type Props = {
    isPaused: boolean
    toggleIsPaused: () => void
}

const PlaybackControl: FC<Props> = (props) => {
    const playbackButtonLabel = useMemo(() => (props.isPaused ? 'Play' : 'Pause'), [props.isPaused])
    const playbackButtonIcon = useMemo(() => `fas fa-${props.isPaused ? 'play' : 'pause'}`, [props.isPaused])
    const handleClick = useCallback(() => props.toggleIsPaused(), [props.toggleIsPaused])

    return (
        <Button className="btn btn-grey menu-button btn-sm" title={playbackButtonLabel} onPress={handleClick}>
            <i className={playbackButtonIcon} />
        </Button>
    )
}

export default memo(PlaybackControl)
