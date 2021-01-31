import { secondToTime, timeToSecond } from 'Components/VideoEditor/Editors/utils'
import { VideoCode } from 'Components/VideoEditor/VideoListsSlice'
import { ChangeEvent, useState } from 'react'

export const useVideoCodeEdit = (initialVideoCode?: VideoCode) => {
    const [transientVideoCode, setTransientVideoCode] = useState<VideoCode | undefined>(initialVideoCode)

    const adjustEndTimeByStart = (startTime: string, endTime: string) => {
        return endTime > startTime ? endTime : secondToTime(timeToSecond(startTime) + 1)
    }

    const handleStartTimeChange = (time: string) => {
        if (transientVideoCode) {
            setTransientVideoCode({
                ...transientVideoCode,
                start: time,
                end: adjustEndTimeByStart(time, transientVideoCode.end),
            })
        }
    }

    const handleEndTimeChange = (time: string) => {
        if (transientVideoCode) {
            setTransientVideoCode({
                ...transientVideoCode,
                end: adjustEndTimeByStart(transientVideoCode.start, time),
            })
        }
    }

    const handleTextChange = (ev: ChangeEvent<HTMLTextAreaElement>) => {
        if (transientVideoCode) {
            setTransientVideoCode({
                ...transientVideoCode,
                text: ev.target.value,
            })
        }
    }

    const handleMemoChange = (memo: string) => {
        if (transientVideoCode) {
            setTransientVideoCode({
                ...transientVideoCode,
                memo: memo,
            })
        }
    }

    const updateSelectedCode = (prototypeId: string) => {
        if (transientVideoCode) {
            setTransientVideoCode({
                ...transientVideoCode,
                idFromPrototype: prototypeId,
            })
        }
    }

    return {
        transientVideoCode,
        handleStartTimeChange,
        handleEndTimeChange,
        handleTextChange,
        handleMemoChange,
        updateSelectedCode,
    }
}
