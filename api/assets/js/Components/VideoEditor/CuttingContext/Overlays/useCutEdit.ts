import { Cut } from 'Components/VideoEditor/types'
import { secondToTime, timeToSecond } from 'Components/VideoEditor/utils'
import { useState } from 'react'

export const useCutEdit = (initialCut?: Cut) => {
    const [transientCut, setTransientCut] = useState<Cut | undefined>(initialCut)

    const adjustEndTimeByStart = (startTime: string, endTime: string) => {
        return endTime > startTime ? endTime : secondToTime(timeToSecond(startTime) + 1)
    }

    const handleStartTimeChange = (time: string) => {
        if (transientCut) {
            setTransientCut({
                ...transientCut,
                start: time,
                end: adjustEndTimeByStart(time, transientCut.end),
            })
        }
    }

    const handleEndTimeChange = (time: string) => {
        if (transientCut) {
            setTransientCut({
                ...transientCut,
                end: adjustEndTimeByStart(transientCut.start, time),
            })
        }
    }

    const handleOffsetChange = (time: string) => {
        if (transientCut) {
            setTransientCut({
                ...transientCut,
                offset: timeToSecond(time),
            })
        }
    }

    const updateText = (text: string) => {
        if (transientCut) {
            setTransientCut({
                ...transientCut,
                text,
            })
        }
    }

    const updateMemo = (memo: string) => {
        if (transientCut) {
            setTransientCut({
                ...transientCut,
                memo,
            })
        }
    }

    return {
        transientCut,
        handleStartTimeChange,
        handleEndTimeChange,
        handleOffsetChange,
        updateText,
        updateMemo,
    }
}
