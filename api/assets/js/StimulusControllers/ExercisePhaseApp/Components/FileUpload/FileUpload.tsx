import React, {useCallback} from 'react';
import {connect} from 'react-redux';
import {useDropzone} from 'react-dropzone'
import {selectConfig} from "../Config/ConfigSlice";
import 'dropzone/dist/dropzone.css';


const mapStateToProps = (state: any) => ({
    config: selectConfig(state)
});

const mapDispatchToProps = (dispatch: any) => ({
});

type AdditionalProps = {
    // currently none
}

type FileUploadProbs = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const FileUpload: React.FC<FileUploadProbs> = ({...props}) => {
    const endpoint = 'endpoint' // TODO get from config
    const id = 'id'

    const onDrop = useCallback(acceptedFiles => {
        console.log(acceptedFiles)
        // Do something with the files
    }, [])
    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return (
        <div className={'dropzone'} {...getRootProps()}>
            <input {...getInputProps()} />
            <div className={'dz-message'}>
                {
                    isDragActive ?
                        <p>Drop the files here ...</p> :
                        <p>Drag 'n' drop some files here, or click to select files</p>
                }
            </div>
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(FileUpload);