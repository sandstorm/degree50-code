import React, { useCallback } from 'react'
import { connect } from 'react-redux'
import { useDropzone } from 'react-dropzone'
import { selectConfig } from '../Config/ConfigSlice'
import 'dropzone/dist/dropzone.css'
import { AppState, AppDispatch } from 'StimulusControllers/ExercisePhaseApp/Store/Store'

const mapStateToProps = (state: AppState) => ({
    config: selectConfig(state),
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({})

type AdditionalProps = {
    // currently none
}

type FileUploadProbs = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

const FileUpload: React.FC<FileUploadProbs> = (props) => {
    const endpoint = 'endpoint' // TODO get from config
    const id = 'id'

    const onDrop = useCallback((acceptedFiles) => {
        // TODO: implement!
        // send files to server
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    return (
        <div className={'dropzone'} {...getRootProps()}>
            <input {...getInputProps()} />
            <div className={'dz-message'}>
                {isDragActive ? (
                    <p>Drop the files here ...</p>
                ) : (
                    <p>Drag 'n' drop some files here, or click to select files</p>
                )}
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(FileUpload)
