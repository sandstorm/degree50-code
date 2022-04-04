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
    const [hours, minutes, seconds] = timeStringToTimeValues(props.value)
    const [minHours, minMinutes, minSeconds] = timeStringToTimeValues(props.minValue)
    const [maxHours, maxMinutes, maxSeconds] = timeStringToTimeValues(props.maxValue)

    const hoursLabel = `${props.label} Stunden`
    const minutesLabel = `${props.label} Minuten`
    const secondsLabel = `${props.label} Sekunden`

    const handleHoursChange = (newHoursValue: number) => {
        props.onChange(timeValuesToTimeString({ hours: newHoursValue, minutes, seconds }))
    }

    const handleMinutesChange = (newMinutesValue: number) => {
        props.onChange(timeValuesToTimeString({ hours, minutes: newMinutesValue, seconds }))
    }

    const handleSecondsChange = (newSecondsValue: number) => {
        props.onChange(timeValuesToTimeString({ hours, minutes, seconds: newSecondsValue }))
    }

    return (
        <TimeInput
            label={props.label}
            hours={hours}
            minHours={minHours}
            maxHours={maxHours}
            hoursLabel={hoursLabel}
            onChangeHours={handleHoursChange}
            minutes={minutes}
            minMinutes={minMinutes}
            maxMinutes={maxMinutes}
            minutesLabel={minutesLabel}
            onChangeMinutes={handleMinutesChange}
            seconds={seconds}
            minSeconds={minSeconds}
            maxSeconds={maxSeconds}
            secondsLabel={secondsLabel}
            onChangeSeconds={handleSecondsChange}
        />
    )
}

export default memo(DegreeTimeInput)
