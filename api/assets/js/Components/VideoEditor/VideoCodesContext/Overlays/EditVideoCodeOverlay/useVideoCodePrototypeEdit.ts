import { VideoCodePrototype } from 'Components/VideoEditor/types'
import { ChangeEvent, useState } from 'react'
import { generate } from 'shortid'

const defaultColor = '#cccccc'
const createDefaultPrototype = (parentVideoCodeParent?: VideoCodePrototype): VideoCodePrototype => ({
    id: generate(),
    name: '',
    description: '',
    color: parentVideoCodeParent?.color ?? defaultColor,
    userCreated: true,
    parentId: parentVideoCodeParent?.id,
    videoCodes: [],
})

export const useVideoCodePrototypeEdit = (
    initialVideoCode?: VideoCodePrototype,
    videoCodeParent?: VideoCodePrototype
) => {
    const [transientVideoCodePrototype, setTransientVideoCodePrototype] = useState<VideoCodePrototype>(
        initialVideoCode ?? createDefaultPrototype(videoCodeParent)
    )

    const handleNameChange = (ev: ChangeEvent<HTMLInputElement>) => {
        if (transientVideoCodePrototype) {
            setTransientVideoCodePrototype({
                ...transientVideoCodePrototype,
                name: ev.target.value,
            })
        }
    }

    const handleColorChange = (ev: ChangeEvent<HTMLInputElement>) => {
        if (transientVideoCodePrototype) {
            setTransientVideoCodePrototype({
                ...transientVideoCodePrototype,
                color: ev.target.value ?? defaultColor,
            })
        }
    }

    return {
        transientVideoCodePrototype,
        handleNameChange,
        handleColorChange,
    }
}
