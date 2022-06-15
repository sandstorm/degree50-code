import { Controller } from 'stimulus'
import ReactDOM from 'react-dom'
import CKEditorStandalone from 'Components/CKEditor/CKEditorStandalone'

class CKEditorController extends Controller {
  connect() {
    /**
     * WHY: We use a hidden form field to pass the value of CKEditor to symfony forms.
     */
    const hiddenFormField = this.element as HTMLInputElement
    const editorDiv = document.createElement('div')
    editorDiv.setAttribute('data-parent-id', hiddenFormField.id)
    hiddenFormField.insertAdjacentElement('beforebegin', editorDiv)

    // pass the server hydrated value into the CKEditor as initial value
    const initialValue = hiddenFormField.value
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
