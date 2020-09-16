import React, { useRef, useEffect, useState } from 'react'
import { Table } from 'react-virtualized'
import Row from './Row/Row'
import { MediaItem } from '../types'

export type Props = {
    mediaItems: MediaItem<any>[]
    addMediaItem?: (index: number, sub?: MediaItem<any>) => void
    currentIndex: number
    updateMediaItem: (item: MediaItem<any>, updatedValues: Object) => void // FIXME refine updatedValues
    removeMediaItem: (item: MediaItem<any>) => void
    checkMediaItem: (item: MediaItem<any>) => boolean
    children?: React.ReactNode | React.ReactNodeArray
}

const MediaItemList = ({
    mediaItems,
    addMediaItem,
    children,
    currentIndex,
    updateMediaItem,
    removeMediaItem,
    checkMediaItem,
}: Props) => {
    const ref: React.RefObject<HTMLDivElement> = useRef(null)

    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        const divWithTable = ref.current

        if (divWithTable && divWithTable.parentElement) {
            setWidth(divWithTable.parentElement.clientWidth)
            setHeight(divWithTable.clientHeight)
        }
    }, [ref.current])

    return (
        <div className="video-editor__media-item-list" ref={ref}>
            {children}
            <Table
                className="video-editor__media-item-list__table"
                headerHeight={40}
                width={width}
                height={height}
                rowHeight={80}
                scrollToIndex={currentIndex}
                rowCount={mediaItems.length}
                rowGetter={({ index }) => mediaItems[index]}
                headerRowRenderer={() => null}
                rowRenderer={(props) => (
                    <Row
                        key={props.key}
                        id={props.key}
                        rowData={props.rowData}
                        style={props.style}
                        index={props.index}
                        checkMediaItem={checkMediaItem}
                        removeMediaItem={removeMediaItem}
                        addMediaItem={addMediaItem}
                        updateMediaItem={updateMediaItem}
                        currentIndex={currentIndex}
                    />
                )}
            ></Table>
        </div>
    )
}

export default React.memo(MediaItemList)
