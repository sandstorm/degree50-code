import React from 'react'
import { connect } from 'react-redux'
import { ConfigStateSlice, selectors } from '../Config/ConfigSlice'
import PDFViewer from 'pdf-viewer-reactjs'
import { MaterialViewerStateSlice, selectActiveMaterial, setActiveMaterial } from './MaterialViewerSlice'
import Button from 'Components/Button/Button'

const mapStateToProps = (state: ConfigStateSlice & MaterialViewerStateSlice) => ({
    config: selectors.selectConfig(state),
    activeMaterial: selectActiveMaterial(state),
})

const mapDispatchToProps = {
    setActiveMaterial: setActiveMaterial,
}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

export type Material = {
    id: string
    name: string
    type: string
    url: string
}

const mapMaterialTypeToIcon = (type: Material['type']) => {
    if (type.startsWith('audio/')) {
        return 'file-audio'
    }

    if (type.startsWith('video/')) {
        return 'file-video'
    }

    if (type.startsWith('image/')) {
        return 'file-image'
    }

    switch (type) {
        case 'application/pdf':
            return 'file-pdf'
        case 'application/msword':
            return 'file-word'
        case 'application/msexcel':
            return 'file-excel'
        case 'application/mspowerpoint':
            return 'file-powerpoint'
        default:
            return 'file'
    }
}

const MaterialViewer: React.FC<Props> = (props) => {
    const materialTiles = props.config.material.map(function (material: Material) {
        return (
            <button
                key={material.id}
                className={'btn tile tile--small'}
                title={material.name}
                aria-label={material.name}
                onClick={() => props.setActiveMaterial(material)}
            >
                <div className={'tile__content'}>
                    <i className={`tile__icon fas fa-${mapMaterialTypeToIcon(material.type)}`}></i>
                    <span className="tile__title">{material.name}</span>
                </div>
            </button>
        )
    })

    return (
        <div className={'material-viewer'}>
            {props.activeMaterial ? (
                <div className={'material-viewer'}>
                    <header className={'material-viewer__header'}>
                        <h4>{props.activeMaterial.name}</h4>
                    </header>

                    <div className={'material-viewer__actions'}>
                        <Button
                            className={'btn btn-sm btn-outline-primary'}
                            title="Zurück zur Material-Übersicht"
                            onPress={() => props.setActiveMaterial(undefined)}
                        >
                            <i className={'fas fa-chevron-left'}></i>
                            <span>Zurück</span>
                        </Button>
                        <a
                            className={'btn btn-sm btn-primary'}
                            href={props.activeMaterial.url}
                            aria-label="Download"
                            title="Download"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <i className={'fas fa-download'}></i>
                            <span>Download</span>
                        </a>
                    </div>

                    {props.activeMaterial.type === 'application/pdf' ? (
                        <PDFViewer
                            document={{
                                url: props.activeMaterial.url,
                            }}
                            hideZoom={true}
                            hideRotation={true}
                            css="pdf-viewer"
                            loader={
                                <h2 className={'pdf-viewer__loader'}>
                                    <i className={'fas fa-spinner fa-spin'}></i>
                                </h2>
                            }
                            alert={() => (
                                <div className={'pdf-viewer__error'}>
                                    <h4>Dokument konte nicht geladen werden</h4>
                                </div>
                            )}
                            navigation={{
                                css: {
                                    navbarWrapper: 'pdf-viewer__navbar',
                                    previousPageBtn: 'btn btn-sm btn-primary pdf-viewer__prev-page',
                                    pageIndicator: 'pdf-viewer__pages',
                                    nextPageBtn: 'btn btn-sm btn-primary pdf-viewer__next-page',
                                },
                            }}
                        />
                    ) : null}
                </div>
            ) : (
                <div className={'tiles'}>
                    {materialTiles.length > 0 ? materialTiles : 'Kein Material zur Verfügung'}
                </div>
            )}
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(MaterialViewer)
