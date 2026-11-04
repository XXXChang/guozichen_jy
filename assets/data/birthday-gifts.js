// 修改礼物名称即可；奖池或版本变化后，会开始新的一轮（三次抽取）。
window.BIRTHDAY_GIFTS = {
    version: 'birthday-22-nine-grid-1',
    prizes: [
        { id: 'gift-01', name: '礼物1' },
        { id: 'gift-02', name: '礼物2' },
        { id: 'gift-03', name: '礼物3' },
        { id: 'gift-04', name: '礼物4' },
        { id: 'try-again', name: '下次好运~', isRetry: true },
        { id: 'gift-05', name: '礼物5' },
        { id: 'gift-06', name: '礼物6' },
        { id: 'gift-07', name: '礼物7' },
        { id: 'gift-08', name: '礼物8' }
    ],
    // 第三次抽取过程中才出现，不提前放进普通奖池。
    surprisePrize: { id: 'gift-all', name: '全部都要~' }
};
