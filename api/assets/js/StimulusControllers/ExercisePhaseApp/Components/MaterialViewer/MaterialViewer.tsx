import React from 'react'
import { connect } from 'react-redux'
import { selectors } from '../Config/ConfigSlice'
import PDFViewer from 'pdf-viewer-reactjs'
import { selectActiveMaterial, setActiveMaterial } from './MaterialViewerSlice'
import { setOverlaySize } from '../Overlay/OverlaySlice'
import { overlaySizesEnum } from '../Overlay/Overlay'
import { AppState, AppDispatch, useAppDispatch } from '../../Store/Store'

const mapStateToProps = (state: AppState) => ({
    config: selectors.selectConfig(state),
    activeMaterial: selectActiveMaterial(state),
})

const mapDispatchToProps = (dispatch: AppDispatch) => ({
    setActiveMaterial: (material?: Material) => dispatch(setActiveMaterial(material)),
})

type AdditionalProps = {
    // currently none
}

type MaterialViewerProps = AdditionalProps & ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

export type Material = {
    id: string
    name: string
    type: string
    url: string
}

const MaterialViewer: React.FC<MaterialViewerProps> = (props) => {
    const dispatch = useAppDispatch()
    const setActiveMaterialWrapper = (material?: Material) => {
        props.setActiveMaterial(material)
        if (material === undefined) {
            dispatch(setOverlaySize(overlaySizesEnum.DEFAULT))
        } else {
            dispatch(setOverlaySize(overlaySizesEnum.LARGE))
        }
    }

    const materialTiles = props.config.material.map(function (material: Material) {
        return (
            <div
                role="button"
                key={material.id}
                className={'tile tile--small'}
                onClick={() => setActiveMaterialWrapper(material)}
            >
                <div className={'tile__content'}>
                    <i className={'tile__icon fas fa-file-pdf'}></i>
                    <span>{material.name}</span>
                </div>
            </div>
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
                        <button
                            className={'btn btn-sm btn-outline-primary'}
                            type="button"
                            onClick={() => setActiveMaterialWrapper(undefined)}
                        >
                            <i className={'fas fa-chevron-left'}></i> Zurück
                        </button>
                        <a className={'btn btn-sm btn-primary'} href={props.activeMaterial.url}>
                            <i className={'fas fa-download'}></i> Download
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
