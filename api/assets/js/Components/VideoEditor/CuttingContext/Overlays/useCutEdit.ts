import { Cut } from 'Components/VideoEditor/types'
import { secondToTime, timeToSecond } from 'Components/VideoEditor/utils'
import { t2d } from 'duration-time-conversion'
import { useState } from 'react'

export const useCutEdit = (initialCut?: Cut) => {
    const [transientCut, setTransientCut] = useState<Cut | undefined>(initialCut)

    const adjustEndTimeByStart = (startTime: string, endTime: string) => {
        return endTime > startTime ? endTime : secondToTime(timeToSecond(startTime) + 1)
    }

    // WHY also update offset:
    // We do not need to show offset in frontend and
    // just use start as offset
    const handleStartTimeChange = (time: string) => {
        if (transientCut) {
            setTransientCut({
                ...transientCut,
                start: time,
                end: adjustEndTimeByStart(time, transientCut.end),
                offset: t2d(time),
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
        updateText,
        updateMemo,
    }
}
