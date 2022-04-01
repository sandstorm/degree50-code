import React, { memo, MouseEvent, useCallback, useMemo } from 'react'
import NumberField from './NumberField'

type Props = {
    label: string

    hours: number
    maxHours?: number
    minHours?: number
    onChangeHours: (hours: number) => void
    hoursLabel: string

    minutes: number
    maxMinutes?: number
    minMinutes?: number
    onChangeMinutes: (hours: number) => void
    minutesLabel: string

    seconds: number
    maxSeconds?: number
    minSeconds?: number
    onChangeSeconds: (hours: number) => void
    secondsLabel: string

    formatOptions?: Intl.NumberFormatOptions
}

const TimeInput = (props: Props) => {
    const hoursFormatOptions = useMemo(
        () => ({
            ...props.formatOptions,
            unit: 'hour',
        }),
        [props.formatOptions]
    )

    const minutesFormatOptions = useMemo(
        () => ({
            ...props.formatOptions,
            unit: 'minute',
        }),
        [props.formatOptions]
    )

    const secondsFormatOptions = useMemo(
        () => ({
            ...props.formatOptions,
            unit: 'second',
        }),
        [props.formatOptions]
    )

    // TODO: Is this restriction justified? Alternatively could be unrestricted by default (like hours)
    const maxMinutes = useMemo(() => Math.min(59, props.maxMinutes ?? 59), [props.maxMinutes])
    const maxSeconds = useMemo(() => Math.min(59, props.maxSeconds ?? 59), [props.maxSeconds])

    // WHY: Simulate label onClick behavior
    const focusFirstInput = useCallback((ev: MouseEvent<HTMLElement>) => {
        // @ts-ignore - wrong DOM typing?
        ev.target?.parentElement?.querySelector('input')?.focus()
    }, [])

    return (
        <div className="time-input">
            <label className="time-input__label" onClick={focusFirstInput}>
                {props.label}
            </label>
            <div role="group" className="input" onClick={focusFirstInput}>
                <NumberField
                    value={props.hours}
                    defaultValue={0}
                    minValue={props.minHours}
                    maxValue={props.maxHours}
                    onChange={props.onChangeHours}
                    aria-label={props.hoursLabel}
                    formatOptions={hoursFormatOptions}
                />
                <NumberField
                    value={props.minutes}
                    defaultValue={0}
                    minValue={props.minMinutes}
                    maxValue={maxMinutes}
                    onChange={props.onChangeMinutes}
                    aria-label={props.minutesLabel}
                    formatOptions={minutesFormatOptions}
                />
                <NumberField
                    value={props.seconds}
                    defaultValue={0}
                    minValue={props.minSeconds}
                    maxValue={maxSeconds}
                    onChange={props.onChangeSeconds}
                    aria-label={props.secondsLabel}
                    formatOptions={secondsFormatOptions}
                />
            </div>
        </div>
    )
}

export default memo(TimeInput)
