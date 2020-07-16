import {Controller} from "stimulus"
const Dropzone = require('dropzone/dist/min/dropzone.min');
import 'dropzone/dist/dropzone.css';

Dropzone.autoDiscover = false;

export default class extends Controller {
    connect() {
        const endpoint = this.data.get('endpoint');
        const id = this.data.get('id');

        this.element.classList.add('dropzone');

        new Dropzone(this.element, {
            url: endpoint,
            chunking: true,
            chunkSize: 10000000, // 10 MB
            dictDefaultMessage: 'Hier klicken um Video hochzuladen',
            maxFiles: 1,
            acceptedFiles: 'video/*',
            params: function params(files, xhr, chunk) {
                if (chunk) {
                    return {
                        id: id,

                        dzuuid: chunk.file.upload.uuid,
                        dzchunkindex: chunk.index,
                        dztotalfilesize: chunk.file.size,
                        dzchunksize: this.options.chunkSize,
                        dztotalchunkcount: chunk.file.upload.totalChunkCount,
                        dzchunkbyteoffset: chunk.index * this.options.chunkSize
                    };
                }

                return {
                    id: id
                };

            },
            accept: function (file, done) {
                if (file.name == "justinbieber.jpg") {
                    done("Naha, you don't.");
                }
                else {done();}
            }
        });
    }
}
