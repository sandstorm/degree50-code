import React from 'react'
import Row from './Row/Row'
import { MediaItem } from '../types'

export type Props = {
    mediaItems: MediaItem<any>[]
    addMediaItem?: (index: number, sub?: MediaItem<any>) => void
    currentIndex: number
    setCurrentIndex?: (index: number) => void
    updateMediaItem: (item: MediaItem<any>, updatedValues: Record<string, unknown>) => void // FIXME refine updatedValues
    removeMediaItem: (item: MediaItem<any>) => void
    checkMediaItem: (item: MediaItem<any>) => boolean
    children?: React.ReactNode | React.ReactNodeArray
    moveItemUp?: (indexToMove: number) => void
    moveItemDown?: (indexToMove: number) => void
}

const MediaItemList = ({
    mediaItems,
    addMediaItem,
    setCurrentIndex,
    children,
    currentIndex,
    updateMediaItem,
    removeMediaItem,
    checkMediaItem,
    moveItemUp,
    moveItemDown,
}: Props) => {
    return (
        <div className="video-editor__media-item-list">
            {children}
            <ul className="video-editor__media-item-list__table">
                {mediaItems.map((mediaItem, index) => {
                    const id = index.toString()
                    const handleMoveItemUp =
                        index !== 0
                            ? moveItemUp &&
                              (() => {
                                  moveItemUp(index)
                                  setCurrentIndex && setCurrentIndex(index - 1)
                              })
                            : undefined

                    const handleMoveItemDown =
                        index < mediaItems.length - 1
                            ? moveItemDown &&
                              (() => {
                                  moveItemDown(index)
                                  setCurrentIndex && setCurrentIndex(index + 1)
                              })
                            : undefined

                    return (
                        <Row
                            key={id}
                            id={id}
                            rowData={mediaItem}
                            index={index}
                            checkMediaItem={checkMediaItem}
                            removeMediaItem={removeMediaItem}
                            addMediaItem={addMediaItem}
                            updateMediaItem={updateMediaItem}
                            currentIndex={currentIndex}
                            moveItemUp={handleMoveItemUp}
                            moveItemDown={handleMoveItemDown}
                        />
                    )
                })}
            </ul>
        </div>
    )
}

export default React.memo(MediaItemList)
