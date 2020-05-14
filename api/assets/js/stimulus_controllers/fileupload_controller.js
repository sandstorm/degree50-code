import { Controller } from "stimulus"
const Dropzone = require('dropzone/dist/min/dropzone.min');
import 'dropzone/dist/dropzone.css';
window.D = Dropzone;

Dropzone.autoDiscover = false;

export default class extends Controller {
  connect() {
    const endpoint = this.data.get('endpoint');
    const id = this.data.get('id');

    this.element.classList.add('dropzone');

    new Dropzone(this.element, {
      url: endpoint,
      //chunking: true,
      //chunkSize: 1000000, // 1 MB; TODO adjust.
      params: {
        id: id
      },
      accept: function(file, done) {
        if (file.name == "justinbieber.jpg") {
          done("Naha, you don't.");
        }
        else { done(); }
      }
    });
    console.log("INITED");
  }
}
