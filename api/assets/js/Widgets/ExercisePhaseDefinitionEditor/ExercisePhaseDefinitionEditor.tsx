import React from 'react';

import Form from "@rjsf/core";

const log = (type: any) => console.log.bind(console, type);

import { JSONSchema7 } from 'json-schema';

const onChange = ({ formData }: any, formFieldId: string) => {
    const propsAsString = JSON.stringify(formData);
    const inputField = document.getElementById(formFieldId);
    inputField.setAttribute('value', propsAsString);
};

import schema from '../../../api-definitions/ExercisePhaseConfigSchema.json';

const JsonSchemaEditor = (props: any) => {
    return <Form schema={schema as JSONSchema7} formData={props.formData}
        onChange={(formData: object) => onChange(formData, props.formFieldId)}
        onSubmit={onChange}
        onError={log("errors")} />;

};


const ExercisePhaseDefinitionEditor = (props: any) => {
    return <JsonSchemaEditor formData={props} formFieldId={props.formFieldId} />;
};
export default ExercisePhaseDefinitionEditor;
