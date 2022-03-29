import React, { ChangeEvent, FocusEventHandler, memo } from 'react'
import { connect } from 'react-redux'
import { AppState } from '../../../../StimulusControllers/ExerciseAndSolutionStore/Store'
import {
    allShortCutModifiers,
    selectShortCutConfigurationById,
    ShortCutId,
    ShortCutModifierId,
    toggleModifierForShortCut,
    setKeyForShortCut,
    selectHotKeyByShortCutId,
} from '../ShortCutsSlice'
import { persistShortCuts } from '../ShortCutsSaga'
import Accordion from '../../../Accordion/Accordion'

const modifierToLabelMap: Record<ShortCutModifierId, string> = {
    [ShortCutModifierId.CTRL]: 'Control',
    [ShortCutModifierId.ALT]: 'Alt',
    [ShortCutModifierId.OPTION]: 'Option',
    [ShortCutModifierId.SHIFT]: 'Shift',
}

const shortCutIdToLabelMap: Record<ShortCutId, string> = {
    [ShortCutId.TOGGLE_PLAY]: 'VideoPlayer play/pause',
}

type OwnProps = {
    shortCutId: ShortCutId
}

const mapStateToProps = (state: AppState, ownProps: OwnProps) => ({
    shortCutConfiguration: selectShortCutConfigurationById(state, ownProps.shortCutId),
    shortCutText: selectHotKeyByShortCutId(state, ownProps.shortCutId),
})

const mapDispatchToProps = {
    toggleModifierForShortCut,
    setKeyForShortCut,
    persistShortCuts,
}

type Props = OwnProps & ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps

const ShortCutConfiguration = (props: Props) => {
    const handleKeyFocus: FocusEventHandler<HTMLInputElement> = (ev) => {
        ev.target.select()
    }

    const handleKeyInput = (ev: ChangeEvent<HTMLInputElement>) => {
        const newKey = ev.target.value

        // prevent empty value
        if (newKey !== '') {
            props.setKeyForShortCut({ shortCutId: props.shortCutId, key: newKey })
            props.persistShortCuts()
        }

        // WHY: Hack: Pressing `delete` or `carriage return` somehow prevents the browser from selecting the input value again.
        setTimeout(() => {
            ev.target.select()
        }, 0)
    }

    const title = (
        <span className="short-cut-configuration__title">
            <span>{shortCutIdToLabelMap[props.shortCutId]}</span>
            <span>({props.shortCutText})</span>
        </span>
    )

    const inputId = `${props.shortCutId}-key`

    return (
        <Accordion title={title} buttonTitleClose="Bearbeitung beenden" buttonTitleOpen="TastenKombination bearbeiten">
            <div className="short-cut-configuration">
                <div className="short-cut-configuration__modifier-list">
                    {allShortCutModifiers.map((modifierId) => {
                        const id = `shortCut-${props.shortCutId}-modifier--${modifierId}`

                        const enabled = props.shortCutConfiguration.modifiers[modifierId].enabled
                        const handleChange = () => {
                            props.toggleModifierForShortCut({ shortCutId: props.shortCutId, modifierId: modifierId })
                            props.persistShortCuts()
                        }

                        return (
                            <label
                                key={id}
                                htmlFor={id}
                                className="short-cut-configuration__modifier highlight-focus-within"
                            >
                                <input id={id} type="checkbox" checked={enabled} onChange={handleChange} />
                                {modifierToLabelMap[modifierId]}
                            </label>
                        )
                    })}
                </div>
                <label htmlFor={inputId}>
                    Taste:
                    <input
                        id={inputId}
                        type="text"
                        maxLength={1}
                        value={props.shortCutConfiguration.key}
                        onInput={handleKeyInput}
                        onFocus={handleKeyFocus}
                        className="short-cut-configuration__key"
                    />
                </label>
            </div>
        </Accordion>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(memo(ShortCutConfiguration))
