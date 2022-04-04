import React, { useState, useMemo } from 'react'
import ReactDOM from 'react-dom'
import { Controller } from 'stimulus'
import { I18nProvider } from '@react-aria/i18n'
import TimeInput from '../Components/TimeInput/TimeInput'

const TimeInputTest = () => {
    const [time, setTime] = useState('05:23:42.123')

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
    const msLabel = `${label} Millisekunden`

    return (
        <TimeInput
            label="test"
            value={time}
            onChange={setTime}
            min="01:12:35.813"
            max="25:55:02.666"
            hoursLabel={hoursLabel}
            minutesLabel={minutesLabel}
            secondsLabel={secondsLabel}
            msLabel={msLabel}
            formatOptions={formatOptions}
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
