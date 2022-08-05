import React from 'react'

type Props = {
  side: 'left' | 'right'
  width: number
  onMouseDown: (event: any) => void
  onClick: React.MouseEventHandler<HTMLDivElement>
}

const ItemHandle = (props: Props) => {
  const { side, width, onMouseDown, onClick } = props

  return (
    <div
      className="video-editor__media-item__handle"
      style={{
        [side]: 0,
        width,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    />
  )
}

export default React.memo(ItemHandle)
