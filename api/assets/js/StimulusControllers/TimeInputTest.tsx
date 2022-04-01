import React, { useState, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { Controller } from 'stimulus'
import { I18nProvider } from '@react-aria/i18n'
import TimeInput from '../Components/TimeInput/TimeInput'

const TimeInputTest = () => {
    const [hours, setHours] = useState(5)
    const [minutes, setMinutes] = useState(23)
    const [seconds, setSeconds] = useState(42)

    const formatOptions: Intl.NumberFormatOptions = useMemo(
        () => ({
            maximumFractionDigits: 0,
            style: 'unit',
        }),
        []
    )

    const label = 'Start'
    const hoursLabel = `${label} Stunden`
    const minutesLabel = `${label} Minuten`
    const secondsLabel = `${label} Sekunden`

    return (
        <TimeInput
            label="test"
            hours={hours}
            maxHours={25}
            minHours={0}
            onChangeHours={setHours}
            hoursLabel={hoursLabel}
            minutes={minutes}
            maxMinutes={25}
            minMinutes={0}
            onChangeMinutes={setMinutes}
            minutesLabel={minutesLabel}
            seconds={seconds}
            minSeconds={0}
            onChangeSeconds={setSeconds}
            formatOptions={formatOptions}
            secondsLabel={secondsLabel}
        />
    )
}

export default class extends Controller {
    connect() {
        ReactDOM.render(
            <I18nProvider locale="de-DE">
                <TimeInputTest />
            </I18nProvider>,
            this.element
        )
    }
}
