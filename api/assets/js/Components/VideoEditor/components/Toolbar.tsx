import AllMediaItemsMenu from 'Components/ToolbarItems/AllMediaItemsContext/AllMediaItemsMenu'
import AnnotationsMenu from 'Components/ToolbarItems/AnnotationsContext/AnnotationsMenu'
import AufgabeMenu from 'Components/ToolbarItems/Aufgabe/AufgabeMenu'
import CuttingMenu from 'Components/ToolbarItems/CuttingContext/CuttingMenu'
import FilterMenu from 'Components/ToolbarItems/FilterContext/FilterMenu'
import ShortCutsMenu from 'Components/ToolbarItems/ShortCutsContext/ShortCutsMenu'
import TeamMenu from 'Components/ToolbarItems/Team/TeamMenu'
import ToggleVideoFavorite from 'Components/ToolbarItems/ToggleVideoFavorite'
import VideoCodesMenu from 'Components/ToolbarItems/VideoCodesContext/VideoCodesMenu'
import ZusatzAttachmentMenu from 'Components/ToolbarItems/ZusatzAttachment/ZusatzAttachmentMenu'

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
      <ToggleVideoFavorite />
      <ShortCutsMenu />
    </div>
  )
}

export default Toolbar
