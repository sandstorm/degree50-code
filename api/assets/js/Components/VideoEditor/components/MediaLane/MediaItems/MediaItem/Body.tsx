import {
  MediaItemTypeWithTypeInformation,
  MediaItem as MediaItemClass,
} from 'Components/VideoEditor/types'
import React from 'react'
import MediaItemLabel from './MediaItemLabel'

type Props = {
  onMouseDown: (event: any) => void
  item: MediaItemClass<MediaItemTypeWithTypeInformation>
  showTextInMediaItems: boolean
}

const Body = (props: Props) => {
  const { onMouseDown, item, showTextInMediaItems } = props

  return (
    <div className="video-editor__media-items__text" onMouseDown={onMouseDown}>
      <MediaItemLabel item={item} showTextInMediaItems={showTextInMediaItems} />
    </div>
  )
}

export default React.memo(Body)
