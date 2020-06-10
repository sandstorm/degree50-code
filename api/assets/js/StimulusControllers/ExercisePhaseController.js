import { Controller } from "stimulus"
import ReactDOM from 'react-dom';
import React from 'react';
import { ApolloProvider } from '@apollo/react-hooks';
import {client} from '../ApolloGraphqlClient';
import widgets from '../Widgets/Index';

export default class extends Controller {
    connect() {
        const propsAsString = this.data.get('props');
        const props = propsAsString ? JSON.parse(propsAsString) : {};

        ReactDOM.render(
            <ApolloProvider client={client}>
                Components: {props.components}
            </ApolloProvider>
            , this.element);
    }
}
