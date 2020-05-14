import React from 'react';
import styled from 'styled-components';
import { Translate } from 'react-i18nify';

const Tool = styled.div`
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    font-size: 13px;

    .item {
        display: flex;
        align-items: center;
        padding: 5px 10px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.4);

        .value {
            display: flex;
            align-items: center;
            select {
                outline: none;
                margin-left: 15px;
            }
            button {
                height: 25px;
                border: none;
                padding: 0 10px;
                margin-left: 15px;
                outline: none;
                cursor: pointer;
                font-size: 12px;
                color: #fff;
                border-radius: 3px;
                background-color: rgb(26, 83, 109);
                transition: all 0.2s ease;
                &:hover {
                    color: #fff;
                    background-color: #2196f3;
                }
                i {
                    margin-right: 5px;
                }
            }
        }
    }
`;

export default function({ timeOffsetSubtitles }) {
    return (
        <Tool>
            <div className="item">
                <div className="title">
                    <Translate value="time-offset" />
                </div>
                <div className="value">
                    <button onClick={() => timeOffsetSubtitles(-0.1)}>-100ms</button>
                    <button onClick={() => timeOffsetSubtitles(0.1)}>+100ms</button>
                    <button onClick={() => timeOffsetSubtitles(-1)}>-1000ms</button>
                    <button onClick={() => timeOffsetSubtitles(1)}>+1000ms</button>
                </div>
            </div>
        </Tool>
    );
}
