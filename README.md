# 写给你的星空 · ZZR520

一个送给喜欢星座的人的小网站。默认巨蟹座，支持十二星座、日期切换、每日小情书、心情记录和分享。

网站地址：https://xxxxu-ll.github.io/zzr520/

## 内容来源

本网站的文字为原创娱乐内容，以北京时间日期和所选星座从本地内容库组合。它不是占星师实时运势、天文计算或外部平台数据。分数、幸运色、数字和默契星座是娱乐设计，不代表真实预测或决策依据。

同一天、同一星座的内容保持一致；跨北京时间午夜后自动切换。浏览历史日期时不会被自动跳回今天。文案来自有限内容库，部分文字会在不同日期重复出现。

页面不依赖在线 API，无需密钥。心情记录和上次选择的星座仅保存在当前浏览器的 localStorage 中，不上传服务器、不跨设备同步。网站未加入访问统计、广告、外部字体或第三方脚本；GitHub Pages 本身的访问日志遵循 GitHub 的隐私政策。

## 已调研的开源项目

调研时间：2026-11-05。没有复制下列项目的源码或运势正文。

| 项目 | 许可证 | 采用前的限制 |
| --- | --- | --- |
| [sameerkumar18/aztro](https://github.com/sameerkumar18/aztro) | Apache-2.0 | Flask API；文档公开端点此次测试返回 404，存在旧依赖。 |
| [ashutoshkrris/Horoscope-API](https://github.com/ashutoshkrris/Horoscope-API) | MIT | 需 Flask 后端，抓取第三方站点，不能直接部署在静态 Pages 上。 |
| [ecitlm/Node-SpliderApi](https://github.com/ecitlm/Node-SpliderApi) | MIT | 中文接口集合，需后端与数据库，星座内容需要聚合 APPCODE。 |
| [GBcui/horoscope-serve](https://github.com/GBcui/horoscope-serve) | MIT | 中文 MCP 服务，其依赖的 vvhan 接口本次测试 TLS 连接失败。 |

因此本版本使用原创、独立的静态实现。若以后需要第三方每日运势，可单独确认内容使用许可，再由 GitHub Actions 定时获取静态 JSON。API 密钥应保存在 GitHub Secrets，不能放入浏览器 JavaScript。

## 文件与修改

- `index.html`：页面结构、标题和内容来源说明。
- `styles.css`：响应式样式，支持减少动态效果的系统偏好。
- `fortune.js`：原创文案、星座资料、按日期生成内容的函数。
- `app.js`：日期与星座切换、情书、心情存储、分享。
- `.nojekyll`：让 GitHub Pages 直接发布静态文件。

没有构建和安装步骤。在此目录运行 `python -m http.server 8765` 后，打开 `http://localhost:8765` 即可预览。

## GitHub Pages

仓库 Settings → Pages → Build and deployment 选择 Deploy from a branch，分支 `main`，目录 `/ (root)`。每次推送后 Pages 自动发布。

`xxxxu-ll.github.io` 是账号对应的 GitHub Pages 域名；`zzr520` 是项目路径，不是独立注册的域名。此版本不需要 `CNAME` 文件或外部 DNS。

## 验证

已执行 JavaScript 语法检查、日期与内容生成测试；以本次交付说明中的实际浏览器和线上检查结果为准。
