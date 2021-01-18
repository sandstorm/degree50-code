import { FocusScope } from '@react-aria/focus'
import React, { memo, ReactNode, useCallback, useState } from 'react'

const MenuButton = ({ label, children }: { label: string; children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false)

    const open = () => setIsOpen(true)
    const close = () => setIsOpen(false)
    const toggleMenu = useCallback(() => {
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
            <button onClick={toggleMenu}>{label}</button>
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

export default memo(MenuButton)
