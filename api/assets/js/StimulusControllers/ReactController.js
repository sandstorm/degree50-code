import { Controller } from "stimulus"
import ReactDOM from 'react-dom';
import React from 'react';

import widgets from '../Widgets/Index';

export default class extends Controller {
  connect() {
    console.log("CONNECT434");
    const widgetName = this.data.get('widget');
    console.log(widgetName);
    const propsAsString = this.data.get('props');

    const ReactWidget = widgets[widgetName];
    console.log("ReactWidget", ReactWidget);
    const props = propsAsString ? JSON.parse(propsAsString) : {};
    ReactDOM.render(<ReactWidget {...props} />, this.element);
  }
}
