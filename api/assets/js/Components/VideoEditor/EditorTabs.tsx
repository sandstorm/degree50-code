import React from 'react'
import { Tab } from './Tabs'
import { TabsTypesEnum } from 'types'

const renderTabs = (tabs: Array<Tab>, activeTabId: TabsTypesEnum, setActiveTabId: (tab: TabsTypesEnum) => void) =>
    tabs.map((tab) => (
        <li role="presentation" key={tab.id}>
            <a className={tab.id === activeTabId ? 'active' : ''} role="tab" onClick={() => setActiveTabId(tab.id)}>
                {tab.label}
            </a>
        </li>
    ))

type Props = {
    activeTabId: TabsTypesEnum
    setActiveTabId: (tab: TabsTypesEnum) => void
    tabs: Array<Tab>
}

const EditorTabs = ({ tabs, activeTabId, setActiveTabId }: Props) => {
    return (
        <ul className="video-editor__tabs" role="tablist">
            {renderTabs(tabs, activeTabId, setActiveTabId)}
        </ul>
    )
}

export default React.memo(EditorTabs)
