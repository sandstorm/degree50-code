import React from 'react'
import { TabTypes } from 'StimulusControllers/types'
import { tabs as Tabs } from './Tabs'

const renderTabs = (tabs: typeof Tabs, activeTabId: TabTypes, setActiveTabId: (tab: TabTypes) => void) =>
    Object.values(tabs).map((tab) => (
        <li role="presentation" key={tab.id}>
            <a className={tab.id === activeTabId ? 'active' : ''} role="tab" onClick={() => setActiveTabId(tab.id)}>
                {tab.label}
            </a>
        </li>
    ))

type Props = {
    activeTabId: TabTypes
    setActiveTabId: (tab: TabTypes) => void
    tabs: typeof Tabs
}

const EditorTabs = ({ tabs, activeTabId, setActiveTabId }: Props) => {
    return (
        <ul className="subtitle-editor__tabs" role="tablist">
            {renderTabs(tabs, activeTabId, setActiveTabId)}
        </ul>
    )
}

export default React.memo(EditorTabs)
