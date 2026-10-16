# guozichen_jy

个人主页项目。

## 目录结构

```
guozichen_jy/
├── index.html          # 主页
├── assets/             # 静态资源
├── gzc_jy_Img/     # 图片
│   ├── css/            # 样式表
│   └── js/             # 脚本
├── pages/              # 其他页面
└── docs/               # 文档
```

## 本地预览

直接双击 `index.html` 在浏览器中打开即可。

或者用本地服务器（推荐，避免某些功能受限）：
```bash
# 在项目目录下执行
python -m http.server 8000
# 然后访问 http://localhost:8000
```

---

## assets/ 资源文件夹

用于存放网站的静态资源。

### 子目录说明

- `gzc_jy_Img/` - 图片资源（头像、背景图、图标等）
- `css/` - 样式表文件
- `js/` - JavaScript 脚本文件

### 建议的命名规范

- 图片：`avatar.jpg`（头像）、`bg-main.jpg`（主背景）等
- 全部使用小写英文 + 短横线分隔
- 避免中文和空格

---

## assets/gzc_jy_Img/ 图片资源

存放网站用到的所有图片。

### 推荐格式

- **照片/复杂图**：`.jpg`
- **透明背景图**：`.png`
- **图标/简单图形**：`.svg`（矢量图，可无损缩放）
- **动图**：`.gif` 或 `.webp`

### 推荐尺寸

- 头像：建议 1:1 方形，最少 200×200
- 背景图：1920×1080 或更大
- 图标：64×64 或 128×128

### 示例路径

```
assets/gzc_jy_Img/avatar.jpg
assets/gzc_jy_Img/bg-main.jpg
assets/gzc_jy_Img/icon-heart.svg
```

在 HTML 中引用：
```html
<img src="assets/gzc_jy_Img/avatar.jpg" alt="头像">
```

---

## assets/css/ 样式文件

存放 CSS 样式表。

如果 index.html 中的样式变多了，可以拆出来单独放这里。

### 引用方式

在 HTML `<head>` 中引入：
```html
<link rel="stylesheet" href="assets/css/main.css">
```

---

## assets/js/ JavaScript 文件

存放 JS 脚本。

### 引用方式

在 HTML 底部（`</body>` 前）引入：
```html
<script src="assets/js/main.js"></script>
```

---

## pages/ 其他页面

存放除主页外的其他 HTML 页面，比如：
- `about.html` - 关于页
- `gallery.html` - 相册/图片墙
- `timeline.html` - 时间线

### 引用资源

由于在 `pages/` 子目录，引用资源需要返回上一级：
```html
<img src="../assets/gzc_jy_Img/avatar.jpg" alt="头像">
<link rel="stylesheet" href="../assets/css/main.css">
<script src="../assets/js/main.js"></script>
```

---

## docs/ 文档

存放项目相关文档，比如：
- 需求说明
- 更新日志
- 设计稿

---

## 修改头像

把头像图片放到 `assets/gzc_jy_Img/` 下，比如 `avatar.jpg`，然后告诉我路径，我帮你改代码。
