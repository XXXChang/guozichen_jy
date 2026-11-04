(function (root) {
    'use strict';

    const storageKey = 'jy-gzc-birthday-gift';
    const maxDraws = 3;

    function create(config, storage) {
        const surprisePrize = config.surprisePrize || { id: 'gift-07', name: '礼物七' };
        const prizes = config.prizes.filter(prize => prize.id && prize.name && prize.id !== surprisePrize.id);
        const allPrizes = [...prizes, surprisePrize];
        const signature = JSON.stringify([config.version, prizes, surprisePrize, maxDraws]);
        const legacySignature = JSON.stringify([config.version, prizes]);
        let history = [];
        let roundId = '';
        let ignoreStoredProgress = false;
        let saved = Boolean(storage);

        function normalize(record) {
            if (!record) return null;
            // 原先只保存一次结果，升级后将它作为第一次抽取保留。
            if (record.signature === legacySignature && prizes.some(prize => prize.id === record.prizeId)) {
                return { history: [record.prizeId], roundId: '' };
            }
            if (record.signature !== signature || !Array.isArray(record.history) || record.history.length > maxDraws) {
                return null;
            }
            const valid = record.history.every((id, index) => index === maxDraws - 1
                ? id === surprisePrize.id
                : prizes.some(prize => prize.id === id));
            return valid ? { history: record.history.slice(), roundId: record.roundId || '' } : null;
        }

        function snapshot() {
            return {
                history: history.slice(),
                lastPrize: allPrizes.find(prize => prize.id === history[history.length - 1]) || null,
                remaining: Math.max(0, maxDraws - history.length),
                surpriseUnlocked: history.includes(surprisePrize.id),
                saved
            };
        }

        function read() {
            if (storage && !ignoreStoredProgress) {
                try {
                    const latest = normalize(JSON.parse(storage.getItem(storageKey)));
                    if (latest && (latest.roundId !== roundId || latest.history.length >= history.length)) {
                        history = latest.history;
                        roundId = latest.roundId;
                    }
                } catch {
                    saved = false;
                }
            }
            return snapshot();
        }

        function save() {
            saved = false;
            if (storage) {
                try {
                    storage.setItem(storageKey, JSON.stringify({ schema: 2, signature, history, roundId }));
                    saved = true;
                    ignoreStoredProgress = false;
                } catch {
                    saved = false;
                }
            }
        }

        function reset() {
            history = [];
            roundId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
            save();
            // 重置写入失败时，不再读回旧进度覆盖本次测试状态。
            ignoreStoredProgress = !saved;
            return snapshot();
        }

        function draw(random = Math.random) {
            read();
            if (history.length >= maxDraws || !prizes.length) {
                return { ...snapshot(), added: false };
            }
            const drawNumber = history.length + 1;
            const isSurprise = drawNumber === maxDraws;
            const prize = isSurprise ? surprisePrize : prizes[Math.floor(random() * prizes.length)];
            history.push(prize.id);
            // 在播放动画前保存，关闭弹窗或刷新都不会重新抽取这一次。
            save();
            return { ...snapshot(), added: true, prize, drawNumber, isSurprise };
        }

        return { prizes, surprisePrize, maxDraws, read, draw, reset };
    }

    root.BirthdayGiftDraw = { create };
})(typeof window === 'undefined' ? globalThis : window);
