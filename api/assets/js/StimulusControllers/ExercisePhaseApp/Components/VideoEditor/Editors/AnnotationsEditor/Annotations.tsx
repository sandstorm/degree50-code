import React, { useEffect, useState, useCallback } from 'react'
import { Table } from 'react-virtualized'
import debounce from 'lodash/debounce'
import clamp from 'lodash/clamp'
import { timeToSecond, secondToTime } from '../utils'
import AnnotationsRow from './AnnotationsRow'
import { Player, MediaItem } from '../components/types'

export type Props = {
    player?: Player
    annotations: MediaItem[]
    addAnnotation: (index: number, sub?: MediaItem) => void
    currentIndex: number
    updateAnnotation: (sub: MediaItem | null, key: string, lastValue: string) => void
    removeAnnotation: (sub: MediaItem) => void
    checkAnnotation: (sub: MediaItem) => boolean
}

const Annotations = ({
    player,
    annotations,
    addAnnotation,
    currentIndex,
    updateAnnotation,
    removeAnnotation,
    checkAnnotation,
}: Props) => {
    let isDroging = false
    let lastPageX = 0
    let lastSub: MediaItem | null = null
    let lastKey = ''
    let lastValue = ''

    function onMouseDown(event: React.MouseEvent<HTMLDivElement, MouseEvent>, sub: MediaItem | null, key: string) {
        isDroging = true
        lastPageX = event.pageX
        lastSub = sub
        lastKey = key
    }

    function onMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>, sub: MediaItem | null, key: string) {
        if (isDroging) {
            const time = Number(((event.pageX - lastPageX) / 10).toFixed(3))

            // FIXME
            // @ts-ignore disable-line
            lastValue = secondToTime(clamp(timeToSecond(sub[key]) + time, 0, Infinity))
        }
    }

    function onMouseUp() {
        if (isDroging) {
            if (lastSub && lastKey && lastValue) {
                updateAnnotation(lastSub, lastKey, lastValue)
            }
            isDroging = false
            lastPageX = 0
            lastSub = null
            lastKey = ''
            lastValue = ''
        }
    }

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

    return (
        <div className="subtitles">
            <Table
                className="subtitles__table"
                headerHeight={40}
                width={width}
                height={height}
                rowHeight={80}
                scrollToIndex={currentIndex}
                rowCount={annotations.length}
                rowGetter={({ index }) => annotations[index]}
                headerRowRenderer={() => null}
                rowRenderer={(props) => (
                    <AnnotationsRow
                        key={props.key}
                        id={props.key}
                        rowData={props.rowData}
                        style={props.style}
                        index={props.index}
                        player={player}
                        checkAnnotation={checkAnnotation}
                        removeAnnotation={removeAnnotation}
                        addAnnotation={addAnnotation}
                        updateAnnotation={updateAnnotation}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        currentIndex={currentIndex}
                    />
                )}
            ></Table>
        </div>
    )
}

export default Annotations
