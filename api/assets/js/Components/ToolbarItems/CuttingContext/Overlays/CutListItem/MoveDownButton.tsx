import Button from 'Components/Button/Button'
import React from 'react'

type Props = {
  moveDown: () => void
}

const MoveDownButton = ({ moveDown }: Props) => {
  return (
    <Button
      title="Schnitt nach hinten schieben"
      className="btn btn-primary btn-sm"
      onPress={moveDown}
    >
      <i className="fas fa-caret-down" />
    </Button>
  )
}

export default React.memo(MoveDownButton)
