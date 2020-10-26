import {Controller} from "stimulus"
import 'dropzone/dist/dropzone.css';
import Axios from 'axios'

const Dropzone = require('dropzone/dist/min/dropzone.min');

Dropzone.autoDiscover = false;

export default class extends Controller {
    connect() {
        const updateMaterialList = (materialList) => {
            const updateEndPoint = materialList.getAttribute('data-update-endpoint')

            Axios.post(updateEndPoint)
                .then(function (response) {
                    materialList.innerHTML = response.data
                })
                .catch(function (e) {
                    console.error('>>>>> update material list failed', e);
                })
        }

        const endpoint = this.data.get('endpoint');
        const removeEndpoint = this.data.get('remove-endpoint');
        const id = this.data.get('id');
        const phaseId = this.data.get('phase-id')
        const uploadLabel = this.data.get('label');
        const updateOnSuccess = this.data.get('update');
        const materialList = document.getElementById(updateOnSuccess);

        this.element.classList.add('dropzone');

        new Dropzone(this.element, {
            url: endpoint,
            timeout: 2 * 60 * 1000, // 2 minutes
            chunking: true,
            chunkSize: 5000000, // 5 MB
            retryChunks: true,
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
            success: function (file, response) {
                // add materialId to the file to eventually delete it after direct upload
                file.materialId = response.materialId;

                // update list of material
                updateMaterialList(materialList);

                // This return statement is necessary to remove progress bar after uploading.
                return file.previewElement.classList.add("dz-success");
            },
            removedfile: function (file) {
                Axios.post(removeEndpoint, {
                    materialId: file.materialId,
                }).then(function () {
                    // update list of material
                    updateMaterialList(materialList)
                }).catch(function (e) {
                    console.error('>>>>> remove material failed', e)
                })

                let _ref;
                return (_ref = file.previewElement) != null ? _ref.parentNode.removeChild(file.previewElement) : void 0;
            }
        });
    }
}
