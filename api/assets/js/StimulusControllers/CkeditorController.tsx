import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import CKEditorStandalone from 'Components/CKEditor/CKEditorStandalone'

class CKEditorController extends Controller {
  connect() {
    const propsAsString = this.data.get('props')

    const props = propsAsString ? JSON.parse(propsAsString) : {}

    const hiddenFormField = this.element
    const editorDiv = document.createElement('div')
    editorDiv.setAttribute('data-parent-id', hiddenFormField.id)
    hiddenFormField.insertAdjacentElement('beforebegin', editorDiv)

    // @ts-ignore
    const initialValue = this.element.value
    const handleChange = (value: string) => {
      hiddenFormField.setAttribute('value', value)
    }

    ReactDOM.render(
      <CKEditorStandalone
        initialValue={initialValue}
        onChange={handleChange}
      />,
      editorDiv
    )
  }
}

export default CKEditorController
