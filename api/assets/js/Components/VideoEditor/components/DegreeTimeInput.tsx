import React, { ChangeEvent, memo } from 'react'
import { clamp } from '../utils'
import { HoursStringFormatter, MinutesStringFormatter, SecondsWithMillisecondsStringFormatter } from '../utils/time'
import TimeInput from 'Components/TimeInput'

type Props = {
    label: string
    /**
     * time in the format "hh:mm:ss.msec"
     */
    value: string
    /**
     * minimum time in the format "hh:mm:ss.msec"
     */
    minValue: string
    /**
     * maximum time in the format "hh:mm:ss.msec"
     */
    maxValue: string
    /**
     * @param time The time in the format "hh:mm:ss.msec"
     */
    onChange: (time: string) => void
}

const DegreeTimeInput = (props: Props) => {
    const valueSplit = props.value.split(':')
    const minValueSplit = props.value.split(':')
    const maxValueSplit = props.value.split(':')

    const hours = valueSplit[0]
    const minHours = minValueSplit[0]
    const minutes = valueSplit[1]
    const seconds = valueSplit[2]

    const handleHoursChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const newHours = HoursStringFormatter.format(parseInt(ev.target.value))
        props.onChange([newHours, valueSplit[1], valueSplit[2]].join(':'))
    }

    const handleMinutesChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const newMinutes = MinutesStringFormatter.format(clamp(parseInt(ev.target.value), 0, 59))
        props.onChange([valueSplit[0], newMinutes, valueSplit[2]].join(':'))
    }

    const handleSecondsChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const newSeconds = SecondsWithMillisecondsStringFormatter.format(clamp(parseFloat(ev.target.value), 0, 59))
        props.onChange([valueSplit[0], valueSplit[1], newSeconds].join(':'))
    }

    return <div />
}

export default memo(DegreeTimeInput)
