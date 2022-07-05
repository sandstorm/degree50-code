import React, { FC, ReactNode } from 'react'
import CloseButton from './OverlayContainer/CloseButton'

type Props = {
  closeCallback: () => void
  children: React.ReactNode
  title: string
  fullWidth?: boolean
  footerContent?: ReactNode
}

const Overlay: FC<Props> = (props) => {
  const handleKeyDown = (ev: React.KeyboardEvent<HTMLElement>) => {
    if (ev.key === 'Escape') {
      ev.preventDefault()
      props.closeCallback()
      return false
    }
  }

  return (
    <div
      className="video-editor__overlay"
      onKeyDown={handleKeyDown}
      aria-labelledby="overlay-title"
    >
      <div
        className="video-editor__overlay__backdrop"
        onClick={props.closeCallback}
      />
      <div
        className={`video-editor__overlay__wrapper ${
          props.fullWidth ? 'video-editor__overlay__wrapper--fullWidth' : ''
        }`}
      >
        <header className="video-editor__overlay__header">
          <h3 id="overlay-title">{props.title}</h3>
          <CloseButton onClick={props.closeCallback} />
        </header>
        <main className="video-editor__overlay__content">{props.children}</main>
        {props.footerContent !== undefined && (
          <footer className="video-editor__overlay__footer">
            {props.footerContent}
          </footer>
        )}
      </div>
    </div>
  )
}

export default React.memo(Overlay)
