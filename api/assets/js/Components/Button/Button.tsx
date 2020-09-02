import React, { useRef } from 'react'
import { useButton } from '@react-aria/button'

type ButtonProps = {
    onPress: () => void
    children: React.ReactNode
    className: string
    id?: string
}

const Button = (props: ButtonProps) => {
    const buttonRef: React.RefObject<HTMLButtonElement> = useRef(null)
    const { buttonProps } = useButton(props, buttonRef)
    const { children } = props

    return (
        <button {...buttonProps} id={props.id} className={props.className} ref={buttonRef}>
            {children}
        </button>
    )
}

export default Button
