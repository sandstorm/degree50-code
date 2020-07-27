import React, { useRef } from 'react'
import { useButton } from '@react-aria/button'

type ButtonProps = {
    onPress: () => void
    children: React.ReactNode
    className: string
}

const Button = (props: ButtonProps) => {
    // @ts-ignore
    const buttonRef: React.RefObject<HTMLButtonElement> = useRef()
    const { buttonProps } = useButton(props, buttonRef)
    const { children } = props

    return (
        <button {...buttonProps} className={props.className} ref={buttonRef}>
            {children}
        </button>
    )
}

export default Button
