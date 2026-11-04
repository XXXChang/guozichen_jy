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

check('first two draws use the normal pool; third is forced without calling random', () => {
    const game = create(config, memoryStorage());
    assert.equal(game.read().surpriseUnlocked, false);
    assert.equal(game.draw(() => 0).prize.id, 'gift-01');
    const second = game.draw(() => .999);
    assert.equal(second.prize.id, 'gift-06');
    assert.equal(second.surpriseUnlocked, false);
    const third = game.draw(() => { throw new Error('The third draw must not use random'); });
    assert.equal(third.prize.id, 'gift-07');
    assert.equal(third.drawNumber, 3);
    assert.equal(third.isSurprise, true);
    assert.equal(third.surpriseUnlocked, true);
    assert.equal(third.remaining, 0);
    assert.equal(game.draw().added, false);
    assert.equal(game.read().history.length, 3);
});

check('refreshing after each draw preserves the count and results', () => {
    const storage = memoryStorage();
    create(config, storage).draw(() => 0);
    const next = create(config, storage);
    assert.equal(next.read().history.length, 1);
    next.draw(() => .5);
    const third = create(config, storage);
    assert.equal(third.read().history.length, 2);
    third.draw();
    const done = create(config, storage).read();
    assert.equal(done.lastPrize.id, 'gift-07');
    assert.equal(done.remaining, 0);
});

check('a previous single-draw record is retained as the first draw', () => {
    const storage = memoryStorage();
    storage.setItem(key, JSON.stringify({
        signature: JSON.stringify([config.version, config.prizes]),
        prizeId: 'gift-03'
    }));
    const game = create(config, storage);
    assert.equal(game.read().history.length, 1);
    assert.equal(game.read().lastPrize.id, 'gift-03');
    assert.equal(game.draw(() => 0).drawNumber, 2);
    assert.equal(game.draw().prize.id, 'gift-07');
});

check('an interrupted animation already has a saved result', () => {
    const storage = memoryStorage();
    create(config, storage).draw(() => 0);
    create(config, storage).draw(() => .5);
    create(config, storage).draw();
    const restored = create(config, storage);
    assert.equal(restored.read().lastPrize.id, 'gift-07');
    assert.equal(restored.draw().added, false);
});

check('multiple open pages read the latest count before drawing', () => {
    const storage = memoryStorage();
    const first = create(config, storage);
    const second = create(config, storage);
    first.draw(() => 0);
    assert.equal(second.draw(() => .5).drawNumber, 2);
    assert.equal(first.draw().prize.id, 'gift-07');
});

check('blocked browser storage keeps all three draws in memory', () => {
    const storage = {
        getItem() { throw new Error('Storage denied'); },
        setItem() { throw new Error('Storage denied'); }
    };
    const game = create(config, storage);
    game.draw(() => 0);
    game.draw(() => 0);
    const third = game.draw();
    assert.equal(third.prize.id, 'gift-07');
    assert.equal(third.history.length, 3);
    assert.equal(third.saved, false);
});

check('failed writes do not roll progress back to an older saved result', () => {
    const storage = memoryStorage();
    create(config, storage).draw(() => 0);
    storage.setItem = () => { throw new Error('Storage full'); };
    const game = create(config, storage);
    assert.equal(game.draw(() => .5).drawNumber, 2);
    assert.equal(game.draw().prize.id, 'gift-07');
    assert.equal(game.read().history.length, 3);
});

check('corrupt or invalid saved progress is ignored', () => {
    const storage = memoryStorage();
    storage.setItem(key, '{broken');
    assert.equal(create(config, storage).read().history.length, 0);
    const valid = memoryStorage();
    create(config, valid).draw(() => 0);
    const record = JSON.parse(valid.getItem(key));
    record.history = ['gift-07'];
    valid.setItem(key, JSON.stringify(record));
    assert.equal(create(config, valid).read().history.length, 0);
});

check('updating the pool or version starts a new round', () => {
    const storage = memoryStorage();
    create(config, storage).draw(() => 0);
    assert.equal(create({ ...config, version: 'new-version' }, storage).read().history.length, 0);
    const renamed = JSON.parse(JSON.stringify(config));
    renamed.prizes[0].name = '新的礼物名称';
    assert.equal(create(renamed, storage).read().history.length, 0);
});

console.log(`${checks} birthday gift checks passed.`);
