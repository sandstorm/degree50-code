import EditMaterialMenu from 'Components/MaterialEditor/Toolbar/EditMaterialMenu'
import AufgabeMenu from 'Components/ToolbarItems/Aufgabe/AufgabeMenu'
import FilterMenu from 'Components/ToolbarItems/FilterContext/FilterMenu'
import ShortCutsMenu from 'Components/ToolbarItems/ShortCutsContext/ShortCutsMenu'
import TeamMenu from 'Components/ToolbarItems/Team/TeamMenu'
import ZusatzAttachmentMenu from 'Components/ToolbarItems/ZusatzAttachment/ZusatzAttachmentMenu'
import MaterialSolutionMenu from './MaterialSolutionMenu'

const MaterialSolutionToolbar = () => {
  return (
    <div className="video-editor__toolbar">
      <EditMaterialMenu />
      <MaterialSolutionMenu />
      <AufgabeMenu />
      <ZusatzAttachmentMenu />
      <TeamMenu />
      <FilterMenu />
      <ShortCutsMenu />
    </div>
  )
}

export default MaterialSolutionToolbar
