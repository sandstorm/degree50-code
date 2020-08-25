import React from 'react'
import { MediaItem } from '../../types'
import { RenderConfig } from '../../MediaLane/MediaTrack'
import Button from 'Components/Button/Button'
import { MediaItemType } from 'Components/VideoEditor/VideoEditorSlice'
import { useModal } from 'Components/Modal/useModal'

type Props = {
    item: MediaItem<MediaItemType>
    id: number
    renderConfig: RenderConfig
    amountOfLanes?: number
}

const ReadOnlyMediaItem = ({ item, id, renderConfig, amountOfLanes = 0 }: Props) => {
    const mediaItemHeight = 100 / (amountOfLanes + 1)
    const { showModal: showMemoModal, RenderModal: RenderMemoModal } = useModal()

    return (
        <div
            className={['video-editor__media-items__item'].join(' ').trim()}
            key={id}
            style={{
                backgroundColor: item.color ? item.color : '',
                left:
                    renderConfig.padding * renderConfig.gridGap +
                    (item.startTime - renderConfig.timelineStartTime) * renderConfig.gridGap * 10,
                width: (item.endTime - item.startTime) * renderConfig.gridGap * 10,
                top: item.lane * mediaItemHeight + '%',
                height: mediaItemHeight + '%',
            }}
        >
            {item.memo ? (
                <Button onPress={showMemoModal} className={'video-editor__media-items__memo-toggle'}>
                    <i className={'fas fa-info'} />
                </Button>
            ) : null}
            <div className="video-editor__media-items__text">
                {item.text.split(/\r?\n/).map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
            <RenderMemoModal title={'Memo'}>{item.memo}</RenderMemoModal>
        </div>
    )
}

export default React.memo(ReadOnlyMediaItem)
