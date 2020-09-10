import {Controller} from "stimulus"
import Axios from 'axios'

export default class extends Controller {
    connect() {
        // TODO pop modal to confirm deletion
        const endpoint = this.element.getAttribute('href');
        const button = this.element;

        button.onclick = ((event) => {
            event.preventDefault();
            button.setAttribute('disabled', '')
            button.classList.add('disabled');

            Axios.get(endpoint).then(function () {
                // remove entry
                button.parentElement.remove()
            }).catch(function (e) {
                console.error('>>>>> remove entity failed', e)
            }).finally(function () {
                button.removeAttribute('disabled')
            })
        });

    }
}
