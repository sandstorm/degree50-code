import React, { memo } from 'react'
import NumberField from './NumberField'

type Props = {
    label: string

    hours: number
    maxHours?: number
    minHours?: number
    onChangeHours: (hours: number) => void

    minutes: number
    maxMinutes?: number
    minMinutes?: number
    onChangeMinutes: (hours: number) => void

    seconds: number
    maxSeconds?: number
    minSeconds?: number
    onChangeSeconds: (hours: number) => void

    formatOptions?: Intl.NumberFormatOptions
}

const TimeInput = (props: Props) => {
    const hoursLabel = `${props.label} Stunden`
    const minutesLabel = `${props.label} Minuten`
    const secondsLabel = `${props.label} Sekunden`

    // TODO: better label handling - similar to native label
    // maybe separate component with forHtml prop, onClick handler that sets focus on first NumberField and correct aria stuff
    return (
        <div className="input time-input">
            <span className="time-input__label">{props.label}</span>
            <NumberField
                value={props.hours}
                defaultValue={0}
                minValue={props.minHours}
                maxValue={props.maxHours}
                onChange={props.onChangeHours}
                aria-label={hoursLabel}
                formatOptions={{ ...props.formatOptions, unit: 'hour' }}
            />
            <NumberField
                value={props.minutes}
                defaultValue={0}
                minValue={props.minMinutes}
                // TODO: Is this restriction justified? Alternatively could be unrestricted by default (like hours)
                maxValue={Math.min(59, props.maxMinutes ?? 59)}
                onChange={props.onChangeMinutes}
                aria-label={minutesLabel}
                formatOptions={{ ...props.formatOptions, unit: 'minute' }}
            />
            <NumberField
                value={props.seconds}
                defaultValue={0}
                minValue={props.minSeconds}
                // TODO: Is this restriction justified? Alternatively could be unrestricted by default (like hours)
                maxValue={Math.min(59, props.maxSeconds ?? 59)}
                onChange={props.onChangeSeconds}
                aria-label={secondsLabel}
                formatOptions={{ ...props.formatOptions, unit: 'second' }}
            />
        </div>
    )
}

export default memo(TimeInput)
