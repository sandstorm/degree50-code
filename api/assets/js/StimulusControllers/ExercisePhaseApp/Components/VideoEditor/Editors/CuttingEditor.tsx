import React from 'react'
import { connect } from 'react-redux'

import { AppState } from 'StimulusControllers/ExercisePhaseApp/Store/Store'

type OwnProps = {}

const mapStateToProps = (state: AppState) => ({})

const mapDispatchToProps = {}

type Props = ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps & OwnProps

// TODO
// this has yet to be built
const CuttingEditor = ({}: Props) => {
    return <p>TODO</p>
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(CuttingEditor))
