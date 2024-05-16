# Accessibility

(WIP - snippet collection)

## Accessible Online Video

https://bik-fuer-alle.de/leitfaden-barrierefreie-online-videos.html

- Audiodeskriptions-Audio-Spur in Video
  - (possible with bbc/VideoContext)


### Automatische Untertitelung

- !! https://cloud.google.com/speech-to-text/
- !! https://github.com/zhw2590582/SubPlayer


### Sprachsynthese (für blinde)

https://mdn.github.io/web-speech-api/speak-easy-synthesis/
https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis
    - FF / Chrome / Safari


## general React Accessibility

**Background:**

- https://medium.com/hackernoon/its-a-focus-trap-699a04d66fb5
- https://reactjs.org/docs/accessibility.html
  - esp. https://reactjs.org/docs/accessibility.html#programmatically-managing-focus
- https://inclusive-components.design example components (markup)
- https://github.com/reactjs/rfcs/pull/109 (Pull Request for Focus management, not yet merged)

**Implementations**

- Components
    - https://github.com/davidtheclark/react-aria-modal
    - https://github.com/davidtheclark/react-aria-menubutton
    - https://github.com/davidtheclark/react-aria-tabpanel
    - !! https://github.com/theKashey/react-focus-on
- Libraries
  - Focus Management:
    - https://github.com/enactjs/enact/tree/master/packages/spotlight
    - https://github.com/diiq/phocus
  - !! Focus Lock: https://github.com/theKashey/react-focus-lock
  - Announcing Page Changes: https://github.com/AlmeroSteyn/react-aria-live
  - !! Spatial Navigation: https://github.com/bbc/lrud / https://github.com/bbc/react-lrud
  -

**Testers**

- !! https://github.com/dequelabs/react-axe / https://github.com/dequelabs/axe-core
    - **Idea: TestCafe and Axe Combination**: https://github.com/helen-dikareva/axe-testcafe
- https://khan.github.io/tota11y/
- !! Lighthouse
