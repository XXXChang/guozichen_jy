// 全站唯一内容数据源：日历、故事线、相册和主页共同读取此文件。
window.MEMORY_DATA = Object.freeze({
    meta: {
        relationshipStart: '2026-09-12',
        firstMet: '2025-11-08',
        reminderWindowDays: 30
    },
    events: [
        {
            id: 'first-met',
            date: '2025-11-08',
            title: '初次相遇',
            tag: '相识',
            type: 'anniversary',
            recurring: 'yearly',
            story: true,
            description: '',
            location: '',
            photoIds: [],
            albumIds: ['moments']
        },
        {
            id: 'nanjing-2025',
            startDate: '2025-12-20',
            endDate: '2025-12-21',
            title: '南京',
            tag: '姚晓棠南京演唱会',
            type: 'together',
            story: true,
            description: '',
            location: '南京',
            photoIds: [],
            albumIds: ['scenery']
        },
        {
            id: 'wuhan-trip-2026',
            startDate: '2026-07-11',
            endDate: '2026-07-21',
            title: '武汉 · 长沙 · 邵阳',
            tag: '和小铮去武汉玩',
            type: 'together',
            story: true,
            description: '',
            location: '武汉 · 长沙 · 邵阳',
            photoIds: [],
            albumIds: ['scenery']
        },
        {
            id: 'nanchang-concert-2026',
            startDate: '2026-08-13',
            endDate: '2026-08-16',
            title: '武汉 · 南昌',
            tag: '王赫野南昌演唱会',
            type: 'together',
            story: true,
            description: '',
            location: '武汉 · 南昌',
            photoIds: [],
            albumIds: ['scenery']
        },
        {
            id: 'guangzhou-concert-2026',
            startDate: '2026-09-05',
            endDate: '2026-09-06',
            title: '广州',
            tag: '姚晓棠广州演唱会',
            type: 'together',
            story: true,
            description: '',
            location: '广州',
            photoIds: [],
            albumIds: ['scenery']
        },
        {
            id: 'relationship-start',
            date: '2026-09-12',
            title: '在一起啦',
            tag: '相爱',
            type: 'anniversary',
            recurring: 'yearly',
            story: false,
            description: '',
            location: '武汉',
            photoIds: ['head-icon-1'],
            albumIds: ['moments']
        },
        {
            id: 'wuhan-september-2026',
            startDate: '2026-09-12',
            endDate: '2026-09-14',
            title: '武汉',
            tag: '见面',
            type: 'together',
            story: true,
            highlight: true,
            description: '',
            location: '武汉',
            photoIds: ['head-icon-1'],
            albumIds: ['moments']
        },
        {
            id: 'birthday-october',
            date: '2026-10-04',
            title: '生日',
            tag: '生日',
            type: 'birthday',
            recurring: 'yearly',
            story: false,
            description: '',
            location: '',
            photoIds: [],
            albumIds: []
        },
        {
            id: 'national-day-2026',
            startDate: '2026-10-04',
            endDate: '2026-10-11',
            title: '武汉',
            tag: '甜蜜国庆',
            type: 'together',
            story: true,
            description: '',
            location: '武汉',
            photoIds: [],
            albumIds: ['moments']
        },
        {
            id: 'wuhan-october-2026',
            startDate: '2026-10-24',
            endDate: '2026-10-25',
            title: '武汉',
            tag: '见面',
            type: 'together',
            story: true,
            description: '',
            location: '武汉',
            photoIds: ['head-icon-2'],
            albumIds: ['moments', 'scenery']
        },
        {
            id: 'new-year',
            date: '2026-12-31',
            title: '跨年',
            tag: '跨年',
            type: 'festival',
            recurring: 'yearly',
            story: false,
            description: '',
            location: '',
            photoIds: [],
            albumIds: []
        },
        {
            id: 'birthday-january',
            date: '2027-01-05',
            title: '生日',
            tag: '生日',
            type: 'birthday',
            recurring: 'yearly',
            story: false,
            description: '',
            location: '',
            photoIds: [],
            albumIds: []
        }
    ],
    albums: [
        {
            id: 'moments',
            title: '心动片段',
            subtitle: '那些被收藏的瞬间',
            coverPhotoId: 'head-icon-1',
            photoIds: ['head-icon-1', 'head-icon-2']
        },
        {
            id: 'scenery',
            title: '沿途风景',
            subtitle: '一起看过的风景',
            coverPhotoId: 'head-icon-2',
            photoIds: ['head-icon-2', 'head-icon-1']
        }
    ],
    photos: [
        {
            id: 'head-icon-1',
            src: 'assets/gzc_jy_Img/HeadIcon1.jpg',
            alt: '拥抱皮卡丘的插画',
            date: '2026-09-12',
            eventId: 'wuhan-september-2026',
            albumIds: ['moments', 'scenery']
        },
        {
            id: 'head-icon-2',
            src: 'assets/gzc_jy_Img/HeadIcon2.jpg',
            alt: '海边的照片',
            date: '2026-10-24',
            eventId: 'wuhan-october-2026',
            albumIds: ['moments', 'scenery']
        }
    ]
});
