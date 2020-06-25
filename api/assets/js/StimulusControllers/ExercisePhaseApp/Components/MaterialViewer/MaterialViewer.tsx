import React, {useCallback} from 'react';
import {connect} from 'react-redux';
import {selectConfig} from "../Config/ConfigSlice";

const mapStateToProps = (state: any) => ({
    config: selectConfig(state)
});

const mapDispatchToProps = (dispatch: any) => ({
});

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

const MaterialViewer: React.FC<MaterialViewerProps> = ({...props}) => {
    const materialTiles = props.config.material.map(function(material: Material) {
        return <a key={material.id} className={'tile tile--small'} href={material.url}><div className={'tile__content'}><i className={'tile__icon fas fa-file-pdf'}></i><span>{material.name}</span></div></a>
    });

    return (
        <div className={'material-viewer'}>
            <div className={'tiles'}>
                {materialTiles.length > 0 ? materialTiles : 'Kein Material zur Verfügung'}
            </div>
        </div>
    );
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MaterialViewer);