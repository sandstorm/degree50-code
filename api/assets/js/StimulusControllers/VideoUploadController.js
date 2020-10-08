import {Controller} from "stimulus"
const Dropzone = require('dropzone/dist/min/dropzone.min');
import 'dropzone/dist/dropzone.css';
import Axios from 'axios'

Dropzone.autoDiscover = false;

export default class extends Controller {
    connect() {
        const formSubmitButton = document.getElementById('video_save')
        formSubmitButton.setAttribute('disabled', '')
        const endpoint = this.data.get('endpoint');
        const removeEndpoint = this.data.get('removeEndpoint');
        const id = this.data.get('id');
        const uploadLabel = this.data.get('label');

        this.element.classList.add('dropzone');

        new Dropzone(this.element, {
            url: endpoint,
            chunking: true,
            chunkSize: 10000000, // 10 MB
            dictDefaultMessage: uploadLabel,
            maxFiles: 1,
            maxFilesize: 10000, // 10 GB
            acceptedFiles: 'video/*,video/mp4',
            addRemoveLinks: true,
            init: function() {
                this.on('addedfile', function(file) {
                    if (this.files.length > 1) {
                        this.removeFile(this.files[0]);
                    }
                });
            },
            params: function params(files, xhr, chunk) {
                if (chunk) {
                    return {
                        id: id,
                        target: 'video',

                        dzuuid: chunk.file.upload.uuid,
                        dzchunkindex: chunk.index,
                        dztotalfilesize: chunk.file.size,
                        dzchunksize: this.options.chunkSize,
                        dztotalchunkcount: chunk.file.upload.totalChunkCount,
                        dzchunkbyteoffset: chunk.index * this.options.chunkSize
                    };
                }

                return {
                    id: id,
                    target: 'video',
                };
            },
            success: function() {
                formSubmitButton.removeAttribute('disabled')
            },
            removedfile: function (file) {
                Axios.post(removeEndpoint).then(function () {
                    formSubmitButton.setAttribute('disabled', '')
                    let _ref;
                    return (_ref = file.previewElement) != null ? _ref.parentNode.removeChild(file.previewElement) : void 0;
                }).catch(function (e) {
                    console.error('>>>>> remove video failed', e)
                })
            }
        });
    }
}
