import React, { useRef } from 'react'
import { watchModals } from '@react-aria/aria-modal-polyfill'
import { OverlayProvider } from '@react-aria/overlays'
import { I18nProvider } from '@react-aria/i18n'
import VideoAnalysis from './Domain/ExercisePhases/VideoAnalysis'
import { useDebouncedResizeObserver } from '../../Components/VideoEditor/utils/useDebouncedResizeObserver'

export const ExercisePhaseApp: React.FC = () => {
  // react-aria-modal watches a container element for aria-modal nodes and
  // hides the rest of the dom from screen readers with aria-hidden when one is open.
  watchModals()

  const ref: React.RefObject<HTMLDivElement> = useRef(null)

  // FIXME
  // We are currently unsure if we still need this.
  // Therefore we should properly test if it works without this observer and if
  // so remove it.
  const { height } = useDebouncedResizeObserver(ref, 500)

  return (
    <I18nProvider locale="de-DE">
      <OverlayProvider className={'exercise-phase__inner solutions-container'}>
        <div className={'exercise-phase__content'} ref={ref}>
          {height > 0 && <VideoAnalysis />}
        </div>
      </OverlayProvider>
    </I18nProvider>
  )
}
