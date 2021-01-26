import { secondToTime, timeToSecond } from 'Components/VideoEditor/Editors/utils'
import { Annotation } from 'Components/VideoEditor/VideoListsSlice'
import { useState } from 'react'

export const useAnnotationEdit = (initialAnnotation?: Annotation) => {
    const [transientAnnotation, setTransientAnnotation] = useState<Annotation | undefined>(initialAnnotation)

    const adjustEndTimeByStart = (startTime: string, endTime: string) => {
        return endTime > startTime ? endTime : secondToTime(timeToSecond(startTime) + 1)
    }

    const handleStartTimeChange = (time: string) => {
        if (transientAnnotation) {
            setTransientAnnotation({
                ...transientAnnotation,
                start: time,
                end: adjustEndTimeByStart(time, transientAnnotation.end),
            })
        }
    }

    const handleEndTimeChange = (time: string) => {
        if (transientAnnotation) {
            setTransientAnnotation({
                ...transientAnnotation,
                end: adjustEndTimeByStart(transientAnnotation.start, time),
            })
        }
    }

    const updateText = (text: string) => {
        if (transientAnnotation) {
            setTransientAnnotation({
                ...transientAnnotation,
                text,
            })
        }
    }

    const updateMemo = (memo: string) => {
        if (transientAnnotation) {
            setTransientAnnotation({
                ...transientAnnotation,
                memo,
            })
        }
    }

    return {
        transientAnnotation,
        handleStartTimeChange,
        handleEndTimeChange,
        updateText,
        updateMemo,
    }
}
