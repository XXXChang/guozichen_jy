const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/data/birthday-gifts.js'), 'utf8'), context);
vm.runInNewContext(fs.readFileSync(path.join(root, 'assets/js/birthday-gifts.js'), 'utf8'), context);
const config = JSON.parse(JSON.stringify(context.window.BIRTHDAY_GIFTS));
const create = context.window.BirthdayGiftDraw.create;
const key = 'jy-gzc-birthday-gift';

function memoryStorage() {
    const values = new Map();
    return {
        getItem: name => values.get(name) || null,
        setItem: (name, value) => values.set(name, value)
    };
}

let checks = 0;
function check(name, run) {
    run();
    checks++;
    console.log(`OK: ${name}`);
}

check('nine-cell pool has eight numbered gifts and a retry cell in the center', () => {
    assert.equal(config.prizes.length, 9);
    assert.equal(config.prizes[4].name, '下次好运~');
    assert.equal(config.prizes[4].isRetry, true);
    assert.deepEqual(config.prizes.filter(prize => !prize.isRetry).map(prize => prize.name),
        Array.from({ length: 8 }, (_, index) => `礼物${index + 1}`));
    assert.equal(config.surprisePrize.name, '全部都要~');
    assert.ok(!config.prizes.some(prize => prize.id === config.surprisePrize.id));
});

check('first two draws always return retry; third returns all gifts', () => {
    const game = create(config, memoryStorage());
    assert.equal(game.read().surpriseUnlocked, false);
    assert.equal(game.draw().prize.id, 'try-again');
    const second = game.draw();
    assert.equal(second.prize.id, 'try-again');
    assert.equal(second.surpriseUnlocked, false);
    const third = game.draw();
    assert.equal(third.prize.id, 'gift-all');
    assert.equal(third.drawNumber, 3);
    assert.equal(third.isSurprise, true);
    assert.equal(third.surpriseUnlocked, true);
    assert.equal(third.remaining, 0);
    assert.equal(game.draw().added, false);
    assert.equal(game.read().history.length, 3);
});

check('refreshing after each draw preserves the count and results', () => {
    const storage = memoryStorage();
    create(config, storage).draw();
    const next = create(config, storage);
    assert.equal(next.read().history.length, 1);
    next.draw();
    const third = create(config, storage);
    assert.equal(third.read().history.length, 2);
    third.draw();
    const done = create(config, storage).read();
    assert.equal(done.lastPrize.id, 'gift-all');
    assert.equal(done.remaining, 0);
});

check('a previous single-draw record is retained as the first draw', () => {
    const storage = memoryStorage();
    storage.setItem(key, JSON.stringify({
        signature: JSON.stringify([config.version, config.prizes]),
        prizeId: 'try-again'
    }));
    const game = create(config, storage);
    assert.equal(game.read().history.length, 1);
    assert.equal(game.read().lastPrize.id, 'try-again');
    assert.equal(game.draw().drawNumber, 2);
    assert.equal(game.draw().prize.id, 'gift-all');
});

check('an interrupted animation already has a saved result', () => {
    const storage = memoryStorage();
    create(config, storage).draw();
    create(config, storage).draw();
    create(config, storage).draw();
    const restored = create(config, storage);
    assert.equal(restored.read().lastPrize.id, 'gift-all');
    assert.equal(restored.draw().added, false);
});

check('multiple open pages read the latest count before drawing', () => {
    const storage = memoryStorage();
    const first = create(config, storage);
    const second = create(config, storage);
    first.draw();
    assert.equal(second.draw().drawNumber, 2);
    assert.equal(first.draw().prize.id, 'gift-all');
});

check('blocked browser storage keeps all three draws in memory', () => {
    const storage = {
        getItem() { throw new Error('Storage denied'); },
        setItem() { throw new Error('Storage denied'); }
    };
    const game = create(config, storage);
    game.draw();
    game.draw();
    const third = game.draw();
    assert.equal(third.prize.id, 'gift-all');
    assert.equal(third.history.length, 3);
    assert.equal(third.saved, false);
});

check('failed writes do not roll progress back to an older saved result', () => {
    const storage = memoryStorage();
    create(config, storage).draw();
    storage.setItem = () => { throw new Error('Storage full'); };
    const game = create(config, storage);
    assert.equal(game.draw().drawNumber, 2);
    assert.equal(game.draw().prize.id, 'gift-all');
    assert.equal(game.read().history.length, 3);
});

