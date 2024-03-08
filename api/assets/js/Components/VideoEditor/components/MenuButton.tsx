import { FocusScope } from '@react-aria/focus'
import { connect } from 'react-redux'
import Button from 'Components/Button/Button'
import React, { FC, memo, ReactNode, useCallback, useMemo, useState } from 'react'
import { actions } from '../PlayerSlice'
import { generate } from 'shortid'

type OwnProps = {
    className?: string
    label?: string
    ariaLabel: string
    children: ReactNode
    icon?: ReactNode
    key?: string
    disabled?: boolean
    pauseVideo?: boolean
    small?: boolean
    closeMenuOnItemSelect?: boolean
}

const mapDispatchToProps = {
    setPauseVideo: actions.setPause,
}

type Props = typeof mapDispatchToProps & OwnProps

const MenuButton: FC<Props> = ({
    children,
    className,
    label,
    ariaLabel,
    icon,
    key,
    disabled = false,
    pauseVideo = false,
    small = false,
    setPauseVideo,
    closeMenuOnItemSelect,
}) => {
    const [isOpen, setIsOpen] = useState(false)

    const open = useCallback(() => setIsOpen(true), [])
    const close = useCallback(() => {
        setIsOpen(false)
    }, [])

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

    /**
     * WHY stopPropagation and preventDefault:
     *   Touch fires an additional click after a small delay.
     *   To prevent that from happening we immediately prevent the event from bubbling.
     *   This is probably due to browser implementation of secondary touch (long touch)
     *   where after the timeout for long-touch a click is triggered.
     */
    const handleToggleMenu = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault()
        event.stopPropagation()
        toggleMenu()
    }

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

    const classes = `button button--type-primary ${
        disabled ? 'disabled' : ``
    } menu-button video-editor__toolbar__button ${small ? 'button--size-small' : ''} ${className}`

    const focusScopeKey = useMemo(() => key ?? generate(), [key])

    if (disabled) {
        return (
            <div className="menu-wrapper">
                <Button title={ariaLabel} className={classes} isDisabled>
                    {icon} {label}
                </Button>
            </div>
        )
    }

    return (
        <div className="menu-wrapper">
            <Button className={classes} onClick={handleToggleMenu} title={ariaLabel}>
                {icon} {label}
            </Button>
            {isOpen && <div className="menu-backdrop" onClick={close} />}
            {isOpen && (
                <FocusScope autoFocus contain restoreFocus key={focusScopeKey}>
                    <div
                        className="menu"
                        onKeyDown={handleKeyDown}
                        onClick={() => {
                            if (closeMenuOnItemSelect) {
                                close()
                            }
                        }}
                    >
                        {children}
                    </div>
                </FocusScope>
            )}
        </div>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(MenuButton))
