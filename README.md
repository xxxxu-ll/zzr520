# 写给紫瑞的星空 · ZZR520

一个每天更新一封小情书的静态网站：星座、星语、幸运清单、一封信，还有一片随你来过而长叶子的星空。
纯静态，无构建、无第三方脚本、无后端。

线上地址：https://xxxxu-ll.github.io/zzr520/

## 想改的东西都在这里

打开 `app.js`，最上面三行：

```js
const CONFIG = {
  her: '紫瑞',              // 她的名字，出现在标题、信末和页脚
  birthday: '',             // 生日，格式 '07-12'；留空就不触发
  anniversary: '05-20'      // 在一起的纪念日，格式 'MM-DD'
};
```

改完保存、推上去就行，不需要重新构建。

## 每天的内容怎么来的

`fortune.js` 里是一套原创文案库（标题、星语、四个维度、仪式、信），
用 `hash(日期 + 星座)` 取样：同一天同一星座永远一致，跨天不按顺序走，
所以不会出现「昨天和今天是文案库里挨着的两句」这种破绽。

- 每天 0 点（北京时间）自动换新；页面一直开着也会自己切过去。
- 分数 62–98，四条维度各自独立。
- `?sign=cancer&date=2026-05-20` 这样的地址可以直接分享某一天。

## 只有她知道的三件小事

1. **第 N 次来看**：存在浏览器 localStorage 里，左上角日期旁边显示。
   半小时内反复刷新不重复计数。
2. **会长叶子的星空**：第一次来是种子 + 一片叶子，之后每多一天多一片，
   最多 20 片。数字来自「第一次打开到现在第几天」，不是刷出来的。
3. **特殊日子**：生日、纪念日、跨年当天，标题和一封信会静默换成另一套，
   星图右上角会多一颗铜色星。一年只出现几次，不常驻。

## 文件

| 文件 | 作用 |
| --- | --- |
| `index.html` | 页面结构、OG 分享卡、manifest、字体预加载 |
| `styles.css` | 苔纸 + 墨绿的设计系统，全部颜色收在 `:root` |
| `fortune.js` | 文案库 + 按日期取样 |
| `app.js` | 称呼、日期切换、心情、第 N 次、叶子、分享 |
| `fonts/wenkai-subset.woff2` | 霞鹜文楷子集（919 字，183 KB，OFL 协议） |
| `fonts/OFL.txt` | 字体授权 |
| `noise.png` | 3.7 KB 纸纹 |
| `og.png` | 1200×630 分享图 |
| `icons/` | 主屏图标 |
| `manifest.webmanifest` | 添加到主屏幕 |
| `sw.js` | 离线缓存 |

## 字体（改文案后要重新子集化）

页面里的字全部来自 `index.html` / `app.js` / `fortune.js`，所以字体只打包用到的 919 个字。
如果加了新的生僻字，需要重新生成：

```bash
pip install fonttools brotli
python -c "
import pathlib
chars=set()
for n in ['index.html','app.js','fortune.js','styles.css']:
    chars|=set(pathlib.Path(n).read_text(encoding='utf-8'))
chars|=set('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ·—…“”‘’《》「」、。，；：！？（）【】✦✧♡☾☀☁↗年月日周一二三四五六')
pathlib.Path('fonts/chars.txt').write_text(''.join(sorted(c for c in chars if c.isprintable())))
"
python -m fontTools.subset LXGWWenKai-Regular.ttf --text-file=fonts/chars.txt \
  --output-file=fonts/wenkai-subset.woff2 --flavor=woff2 --layout-features=kern,liga,vert,vrt2
```

漏掉的字会自动回退到系统宋体，不会乱码。

## 本地预览

```bash
python -m http.server 8765
# 打开 http://localhost:8765
```

## 部署

仓库 Settings → Pages → Deploy from a branch，分支 `main`，目录 `/ (root)`。
推上去几十秒后生效。`sw.js` 的 HTML 走网络优先，样式脚本走后台更新，
所以改了文件不用手动改版本号。

## 说明

内容为原创娱乐向，不是占星师实时运势，也不代表真实预测。
来过的次数、心情只写在这台设备的 localStorage 里，不上传、不跨设备同步。
网站没有统计、广告、外部字体或第三方脚本。
