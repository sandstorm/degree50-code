import MenuButton, { MenuItemRenderProps } from 'Components/VideoEditor/components/MenuButton'
import MenuItem from 'Components/VideoEditor/components/MenuItem'
import React, { FC, memo, useCallback, useMemo } from 'react'

type Props = {
    playbackRate: number
    setPlaybackRate: (playbackRate: number) => void
}

const PlaybackRateControl: FC<Props> = (props) => {
    const renderMenuItems = useCallback(
        (menuItemRenderProps: MenuItemRenderProps) => {
            const createClickHandler = (rate: number) => () => {
                props.setPlaybackRate(rate)
                menuItemRenderProps.close()
            }
            return (
                <>
                    <MenuItem ariaLabel="0.5x" label="0.5x" onClick={createClickHandler(0.5)} />
                    <MenuItem ariaLabel="1x" label="1x" onClick={createClickHandler(1)} />
                    <MenuItem ariaLabel="1.5x" label="1.5x" onClick={createClickHandler(1.5)} />
                    <MenuItem ariaLabel="2x" label="2x" onClick={createClickHandler(2)} />
                    <MenuItem ariaLabel="3x" label="3x" onClick={createClickHandler(3)} />
                </>
            )
        },
        [props.setPlaybackRate]
    )

    const label = useMemo(() => `${props.playbackRate}x`, [props.playbackRate])

    return (
        <MenuButton
            ariaLabel={`PlaybackRate ${label}`}
            icon={<i className="fas fa-tachometer-alt" />}
            label={label}
            small
        >
            {renderMenuItems}
        </MenuButton>
    )
}

export default memo(PlaybackRateControl)
