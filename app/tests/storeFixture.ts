// TODO: used?
export const fixtureState = {
    toolbar: {
        activeToolbarItem: '',
        isVisible: false,
    },
    videoEditor: {
        filter: {
            components: {
                videoCode: {
                    id: 'videoCode',
                    isVisible: true,
                },
                videoAnnotation: {
                    id: 'videoAnnotation',
                    isVisible: true,
                },
            },
            componentIds: ['videoCode', 'videoAnnotation'],
            previousSolutions: {},
            previousSolutionIds: [],
        },
        player: {
            syncPlayPosition: 0,
            playPosition: 0,
            isPaused: true,
        },
        mediaLaneRenderConfig: {
            padding: 0,
            duration: 10,
            gridNum: 110,
            gridGap: 10,
            currentTime: 0,
            timelineStartTime: 0,
            drawRuler: true,
            zoom: 0,
            heightModifier: 1,
        },
        overlay: {
            isVisible: false,
            currentOverlayIds: [],
        },
    },
    data: {
        solutions: {
            byId: {
                '969de546-8db4-44c4-a545-a529bbfb400f': {
                    solutionData: {
                        annotations: ['969de546-8db4-44c4-a545-a529bbfb400f_0'],
                        videoCodes: [
                            '969de546-8db4-44c4-a545-a529bbfb400f_0',
                            '969de546-8db4-44c4-a545-a529bbfb400f_1',
                        ],
                        cutList: [],
                        videoCodePrototypes: [
                            '83a8ba59-325d-47ec-8e36-dbb8becb6fd6',
                            'Lr_m3u2ZG',
                        ],
                    },
                    id: '969de546-8db4-44c4-a545-a529bbfb400f',
                    userName: 'admin@sandstorm.de',
                    userId: '6b73b3d9-fe31-4385-83a5-9be91c269187',
                    cutVideo: null,
                    fromGroupPhase: false,
                },
            },
            current: '969de546-8db4-44c4-a545-a529bbfb400f',
            previous: [],
        },
        annotations: {
            byId: {
                '969de546-8db4-44c4-a545-a529bbfb400f_0': {
                    id: '969de546-8db4-44c4-a545-a529bbfb400f_0',
                    start: '00:00:00.000',
                    end: '00:00:00.901',
                    text: 'Eine coole annotation',
                    memo: '',
                    color: null,
                    solutionId: '969de546-8db4-44c4-a545-a529bbfb400f',
                },
            },
        },
        videoCodes: {
            byId: {
                '969de546-8db4-44c4-a545-a529bbfb400f_0': {
                    id: '969de546-8db4-44c4-a545-a529bbfb400f_0',
                    start: '00:00:00.449',
                    end: '00:00:01.297',
                    text: 'Popel',
                    memo: '',
                    color: '#ffc907',
                    idFromPrototype: '83a8ba59-325d-47ec-8e36-dbb8becb6fd6',
                    solutionId: '969de546-8db4-44c4-a545-a529bbfb400f',
                },
                '969de546-8db4-44c4-a545-a529bbfb400f_1': {
                    id: '969de546-8db4-44c4-a545-a529bbfb400f_1',
                    start: '00:00:02.674',
                    end: '00:00:03.724',
                    text: 'asdfasdf',
                    memo: 'asdfasd',
                    color: '#cccccc',
                    idFromPrototype: 'Lr_m3u2ZG',
                    solutionId: '969de546-8db4-44c4-a545-a529bbfb400f',
                },
            },
        },
        videoCodePrototypes: {
            byId: {
                '83a8ba59-325d-47ec-8e36-dbb8becb6fd6': {
                    id: '83a8ba59-325d-47ec-8e36-dbb8becb6fd6',
                    name: 'Popel',
                    color: '#ffc907',
                    videoCodes: [],
                    parentId: null,
                    userCreated: false,
                },
                Lr_m3u2ZG: {
                    id: 'Lr_m3u2ZG',
                    name: 'asdfasdf',
                    color: '#cccccc',
                    videoCodes: [],
                    parentId: null,
                    userCreated: true,
                },
            },
        },
        cuts: {
            byId: [],
        },
    },
    config: {
        title: 'Infestor testor',
        description: '<p>asdfads</p>',
        type: 'videoAnalysis',
        userId: '6b73b3d9-fe31-4385-83a5-9be91c269187',
        userName: 'admin@sandstorm.de',
        isGroupPhase: false,
        dependsOnPreviousPhase: false,
        readOnly: false,
        components: ['videoAnnotation', 'videoCode'],
        attachments: [],
        videos: [
            {
                id: '51e1c9aa-8a46-4463-93c5-59f5f75c93de',
                name: 'Infestor',
                description: 'asdf',
                duration: 10.494,
                url: {
                    hls: '/data/encoded_videos/51e1c9aa-8a46-4463-93c5-59f5f75c93de/hls.m3u8',
                    mp4: '/data/encoded_videos/51e1c9aa-8a46-4463-93c5-59f5f75c93de/x264.mp4',
                    vtt: '/data/encoded_videos/51e1c9aa-8a46-4463-93c5-59f5f75c93de/subtitles.vtt',
                },
            },
        ],
        apiEndpoints: {
            updateSolution:
                '/exercise-phase/update-solution/728ebad7-b0b1-4067-8bb8-9004282b08ae',
            updateCurrentEditor:
                '/exercise-phase/update-current-editor/728ebad7-b0b1-4067-8bb8-9004282b08ae',
        },
        isSolutionView: false,
    },
    liveSyncConfig: {
        topics: {
            solution: 'exercisePhaseTeam-728ebad7-b0b1-4067-8bb8-9004282b08ae',
            presence:
                '/.well-known/mercure/subscriptions/exercisePhaseTeam-728ebad7-b0b1-4067-8bb8-9004282b08ae/{subscription}',
        },
        mercureEndpoint: '/.well-known/mercure',
        subscriptionsEndpoint:
            '/.well-known/mercure/subscriptions/exercisePhaseTeam-728ebad7-b0b1-4067-8bb8-9004282b08ae',
        teamMembers: [
            {
                id: '6b73b3d9-fe31-4385-83a5-9be91c269187',
                name: 'admin@sandstorm.de',
                connectionState: 'UNKNOWN',
            },
        ],
    },
    overlay: {
        isVisible: false,
        size: 'default',
    },
    attachmentViewer: {},
    presence: {
        teamMemberIds: [],
        teamMembersById: {},
        isConnecting: false,
    },
    currentEditor: {
        currentEditorId: '6b73b3d9-fe31-4385-83a5-9be91c269187',
    },
    shortCuts: {
        togglePlay: {
            shortCutId: 'togglePlay',
            key: 'p',
            modifiers: {
                ctrl: {
                    modifier: 'ctrl',
                    enabled: true,
                },
                alt: {
                    modifier: 'alt',
                    enabled: false,
                },
                option: {
                    modifier: 'option',
                    enabled: false,
                },
                shift: {
                    modifier: 'shift',
                    enabled: true,
                },
            },
        },
        setCurrentTimeAsStartValue: {
            shortCutId: 'setCurrentTimeAsStartValue',
            key: 's',
            modifiers: {
                ctrl: {
                    modifier: 'ctrl',
                    enabled: true,
                },
                alt: {
                    modifier: 'alt',
                    enabled: false,
                },
                option: {
                    modifier: 'option',
                    enabled: false,
                },
                shift: {
                    modifier: 'shift',
                    enabled: true,
                },
            },
        },
        setCurrentTimeAsEndValue: {
            shortCutId: 'setCurrentTimeAsEndValue',
            key: 'e',
            modifiers: {
                ctrl: {
                    modifier: 'ctrl',
                    enabled: true,
                },
                alt: {
                    modifier: 'alt',
                    enabled: false,
                },
                option: {
                    modifier: 'option',
                    enabled: false,
                },
                shift: {
                    modifier: 'shift',
                    enabled: true,
                },
            },
        },
        createAnnotation: {
            shortCutId: 'createAnnotation',
            key: 'a',
            modifiers: {
                ctrl: {
                    modifier: 'ctrl',
                    enabled: true,
                },
                alt: {
                    modifier: 'alt',
                    enabled: false,
                },
                option: {
                    modifier: 'option',
                    enabled: false,
                },
                shift: {
                    modifier: 'shift',
                    enabled: true,
                },
            },
        },
        createVideoCode: {
            shortCutId: 'createVideoCode',
            key: 'c',
            modifiers: {
                ctrl: {
                    modifier: 'ctrl',
                    enabled: true,
                },
                alt: {
                    modifier: 'alt',
                    enabled: false,
                },
                option: {
                    modifier: 'option',
                    enabled: false,
                },
                shift: {
                    modifier: 'shift',
                    enabled: true,
                },
            },
        },
        createVideoCut: {
            shortCutId: 'createVideoCut',
            key: 'x',
            modifiers: {
                ctrl: {
                    modifier: 'ctrl',
                    enabled: true,
                },
                alt: {
                    modifier: 'alt',
                    enabled: false,
                },
                option: {
                    modifier: 'option',
                    enabled: false,
                },
                shift: {
                    modifier: 'shift',
                    enabled: true,
                },
            },
        },
        setVideoPlayerTime: {
            shortCutId: 'setVideoPlayerTime',
            key: 'j',
            modifiers: {
                ctrl: {
                    modifier: 'ctrl',
                    enabled: true,
                },
                alt: {
                    modifier: 'alt',
                    enabled: false,
                },
                option: {
                    modifier: 'option',
                    enabled: false,
                },
                shift: {
                    modifier: 'shift',
                    enabled: true,
                },
            },
        },
    },
    shortCutSoundOptions: {
        isSoundEnabled: false,
    },
}
