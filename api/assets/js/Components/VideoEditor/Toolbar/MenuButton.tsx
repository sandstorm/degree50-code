import { FocusScope } from '@react-aria/focus'
import { connect } from 'react-redux'
import Button from 'Components/Button/Button'
import React, { memo, ReactNode, useCallback, useState } from 'react'
import { actions } from '../PlayerSlice'

type OwnProps = {
    label: string
    children: ReactNode
}

const mapDispatchToProps = {
    pauseVideo: actions.setPause,
}

type Props = typeof mapDispatchToProps & OwnProps

const MenuButton = ({ label, children, pauseVideo }: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    const open = () => setIsOpen(true)
    const close = () => setIsOpen(false)
    const toggleMenu = useCallback(() => {
        pauseVideo(true)

        if (isOpen) {
            close()
        } else {
            open()
        }
    }, [isOpen])

    const handleKeyDown = (ev: React.KeyboardEvent<HTMLElement>) => {
        switch (ev.key) {
            case 'Escape': {
                ev.preventDefault()
                close()
                return false
            }
        }
    }

    return (
        <div className="menu-wrapper">
            <Button className="btn btn-grey menu-button video-editor__toolbar__button" onPress={toggleMenu}>
                <i className="fas fa-pen" />
            </Button>
            {isOpen && <div className="menu-backdrop" onClick={close} />}
            {isOpen && (
                <FocusScope autoFocus contain restoreFocus>
                    <div className="menu" onKeyDown={handleKeyDown}>
                        {children}
                    </div>
                </FocusScope>
            )}
        </div>
    )
}

export default connect(undefined, mapDispatchToProps)(memo(MenuButton))
