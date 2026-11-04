// 修改礼物名称即可；奖池或版本变化后，会开始新的一轮（三次抽取）。
window.BIRTHDAY_GIFTS = {
    version: 'birthday-22-preview-1',
    prizes: [
        { id: 'gift-01', name: '礼物一' },
        { id: 'gift-02', name: '礼物二' },
        { id: 'gift-03', name: '礼物三' },
        { id: 'gift-04', name: '礼物四' },
        { id: 'gift-05', name: '礼物五' },
        { id: 'gift-06', name: '礼物六' }
    ],
    // 第三次抽取过程中才出现，不提前放进普通奖池。
    surprisePrize: { id: 'gift-07', name: '礼物七' }
};
