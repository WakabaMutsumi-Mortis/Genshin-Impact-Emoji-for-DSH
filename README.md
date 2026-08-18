# dsh-theme-anime · 桑多涅「木偶」galgame 主题 + 原神表情聊天

给 **DeepSeek Harness Web GUI** 换装的二次元主题（《原神》桑多涅·木偶，galgame 风格），并内置完整的**原神「派蒙的画作」表情聊天**功能。

## 特性
- **桑多涅 galgame 外观**：全页角色背景、大气泡对话框、名字牌、QQ 风格消息气泡、鎏金/藏蓝双主题切换、背景透明度滑条
- **桌宠**：右下角桑多涅/哥伦比娅 Q 版宠物（浮动、点击换表情+台词、可拖动、设置可开关）
- **表情聊天面板**：输入框上方 😊，**按弹(51弹)/按角色(151组)** 两种排布，**中文/EN 双语切换**，顶部搜索
- **827 个官方表情**：全部 51 弹的「派蒙的画作」透明表情，**含官方中英文名**（如 `桑多涅-生气` / `Sandrone-Angry`）
- 发送 `[贴图:表情名]` → 气泡显示图片，AI 收到的文字带表情含义（角色+意思）

## 安装（DSH web 插件）
1. 把本包放入 web profile 的 `node_modules/dsh-theme-anime/`：
   - Linux 默认路径：`~/.dsh/profiles/web/node_modules/dsh-theme-anime/`
2. 在 web profile 插件清单（如 `cordis.patch.yml`）挂载：
   ```yaml
   - insert: { id: theme-anime, name: 'dsh-theme-anime' }
   ```
3. 刷新页面（Ctrl+Shift+R）即可。设置 → 通用 里有 鎏金主题 / 背景透明度 / 背景图 / 桌宠 开关。

## 表情数据来源
- 827 个表情 PNG + 官方英文名：从国服原神 7.0 客户端资源块提取（`GenshinEmotes_Extracted`，AnimeStudio）
- 官方中文名：角色名按官方对照自建 `role_cn` 表；表情词按官方/米游社风格翻译（`emotion_cn`）
- 样式与逻辑：见 `lib/client.js`（token 覆盖层 + 皮肤 CSS + 表情面板组件 + token 渲染器）

## 说明
- 联动篇表情（KFC/必胜客等）游戏聊天资源未收录，不在 827 内
- 包内无任何凭据/密钥，仅主题代码与表情素材
- MIT License
