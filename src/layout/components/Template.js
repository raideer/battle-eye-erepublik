import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

import Header from './Header';

import '../styles/app.scss';

export default class Template extends React.Component {
    render() {
        return (
            <div className="bo__Container">
                <Header />
                <Tabs>
                    <TabList>
                        <Tab>Tab1</Tab>
                        <Tab>Tab2</Tab>
                    </TabList>
                    <TabPanel>Tab1</TabPanel>
                    <TabPanel>Tab 2</TabPanel>
                </Tabs>
            </div>
        );
    }
}
