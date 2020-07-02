import {Controller} from "stimulus"
import ReactDOM from 'react-dom';
import React from 'react';
import {ApolloProvider} from '@apollo/react-hooks';
import {client} from '../ApolloGraphqlClient';
import widgets from '../Widgets/Index';

export default class extends Controller {
    connect() {
        const widgetName = this.data.get('widget');
        const propsAsString = this.data.get('props');

        const ReactWidget = widgets[widgetName];
        const props = propsAsString ? JSON.parse(propsAsString) : {};
        ReactDOM.render(
            <ApolloProvider client={client}>
                <ReactWidget {...props} />
            </ApolloProvider>
            , this.element);
    }
}
