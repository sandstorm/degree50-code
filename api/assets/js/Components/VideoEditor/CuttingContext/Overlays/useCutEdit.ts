import { Cut } from 'Components/VideoEditor/types'
import { secondToTime, timeToSecond, adjustEndTimeByStart } from 'Components/VideoEditor/utils/time'
import { t2d } from 'duration-time-conversion'
import { useState } from 'react'
import { clamp } from 'Components/VideoEditor/utils'

export const useCutEdit = (duration: number, initialCut?: Cut) => {
    const [transientCut, setTransientCut] = useState<Cut | undefined>(initialCut)

    // WHY also update offset:
    // We do not need to show offset in frontend and
    // just use start as offset
    const handleStartTimeChange = (time: string) => {
        if (transientCut) {
            setTransientCut({
                ...transientCut,
                start: secondToTime(clamp(timeToSecond(time), 0, duration)),
                end: adjustEndTimeByStart(time, transientCut.end, duration),
                offset: t2d(time),
            })
        }
    }

    const handleEndTimeChange = (time: string) => {
        if (transientCut) {
            setTransientCut({
                ...transientCut,
                end: secondToTime(clamp(timeToSecond(time), timeToSecond(transientCut.start), duration)),
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
