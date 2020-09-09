import {Controller} from "stimulus"
import Axios from 'axios'

export default class extends Controller {
    connect() {
        const updateVideoCodesList = (videoCodesList) => {
            const updateEndPoint = videoCodesList.getAttribute('data-update-endpoint')

            Axios.post(updateEndPoint)
                .then(function (response) {
                    videoCodesList.innerHTML = response.data
                })
                .catch(function (e) {
                    console.error('>>>>> update material list failed', e);
                })
        }

        const formSubmitButton = document.getElementById('add-new-video-code');
        const endpoint = this.data.get('endpoint');
        const updateOnSuccess = this.data.get('update');
        const videoCodesList = document.getElementById(updateOnSuccess);

        formSubmitButton.onclick = ((event) => {
            const color = document.getElementById('video-code-color').value
            const name = document.getElementById('video-code-name').value

            formSubmitButton.setAttribute('disabled', 'distabled')

            if (color && name) {
                Axios.post(endpoint, {
                    color: color,
                    name: name
                })
                    .then(function (response) {
                        console.log(response)
                        updateVideoCodesList(videoCodesList)
                    })
                    .catch(function (e) {
                        console.error('>>>>> add video-code failed', e);
                    })
                    .finally(function () {
                        formSubmitButton.removeAttribute('disabled')
                    })
            }
        })
    }
}
