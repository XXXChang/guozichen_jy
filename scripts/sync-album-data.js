const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const projectRoot = path.resolve(__dirname, '..');
const dataPath = path.join(projectRoot, 'assets', 'data', 'memories.js');
const albumDirectory = path.join(projectRoot, 'assets', 'gzc_jy_Img', 'AlbumImg', 'EatTog');
const albumId = 'eat-together';

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(dataPath, 'utf8'), context, { filename: dataPath });

const data = JSON.parse(JSON.stringify(context.window.MEMORY_DATA));
const managedPhotoIds = new Set(
    data.photos
        .filter(photo => photo.albumIds?.includes(albumId))
        .map(photo => photo.id)
);

const imageFiles = fs.readdirSync(albumDirectory, { withFileTypes: true })
    .filter(entry => entry.isFile() && /\.(?:jpe?g|png|webp)$/i.test(entry.name))
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

function createPhoto(filename) {
    const stem = filename.replace(/\.[^.]+$/, '');
    const [dateText, sequence = '1'] = stem.split('.');
    if (!/^\d{8}$/.test(dateText)) {
        throw new Error(`相册图片名必须以 YYYYMMDD 开头：${filename}`);
    }

    const date = `${dateText.slice(0, 4)}-${dateText.slice(4, 6)}-${dateText.slice(6, 8)}`;
    return {
        id: `meal-${dateText}-${sequence}`,
        src: `assets/gzc_jy_Img/AlbumImg/EatTog/${filename}`,
        alt: `一起吃过的饭 · ${date.replaceAll('-', '.')}（${sequence}）`,
        date,
        albumIds: [albumId]
    };
}

const albumPhotos = imageFiles.map(createPhoto);
const album = {
    id: albumId,
    title: '一起吃过的饭',
    subtitle: '爱就是一起吃好多顿饭',
    coverPhotoId: albumPhotos.at(-1)?.id || '',
    photoIds: albumPhotos.map(photo => photo.id)
};

data.events = data.events.map(event => ({
    ...event,
    photoIds: (event.photoIds || []).filter(id => !managedPhotoIds.has(id)),
    albumIds: (event.albumIds || []).filter(id => id !== albumId)
}));
data.albums = [
    ...data.albums.filter(item => item.id !== albumId),
    album
];
data.photos = [
    ...data.photos.filter(photo => !photo.albumIds?.includes(albumId)),
    ...albumPhotos
];

const output = '// 全站唯一内容数据源：日历、故事线、相册和主页共同读取此文件。\n' +
    `window.MEMORY_DATA = Object.freeze(${JSON.stringify(data, null, 4)});\n`;

fs.writeFileSync(dataPath, output, 'utf8');
console.log(`已同步 ${albumPhotos.length} 张 EatTog 根目录照片。`);
