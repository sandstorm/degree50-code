import { VideoJsPlayer } from 'video.js'
import { useEffect, useState } from 'react'
import { AnyAction } from '@reduxjs/toolkit'
import { useAppDispatch } from '../../StimulusControllers/ExerciseAndSolutionStore/hooks'

export type CustomVideoControlConfig = {
  controlText: string
  ariaLabel: string
  iconClassNames: Array<string>
  action: AnyAction
  indexPosition: number
}

export const useAddCustomVideoJsComponent = (
  config: CustomVideoControlConfig,
  player?: VideoJsPlayer
) => {
  const [isCustomComponentInitialized, setIsCustomComponentInitialized] =
    useState(false)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (player && !isCustomComponentInitialized) {
      // WHY: Only set up custom controls once (effect is run every time 'player' changes - e.g. on play toggle)
      setIsCustomComponentInitialized(true)

      // add new button in ControlBar at specified position
      const button = player
        .getChild('ControlBar')
        ?.addChild('button', undefined, config.indexPosition)

      if (button) {
        // set title
        button.controlText(config.controlText)
        // set aria label
        button.el().setAttribute('aria-label', config.ariaLabel)

        // create Icon
        const icon = document.createElement('i')
        icon.classList.add(
          'vjs-icon-placeholder',
          'video-player__custom-control__icon',
          ...config.iconClassNames
        )
        icon.setAttribute('aria-hidden', 'true')
        // replace icon placeholder with new Icon
        button.el().querySelector('.vjs-icon-placeholder')?.replaceWith(icon)

        // add click handler
        button.on('click', () => {
          dispatch(config.action)
        })
      }
    }
  }, [
    player,
    config,
    isCustomComponentInitialized,
    setIsCustomComponentInitialized,
  ])
}
