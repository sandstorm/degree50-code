import React from 'react';

import Form from "@rjsf/core";

import SchemaField from '@rjsf/core/lib/components/fields/SchemaField';

const log = (type: any) => console.log.bind(console, type);

import { JSONSchema7 } from 'json-schema';

const onChange = ({ formData }: any, formFieldId: string) => {
    const propsAsString = JSON.stringify(formData);
    const inputField = document.getElementById(formFieldId);
    inputField.setAttribute('value', propsAsString);
};

import schema from '../../../api-definitions/ExercisePhaseConfigSchema.json';
import AutocompleteDropdown from '../../Components/AutocompleteDropdown/AutocompleteDropdown';

const VideoAutocomplete = (props: any) => {
    // TODO: PROPS mapping
    return <AutocompleteDropdown />
};

const CustomStringField = (props: any) => {
    if (props.schema['type'] === 'string' && props.schema['enum']?.length === 1) {
        if (props.value !== props.schema['enum'][0]) {
            window.setTimeout(() => {
                props.onChange(props.schema['enum'][0]);
            }, 1);
        }
        return null;
    }

    console.log(props.schema['ui:widget']);
    if (props.schema['ui:widget'] === 'VideoAutocompleteDropdown') {
        console.log("CALLED");
        return <VideoAutocomplete {...props} />
    }

    return <SchemaField {...props} />;
}

const fields = {
    SchemaField: CustomStringField
};

const JsonSchemaEditor = (props: any) => {
    return <Form schema={schema as JSONSchema7} fields={fields} formData={props.formData}
        onChange={(formData: object) => onChange(formData, props.formFieldId)}
        onSubmit={onChange}
        onError={log("errors")} />;

};


const ExercisePhaseDefinitionEditor = (props: any) => {
    return <JsonSchemaEditor formData={props} formFieldId={props.formFieldId} />;
};
export default ExercisePhaseDefinitionEditor;
