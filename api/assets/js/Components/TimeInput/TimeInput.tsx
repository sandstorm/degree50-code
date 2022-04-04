import React, { memo, MouseEvent, useCallback, useMemo } from 'react'
import NumberField from './NumberField'
import {
    getHoursFromTimeSeconds,
    getMinutesFromTimeSeconds,
    getSecondsFromTimeSeconds,
} from '../VideoEditor/utils/time'
import { hoursToSeconds, minutesToSeconds } from 'date-fns'
import { clamp } from 'lodash'

// TODO: each field should be optional
// TODO: add milliseconds
// TODO: do subdivision handling inside and get time as seconds number as prop

type Props = {
    label: string

    value: number
    max: number
    min: number

    hoursLabel: string
    minutesLabel: string
    secondsLabel: string

    onChange: (time: number) => void

    formatOptions?: Intl.NumberFormatOptions
}

const TimeInput = (props: Props) => {
    const hourFormatOpts = useMemo(() => numberFormatWithUnit('hour', props.formatOptions), [props.formatOptions])
    const minuteFormatOpts = useMemo(() => numberFormatWithUnit('minute', props.formatOptions), [props.formatOptions])
    const secondFormatOpts = useMemo(() => numberFormatWithUnit('second', props.formatOptions), [props.formatOptions])

    // WHY: Simulate label onClick behavior
    const focusFirstInput = useCallback((ev: MouseEvent<HTMLLabelElement | HTMLDivElement>) => {
        // WHY: type issue
        const eventTarget = ev.target as HTMLElement
        eventTarget.querySelector('input')?.focus()
    }, [])

    const hours = getHoursFromTimeSeconds(props.value)
    const minutes = getMinutesFromTimeSeconds(props.value)
    const seconds = getSecondsFromTimeSeconds(props.value)

    const maxHours = getHoursFromTimeSeconds(props.max - props.value)
    const maxMinutes = getHoursFromTimeSeconds(props.max - props.value)
    const maxSeconds = getSecondsFromTimeSeconds(props.max - props.value)

    const minHours = getHoursFromTimeSeconds(props.min)
    const minMinutes = getMinutesFromTimeSeconds(props.min)
    const minSeconds = getSecondsFromTimeSeconds(props.min)

    const onChangeHours = (newHours: number) => {
        const newValue = hoursToSeconds(newHours) + minutesToSeconds(minutes) + seconds
        props.onChange(clamp())
    }

    const onChangeMinutes = (newMinutes: number) => {
        props.onChange(hoursToSeconds(hours) + minutesToSeconds(newMinutes) + seconds)
    }

    const onChangeSeconds = (newSeconds: number) => {
        props.onChange(hoursToSeconds(hours) + minutesToSeconds(minutes) + newSeconds)
    }

    return (
        <div className="time-input">
            <label className="time-input__label" onClick={focusFirstInput}>
                {props.label}
            </label>
            <div role="group" className="input" onClick={focusFirstInput}>
                <NumberField
                    value={hours}
                    defaultValue={0}
                    minValue={minHours}
                    maxValue={maxHours}
                    onChange={onChangeHours}
                    aria-label={props.hoursLabel}
                    formatOptions={hourFormatOpts}
                />
                <NumberField
                    value={minutes}
                    defaultValue={0}
                    minValue={minMinutes}
                    maxValue={maxMinutes}
                    onChange={onChangeMinutes}
                    aria-label={props.minutesLabel}
                    formatOptions={minuteFormatOpts}
                />
                <NumberField
                    value={seconds}
                    defaultValue={0}
                    minValue={minSeconds}
                    maxValue={maxSeconds}
                    onChange={onChangeSeconds}
                    aria-label={props.secondsLabel}
                    formatOptions={secondFormatOpts}
                />
            </div>
        </div>
    )
}

export default memo(TimeInput)

function numberFormatWithUnit(
    unit: Intl.NumberFormatOptions['unit'],
    format?: Intl.NumberFormatOptions
): Intl.NumberFormatOptions {
    return {
        ...format,
        unit,
    }
}