check('corrupt or invalid saved progress is ignored', () => {
    const storage = memoryStorage();
    storage.setItem(key, '{broken');
    assert.equal(create(config, storage).read().history.length, 0);
    const valid = memoryStorage();
    create(config, valid).draw();
    const record = JSON.parse(valid.getItem(key));
    record.history = ['gift-all'];
    valid.setItem(key, JSON.stringify(record));
    assert.equal(create(config, valid).read().history.length, 0);
    record.history = ['gift-01'];
    valid.setItem(key, JSON.stringify(record));
    assert.equal(create(config, valid).read().history.length, 0);
});

check('updating the pool or version starts a new round', () => {
    const storage = memoryStorage();
    create(config, storage).draw();
    assert.equal(create({ ...config, version: 'new-version' }, storage).read().history.length, 0);
    const renamed = JSON.parse(JSON.stringify(config));
    renamed.prizes[0].name = '新的礼物名称';
    assert.equal(create(renamed, storage).read().history.length, 0);
});

check('reset clears all three draws and permits repeating the surprise', () => {
    const storage = memoryStorage();
    const game = create(config, storage);
    for (let cycle = 0; cycle < 3; cycle++) {
        const reset = game.reset();
        assert.equal(reset.history.length, 0);
        assert.equal(reset.lastPrize, null);
        assert.equal(reset.surpriseUnlocked, false);
        assert.equal(create(config, storage).read().remaining, 3);
        assert.equal(game.draw().prize.id, 'try-again');
        assert.equal(game.draw().prize.id, 'try-again');
        assert.equal(game.draw().prize.id, 'gift-all');
    }
});

check('other open pages accept the lower count after a reset', () => {
    const storage = memoryStorage();
    const first = create(config, storage);
    const second = create(config, storage);
    first.draw();
    first.draw();
    first.draw();
    assert.equal(second.read().history.length, 3);
    first.reset();
    assert.equal(second.read().history.length, 0);
    assert.equal(second.draw().drawNumber, 1);
});

check('reset still works if saved storage becomes unwritable', () => {
    const storage = memoryStorage();
    const game = create(config, storage);
    game.draw();
    game.draw();
    game.draw();
    storage.setItem = () => { throw new Error('Storage full'); };
    assert.equal(game.reset().history.length, 0);
    assert.equal(game.read().history.length, 0);
    assert.equal(game.draw().drawNumber, 1);
    assert.equal(game.draw().drawNumber, 2);
    assert.equal(game.draw().prize.id, 'gift-all');
});

// 用页面里的实际交互函数和虚拟时钟，检查动画时长、落点和弹窗重置。
const birthdayHtml = fs.readFileSync(path.join(root, 'pages/birthday.html'), 'utf8');
const pageScript = [...birthdayHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].at(-1)[1];
const renderSource = pageScript.slice(pageScript.indexOf('        function addGiftCard('),
    pageScript.indexOf('\n        showGiftResult();'));
const drawSource = pageScript.slice(pageScript.indexOf('        function finishGiftDraw('),
    pageScript.indexOf("        window.addEventListener('click'"));

function testElement() {
    const classes = new Set();
    return {
        children: [], hidden: false, textContent: '', attributes: {}, dataset: {},
        classList: {
            add(...names) { names.forEach(name => classes.add(name)); },
            remove(...names) { names.forEach(name => classes.delete(name)); },
            contains(name) { return classes.has(name); },
            toggle(name, enabled = !classes.has(name)) {
                if (enabled) classes.add(name);
                else classes.delete(name);
            }
        },
        append(...nodes) { nodes.forEach(node => { node.parent = this; this.children.push(node); }); },
        remove() { this.parent.children = this.parent.children.filter(node => node !== this); },
        querySelector(selector) { return this.children.find(node => '.' + node.className === selector); },
        setAttribute(name, value) { this.attributes[name] = value; },
        scrollTo() {},
        getBoundingClientRect() { return { left: 0, top: 0, width: 20, height: 20 }; }
    };
}

