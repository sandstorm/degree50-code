import AnnotationsMenu from '../AnnotationsContext/AnnotationsMenu'
import AufgabeMenu from '../Aufgabe/AufgabeMenu'
import CuttingMenu from '../CuttingContext/CuttingMenu'
import TeamMenu from '../Team/TeamMenu'
import VideoCodesMenu from '../VideoCodesContext/VideoCodesMenu'
import ZusatzAttachmentMenu from '../ZusatzAttachment/ZusatzAttachmentMenu'
import FilterMenu from '../FilterContext/FilterMenu'
import ShortCutsMenu from '../ShortCutsContext/ShortCutsMenu'
import AllMediaItemsMenu from '../AllMediaItemsContext/AllMediaItemsMenu'

const Toolbar = () => {
  return (
    <div className="video-editor__toolbar">
      <AllMediaItemsMenu />
      <AnnotationsMenu />
      <VideoCodesMenu />
      <CuttingMenu />
      <AufgabeMenu />
      <ZusatzAttachmentMenu />
      <TeamMenu />
      <FilterMenu />
      <ShortCutsMenu />
    </div>
  )
}

export default Toolbar
