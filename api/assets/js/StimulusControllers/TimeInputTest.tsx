import { Controller } from 'stimulus'
import React, { useState, StrictMode } from 'react'
import ReactDOM from 'react-dom'
import TimeInput from '../Components/TimeInput/TimeInput'
import { I18nProvider } from '@react-aria/i18n'
import { timeNumberFormat } from '../Components/VideoEditor/utils/time'

const TimeInputTest = () => {
    const [hours, setHours] = useState(5)
    const [minutes, setMinutes] = useState(23)
    const [seconds, setSeconds] = useState(42)

    const formatOptions: Intl.NumberFormatOptions = {
        ...timeNumberFormat,
        style: 'unit',
    }

    return (
        <TimeInput
            label="test"
            hours={hours}
            maxHours={25}
            minHours={0}
            onChangeHours={setHours}
            minutes={minutes}
            maxMinutes={25}
            minMinutes={0}
            onChangeMinutes={setMinutes}
            seconds={seconds}
            minSeconds={0}
            onChangeSeconds={setSeconds}
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
