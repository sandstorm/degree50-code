import React, { useEffect, useState, useCallback } from 'react'
import { Table } from 'react-virtualized'
import debounce from 'lodash/debounce'
import Row from './Row/Row'
import { MediaItem } from '../types'

export type Props = {
    mediaItems: MediaItem<any>[]
    addMediaItem: (index: number, sub?: MediaItem<any>) => void
    currentIndex: number
    updateMediaItem: (item: MediaItem<any>, updatedValues: Object) => void // FIXME refine updatedValues
    removeMediaItem: (item: MediaItem<any>) => void
    checkMediaItem: (item: MediaItem<any>) => boolean
}

const MediaItemList = ({
    mediaItems,
    addMediaItem,
    currentIndex,
    updateMediaItem,
    removeMediaItem,
    checkMediaItem,
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
