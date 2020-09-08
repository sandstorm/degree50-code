import {Controller} from "stimulus"
const Dropzone = require('dropzone/dist/min/dropzone.min');
import 'dropzone/dist/dropzone.css';
import Axios from 'axios'


Dropzone.autoDiscover = false;

export default class extends Controller {
    connect() {
        const endpoint = this.data.get('endpoint');
        const removeEndpoint = this.data.get('remove-endpoint');
        const id = this.data.get('id');
        const phaseId = this.data.get('phase-id')
        const uploadLabel = this.data.get('label');

        this.element.classList.add('dropzone');

        new Dropzone(this.element, {
            url: endpoint,
            chunking: true,
            chunkSize: 10000000, // 10 MB
            dictDefaultMessage: uploadLabel,
            maxFiles: 20,
            maxFilesize: 10000, // 10 GB
            acceptedFiles: 'image/*,application/pdf',
            addRemoveLinks: true,
            params: function params(files, xhr, chunk) {
                if (chunk) {
                    return {
                        id: id,
                        target: 'material',
                        phaseId: phaseId,

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
                    target: 'material',
                    phaseId: phaseId,
                };
            },
            accept: function (file, done) {
                if (file.name == "justinbieber.jpg") {
                    done("Naha, you don't.");
                }
                else {
                    done();
                }
            },
            success: function(file, response) {
                file.materialId = response.materialId;
                // Do what you want to do with your response
                // This return statement is necessary to remove progress bar after uploading.
                return file.previewElement.classList.add("dz-success");
            },
            removedfile: function(file) {
                try {
                    Axios.post(removeEndpoint, {
                        materialId: file.materialId,
                    })
                } catch (e) {
                    console.error('>>>>> remove material failed', e)
                }

                let _ref;
                return (_ref = file.previewElement) != null ? _ref.parentNode.removeChild(file.previewElement) : void 0;
            }
        });
    }
}
