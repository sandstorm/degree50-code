import { useRadio } from '@react-aria/radio'
import React, { useRef } from 'react'
import PredefinedCodeLock from '../PredefinedCodeLock'
import Color from '../VideoCodePrototypes/PrototypeEntry/Color'
import { RadioContext } from './RadioGroup'
import { VideoCodePrototype } from 'Components/VideoEditor/types'

type Props = {
    children: React.ReactNode
    prototype: VideoCodePrototype
    value: string
}

const Radio = (props: Props) => {
    const { children } = props
    const state = React.useContext(RadioContext)
    const ref = useRef(null)

    // Ignoring due to typing issue in library
    // @ts-ignore
    const { inputProps } = useRadio(props, state, ref)

    return (
        <li className="video-code-select__option">
            <input {...inputProps} ref={ref} id={props.prototype.id} />
            <Color color={props.prototype.color} />
            <PredefinedCodeLock isPredefined={!props.prototype.userCreated} />
            <label style={{ display: 'block' }} htmlFor={props.prototype.id}>
                {children}
            </label>
        </li>
    )
}

export default React.memo(Radio)
