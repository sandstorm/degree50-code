import React, { ChangeEvent, FC, memo } from 'react'
import { clamp, HoursStringFormatter, MinutesStringFormatter, SecondsWithMillisecondsStringFormatter } from '../utils'

type Props = {
    label: string
    /**
     * time in the format "hh:mm:ss.msec"
     */
    value: string
    /**
     * @param time The time in the format "hh:mm:ss.msec"
     */
    onChange: (time: string) => void
}

const TimeInput: FC<Props> = (props) => {
    const timeSplit = props.value.split(':')

    const handleHoursChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const newHours = HoursStringFormatter.format(parseInt(ev.target.value))
        props.onChange([newHours, timeSplit[1], timeSplit[2]].join(':'))
    }

    const handleMinutesChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const newMinutes = MinutesStringFormatter.format(clamp(parseInt(ev.target.value), 0, 59))
        props.onChange([timeSplit[0], newMinutes, timeSplit[2]].join(':'))
    }

    const handleSecondsChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const newSeconds = SecondsWithMillisecondsStringFormatter.format(clamp(parseFloat(ev.target.value), 0, 59))
        props.onChange([timeSplit[0], timeSplit[1], newSeconds].join(':'))
    }

    return (
        <div className="time-input">
            <span className="time-input__label">{props.label}</span>
            <div className="time-input__input time-input__input--hours">
                <input
                    type="number"
                    aria-label={`${props.label} Stunden`}
                    value={timeSplit[0]}
                    onChange={handleHoursChange}
                    step={1}
                    min={0}
                />
                <span>hh</span>
            </div>
            <div className="time-input__input time-input__input--minutes">
                <input
                    type="number"
                    aria-label={`${props.label} Minuten`}
                    value={timeSplit[1]}
                    onChange={handleMinutesChange}
                    step={1}
                    min={0}
                    max={59}
                />
                <span>mm</span>
            </div>
            <div className="time-input__input time-input__input--seconds">
                <input
                    type="number"
                    aria-label={`${props.label} Sekunden`}
                    value={timeSplit[2]}
                    onChange={handleSecondsChange}
                    step={0.5}
                    min={0}
                    max={59}
                />
                <span>ss</span>
            </div>
        </div>
    )
}

export default memo(TimeInput)
