import { FocusScope } from '@react-aria/focus'
import { connect } from 'react-redux'
import Button from 'Components/Button/Button'
import React, { FC, memo, ReactNode, useCallback, useMemo, useState } from 'react'
import { actions } from '../PlayerSlice'
import { generate } from 'shortid'

type OwnProps = {
    label?: string
    ariaLabel: string
    children: ReactNode
    icon?: ReactNode
    key?: string
    disabled?: boolean
    pauseVideo?: boolean
    small?: boolean
}

const mapDispatchToProps = {
    setPauseVideo: actions.setPause,
}

type Props = typeof mapDispatchToProps & OwnProps

const MenuButton: FC<Props> = ({
    children,
    label,
    ariaLabel,
    icon,
    key,
    disabled = false,
    pauseVideo = false,
    small = false,
    setPauseVideo,
}) => {
    const [isOpen, setIsOpen] = useState(false)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => setIsOpen(false), [])
    const toggleMenu = useCallback(() => {
        if (pauseVideo) {
            setPauseVideo(true)
        }

        if (isOpen) {
            close()
        } else {
            open()
        }
    }, [isOpen, close, open, pauseVideo, setPauseVideo])

    const handleKeyDown = useCallback(
        (ev: React.KeyboardEvent<HTMLElement>) => {
            switch (ev.key) {
                case 'Escape': {
                    ev.preventDefault()
                    ev.stopPropagation()
                    close()
                    return false
                }
            }
        },
        [close]
    )

    const className = `btn btn-grey ${disabled ? 'disabled' : ``} menu-button video-editor__toolbar__button ${
        small ? 'btn-sm' : ''
    }`

    const focusScopeKey = useMemo(() => key ?? generate(), [key])

    if (disabled) {
        return (
            <div className="menu-wrapper">
                <Button title={ariaLabel} className={className} isDisabled>
                    {icon} {label}
                </Button>
            </div>
        )
    }

    return (
        <div className="menu-wrapper">
            <Button className={className} onPress={toggleMenu} title={ariaLabel}>
                {icon} {label}
            </Button>
            {isOpen && <div className="menu-backdrop" onClick={close} />}
            {isOpen && (
                <FocusScope autoFocus contain restoreFocus key={focusScopeKey}>
                    <div className="menu" onKeyDown={handleKeyDown}>
                        {children}
                    </div>
                </FocusScope>
            )}
        </div>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(MenuButton))
