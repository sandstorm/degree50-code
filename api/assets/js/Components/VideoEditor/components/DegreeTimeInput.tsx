import React, { memo } from 'react'
import { timeStringToTimeValues, timeValuesToTimeString } from '../utils/time'
import TimeInput from 'Components/TimeInput'

// TODO: what about milliseconds?

type Props = {
    label: string
    /**
     * time in the format "hh:mm:ss"
     */
    value: string
    /**
     * minimum time in the format "hh:mm:ss"
     */
    minValue: string
    /**
     * maximum time in the format "hh:mm:ss"
     */
    maxValue: string
    /**
     * @param time The time in the format "hh:mm:ss"
     */
    onChange: (timeString: string) => void
}

const DegreeTimeInput = (props: Props) => {
    return <div />
}

export default memo(DegreeTimeInput)
