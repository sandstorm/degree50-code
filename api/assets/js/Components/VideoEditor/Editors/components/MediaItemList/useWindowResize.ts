import { useState, useCallback, useEffect } from 'react'
import debounce from 'lodash/debounce'

export const useWindowResize = () => {
    const [width, setWidth] = useState(100)
    const [height, setHeight] = useState(100)

    const resize = useCallback(() => {
        setWidth(document.body.clientWidth / 2)
        setHeight(document.body.clientHeight - 210)
    }, [setWidth, setHeight])

    let resizeInitialized = false

    useEffect(() => {
        resize()
        if (!resizeInitialized) {
            resizeInitialized = true
            const debounceResize = debounce(resize, 500)
            window.addEventListener('resize', debounceResize)
        }
    }, [resize, resizeInitialized])

    return {
        width,
        height,
    }
}