function animationHarness(reduced = false) {
    let now = 0;
    let nextId = 0;
    let seed = 917;
    const timers = new Map();
    const highlights = [];
    const clock = {
        setTimeout(callback, delay) {
            const id = ++nextId;
            timers.set(id, { at: now + delay, callback });
            return id;
        },
        clearTimeout(id) { timers.delete(id); }
    };
    const math = Object.create(Math);
    math.random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const game = create(config, memoryStorage());
    const content = testElement();
    const paper = testElement();
    paper.querySelector = () => content;
    const ui = vm.createContext({
        window: clock, Math: math, performance: { now: () => now },
        document: { createElement: testElement },
        giftGame: game, prizes: game.prizes, giftState: game.read(), giftCards: new Map(),
        giftPool: testElement(), giftPaper: paper, giftDraw: testElement(), giftStatus: testElement(),
        giftResult: testElement(), giftResultName: testElement(), giftTrigger: testElement(),
        giftTestCount: testElement(), giftDialog: testElement(),
        drawnPrize: null, drawing: false, giftTimer: null, activeGiftRound: 0,
        reduced, spawn() {}, closeDialog(dialog) { dialog.hidden = true; }
    });
    vm.runInContext(renderSource + '\n' + drawSource + '\nshowGiftResult();', ui);
    const activate = ui.setActiveGift;
    ui.setActiveGift = id => { highlights.push(id); activate(id); };
    function tick(to) {
        let calls = 0;
        while (true) {
            const next = [...timers].sort((a, b) => a[1].at - b[1].at)[0];
            if (!next || next[1].at > to + 0.000001) break;
            assert.ok(++calls < 1000, 'Animation timers must terminate');
            timers.delete(next[0]);
            now = next[1].at;
            next[1].callback();
        }
        now = to;
    }
    return { ui, tick, highlights, timers };
}

for (const reduced of [false, true]) {
    check(`random animation keeps 5s retry and 6s surprise timing (reduced motion: ${reduced})`, () => {
        const { ui, tick, highlights, timers } = animationHarness(reduced);
        assert.equal(ui.giftCards.size, 9);
        assert.equal(ui.giftPool.children[4].querySelector('.gift-card-name').textContent, '下次好运~');
        assert.deepEqual(ui.giftPool.children.filter((_, i) => i !== 4)
            .map(card => card.querySelector('.gift-card-number').textContent),
        ['01', '02', '03', '04', '05', '06', '07', '08']);
        for (let draw = 0; draw < 2; draw++) {
            const firstStep = highlights.length;
            ui.drawGift();
            tick(draw * 5000 + 4999);
            assert.equal(ui.drawing, true);
            assert.equal(ui.giftCards.has('gift-all'), false);
            tick((draw + 1) * 5000);
            assert.equal(ui.drawing, false);
            const retry = ui.giftCards.get('try-again');
            assert.ok(retry.classList.contains('is-winner'));
            assert.equal(retry.classList.contains('is-collected'), false);
            assert.equal(retry.querySelector('.gift-card-state').hidden, true);
            if (!reduced) {
                const steps = highlights.slice(firstStep);
                assert.equal(steps.at(-1), 'try-again');
                assert.ok(steps.every((id, i) => !i || id !== steps[i - 1]));
                assert.ok(new Set(steps).size >= 6, 'Seeded jumps should cover multiple grid cells');
                const positions = steps.map(id => config.prizes.findIndex(prize => prize.id === id));
                assert.ok(positions.some((position, i) => i && position !== (positions[i - 1] + 1) % 9),
                    'Highlights must not follow numeric grid order');
            }
        }
        const thirdStart = highlights.length;
        ui.drawGift();
        tick(15999);
        assert.equal(ui.drawing, true);
        assert.equal(ui.giftCards.has('gift-all'), false);
        tick(16000);
        const special = ui.giftCards.get('gift-all');
        assert.equal(ui.drawing, false);
        assert.equal(ui.giftResultName.textContent, '全部都要~');
        assert.ok(special.classList.contains('is-winner'));
        assert.ok(special.classList.contains('is-collected'));
        assert.ok(special.classList.contains('without-entrance'));
        assert.equal(special.querySelector('.gift-card-state').hidden, false);
        assert.equal(highlights.slice(thirdStart).includes('gift-all'), false);
        assert.equal(timers.size, 0);
    });
}

check('closing preserves surprise timing; resetting cancels it and restores nine cells', () => {
    const { ui, tick, timers } = animationHarness();
    ui.giftGame.draw();
    ui.giftGame.draw();
    ui.drawGift();
    tick(2000);
    ui.closeGift();
    assert.equal(ui.drawing, true);
    tick(5999);
    assert.equal(ui.giftCards.has('gift-all'), false);
    ui.giftDialog.hidden = false;
    tick(6000);
    assert.ok(ui.giftCards.get('gift-all').classList.contains('is-winner'));
    ui.resetGiftDraw();
    ui.giftGame.draw();
    ui.giftGame.draw();
    ui.drawGift();
    tick(8000);
    ui.resetGiftDraw();
    tick(13000);
    assert.equal(ui.giftCards.has('gift-all'), false);
    assert.equal(ui.giftCards.size, 9);
    assert.equal(ui.giftState.history.length, 0);
    assert.equal(timers.size, 0);
});

console.log(`${checks} birthday gift checks passed.`);
