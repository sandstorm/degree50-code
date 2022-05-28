import React from 'react'

type Props = {
  side: 'left' | 'right'
  width: number
  onMouseDown: (event: any) => void
}

const ItemHandle = (props: Props) => {
  const { side, width, onMouseDown } = props

  return (
    <div
      className="video-editor__media-item__handle"
      style={{
        [side]: 0,
        width,
      }}
      onMouseDown={onMouseDown}
    />
  )
}

export default React.memo(ItemHandle)
