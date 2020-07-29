import React, { useEffect, useState, useCallback } from 'react'
import { Table } from 'react-virtualized'
import debounce from 'lodash/debounce'
import AnnotationsRow from './AnnotationsRow/AnnotationsRow'
import { Player, MediaItem } from '../components/types'

export type Props = {
    annotations: MediaItem[]
    addAnnotation: (index: number, sub?: MediaItem) => void
    currentIndex: number
    updateAnnotation: (sub: MediaItem | null, key: string, lastValue: string) => void
    removeAnnotation: (sub: MediaItem) => void
    checkAnnotation: (sub: MediaItem) => boolean
}

const Annotations = ({
    annotations,
    addAnnotation,
    currentIndex,
    updateAnnotation,
    removeAnnotation,
    checkAnnotation,
}: Props) => {
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
        <div className="video-editor__media-item-list">
            <Table
                className="video-editor__media-item-list__table"
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
                        checkAnnotation={checkAnnotation}
                        removeAnnotation={removeAnnotation}
                        addAnnotation={addAnnotation}
                        updateAnnotation={updateAnnotation}
                        currentIndex={currentIndex}
                    />
                )}
            ></Table>
        </div>
    )
}

export default Annotations
