---
title: 自动翻转EN 程序使用说明
date: 2026-10-01 14:00:00
tags:
  - 自动翻转EN
  - 使用说明
  - Shizuku
  - 小程序
categories:
  - 工具
---

支持系统：Android 9 及以上
本文档包含：安装、授权、Shizuku 启动（两种方法）、日常使用、常见问题、以及**一键启动脚本的完整代码**

---

## 目录

1. [这个软件是干什么的](#一这个软件是干什么的)
2. [安装](#二安装)
3. [三项权限授权（必须）](#三三项权限授权必须)
4. [启动 Shizuku —— 方法一：手机端（免电脑）](#四启动-shizuku--方法一手机端免电脑)
5. [启动 Shizuku —— 方法二：电脑端一键脚本](#五启动-shizuku--方法二电脑端一键脚本)
6. [开始自动拼写](#六开始自动拼写)
7. [连点器：其他题型怎么用](#七连点器其他题型怎么用)
8. [主题切换](#八主题切换)
9. [常见问题](#九常见问题)
10. [附录：一键启动脚本完整代码](#十附录一键启动脚本完整代码)

---

## 一、这个软件是干什么的

自动处理微信小程序里的「翻转外语」类题目。

**工作原理（四步）**：

```
① 在输入框里乱输一通  →  小程序会显示正确答案「提示 xxx」
② 用 OCR 识别出那个单词
③ 自动一个字母一个字母敲进去
④ 点「确认」→ 题目翻页 → 回到第 ① 步
```

**主功能是「自动拼写单词」**，另外内置了一个**连点器**，可以辅助处理听力、语法、阅读等其他题型。

---

## 二、安装

### 手机安装自动翻转EN

1. 把链接传到手机

	```
	https://gitee.com/the-attacking-north-tower/aichijimorendecangku/releases/download/v1.7.4/AutoSwapEng-v1.7.4.apk
	```

2. 点击安装

3. 系统提示「未知来源应用」→ 允许安装

#### **手机安装shizuku**

```
https://shizuku.rikka.app/
```

---

## 三、三项权限授权（必须）

打开应用后，首页会显示三项权限状态。**必须全部授权**：

| 权限 | 作用 | 怎么授权 |
|---|---|---|
| **悬浮窗权限** | 显示控制面板 | 首页点「启动悬浮窗」→ 系统会跳转授权页 |
| **屏幕录制（OCR）** | 读取屏幕内容 | 首页点「去授权」→ 弹窗选择 |
| **无障碍权限** | 自动操作 | 首页 「去授权」 → 找到应用开启 |

> <img src="https://jjdbt.oss-cn-beijing.aliyuncs.com/image-20260923212910775.png" alt="权限授权界面" style="zoom:25%;" />

### ⚠️ 屏幕录制：必须选「共享整个屏幕」

授权弹窗里**默认选中的是「共享一个应用」**，这样只能看到本应用，**OCR 会什么都读不到**。

> <img src="https://jjdbt.oss-cn-beijing.aliyuncs.com/image-20260923213007834.png" alt="共享整个屏幕" style="zoom:25%;" />

---

## 四、启动 Shizuku —— 方法一：手机端（免电脑）

**适用**：Android 11 及以上，身边没有电脑

### 步骤

**① 手机安装 Shizuku**

访问 https://shizuku.rikka.app/ 下载安装（免费开源，约 2.5 MB）

**② 开启开发者选项**

```
设置 → 关于手机 → 连续点击「版本号」7 次 → 提示"您已处于开发者模式"
```

**③ 打开无线调试**（手机需要连着无线网）

```
设置 → 系统和更新 → 开发者选项 → 打开「无线调试」
```

**④ 在 Shizuku 里配对**

```
打开 Shizuku → 点「通过无线调试启动」→ 点「配对」
→ 输入无线调试页面显示的 6 位配对码
→ 返回 → 点「启动」
```

### ⚠️ 注意

| 事项 | 说明 |
|---|---|
| **手机重启后需要重新启动** | Shizuku 服务会停止，重新按上面步骤启动即可 |
| **不需要 root** | 走的是 ADB 权限，不影响保修 |

---

## 五、启动 Shizuku —— 方法二：电脑端一键脚本

**适用**：所有 Windows 电脑，Android 10 及以下**必须用这个方法**

### 5.1 使用步骤

**① 手机开启 USB 调试**

```
设置 → 关于手机 → 点「版本号」7 次（开启开发者模式）
设置 → 更多设置 → 开发者选项 → 打开「USB 调试」
```

**② 用数据线连接电脑**

> ⚠️ **最常见的坑**：很多 USB 线是**纯充电线**，插上能充电但电脑永远识别不到手机。
> **换一根能传文件的线**（原装线通常可以）。

插上后，手机上可能弹出「**允许 USB 调试吗？**」→ 点**允许**（建议勾选"一律允许"）

**③ 在电脑上运行脚本**

把下面两个文件放在**同一个文件夹**（比如桌面）：**【脚本文件看第十节】**

```
一键启动Shizuku.bat        ← 双击这个
shizuku-start.ps1
```

**双击 `一键启动Shizuku.bat`**，剩下的全自动：

```
[1/5] 正在查找 adb ...
      → 找不到会自动下载（约 8 MB）
[2/5] 等待手机连接 ...
[3/5] 检查并启动 Shizuku ...
[4/5] 检查应用是否安装（同目录有 apk 会自动安装）
[5/5] 打开应用
```

**④ 脚本跑完后，回到手机**

1. 打开 shizuku
2. 点管理授权的应用
3. 给 自动翻转EN 授权

> <img src="https://jjdbt.oss-cn-beijing.aliyuncs.com/image-20260923214145290.png" alt="Shizuku授权" style="zoom:25%;" />

### 5.2 脚本会自动做什么

| 步骤 | 说明 |
|---|---|
| **找 adb** | 依次查找：系统 PATH → 用户目录 → Android SDK 目录 → 桌面 |
| **自动下载 adb** | 都没有时从 Google 官方下载 platform-tools 并解压 |
| **等手机连接** | 最多等 60 秒，超时会提示排查方法 |
| **启动 Shizuku** | 依次尝试三种方式，成功一个就停 |
| **装应用** | 同目录有 apk 会自动安装 |
| **打开应用** | 自动启动「自动翻转EN」 |

---

## 六、开始自动拼写

**前提**：三项权限都已授权、Shizuku 正在运行、悬浮窗已启动

### 操作步骤

**① 切换到微信**

打开微信 → 下拉 → 找到「翻转外语」小程序 → 进入

**② 进入拼写题**

**③ 点悬浮球选择自动拼写  然后点击「自动翻转」**

悬浮球会变成「⏸ 自动翻转」，表示正在运行

**④ 剩下的交给它**

程序会自动：
- 乱输一通触发提示
- 识别答案
- 逐字母输入
- 点确认、翻页、进入下一题

**⑤ 想停下时，再点一次悬浮球自动翻转 停止程序**

### 建议

- **首次使用建议先手动观察 1~2 题**，确认识别和打字正常
- 屏幕上**不要有遮挡**（弹窗、通知横幅等会影响 OCR）
- 手机**不要息屏**

---

## 七、连点器：其他题型怎么用

听力、语法、阅读等题型没有错误次数限制，可以用连点器辅助。

### 7.1 展开控制面板

点悬浮球上的「**+**」展开面板

面板里有四个题型模块：

```
○ 自动拼写单词      （走拼写引擎，不能编辑）
○ 自动翻转单词      [✎ 编辑]
○ 自动听听力        [✎ 编辑]
○ 自动翻语法        [✎ 编辑]
○ 自动翻阅读        [✎ 编辑]
```

### 7.2 编辑连点方案

**① 点某个模块右边的「✎ 编辑」**

屏幕会变成**半透明的编辑模式**，能看见底下的真实界面

> <img src="https://jjdbt.oss-cn-beijing.aliyuncs.com/08c9587fc05597d4fcda16ae4342c1e9.jpg" alt="编辑模式" style="zoom:25%;" />

**② 右侧工具栏按钮**

```
＋  添加     点一下选择「点击」或「滑动」
🗑  删除     删除当前选中的点
✓  保存     保存到某个模块
```

**③ 摆点**

点「添加」→ 选「点击」→ 屏幕上出现一个**带编号的小圆点** → **用手指拖到想点的位置**

点「保存」→ 选择保存到哪个模块

> <img src="https://jjdbt.oss-cn-beijing.aliyuncs.com/bba20f5bb55f8e5d12cd4f59fec43106.jpg" alt="摆点示意图" style="zoom:25%;" />

### 7.3 使用

**① 点一下模块名选中它**（那一行会发光）

> 📷 <img src="https://jjdbt.oss-cn-beijing.aliyuncs.com/1ef9a570eb11c8e5da5e5ccaa81574bc.jpg" alt="选中模块" style="zoom:25%;" />

**② 点「+」收起面板**

**③ 点「自动翻转」启动**

---

## 八、主题切换

```
设置 → 外观 → 主题 → 选择主题
```

| 主题 | 说明 |
|---|---|
| 跟随系统 | 默认 |
| 浅色 | — |
| 深色 | — |
| **二次元主题** | 蓝天彗星背景 + 天蓝/樱花粉配色 |

---

## 九、常见问题

### Q1：程序完全不动

**按顺序检查**：
1. 屏幕录制授权了吗？**弹窗里选的是「共享整个屏幕」吗？**（最常见的坑）
2. Shizuku 在运行吗？
3. 悬浮球显示的是「▶ 自动翻转」（未运行）还是「⏸」（运行中）？

### Q2：识别不到题目 / 识别错单词

- 屏幕上有没有遮挡？把通知横幅、悬浮的其他窗口关掉
- 小程序页面加载完了吗？等页面稳定再启动
- 程序会自动重试，个别题失败会跳过

### Q3：点击没反应

Shizuku 可能停了。**手机重启后 Shizuku 会停止**，需要重新启动：

```
方法一：打开 Shizuku App → 点「启动」
方法二：重新运行电脑上的一键脚本
```

### Q4：悬浮窗消失了

- 下拉通知栏，看「自动翻转EN」的常驻通知还在不在
- 如果被手动划掉了，重新在应用里点「启动悬浮窗」
- 建议在系统设置里给本应用开启「**后台弹出界面**」和「**自启动**」权限

### Q5：电脑提示「no devices/emulators found」

| 原因 | 解决 |
|---|---|
| **USB 线只能充电** | **换一根能传文件的线**（最常见） |
| USB 口问题 | 换一个口，台式机插机箱后面 |
| USB 调试没开 | 开发者选项里重新开关一次 |
| 没点「允许」 | 重新插线，手机上点允许 |

### Q6：电脑提示「adb 显示 offline」

重新插拔数据线，或在手机上把「USB 调试」关掉再打开。

### Q7：授权 Shizuku 时找不到提示

先在 Shizuku App 里确认服务**正在运行**（显示绿色），再回到本应用授权。

---

## 十、附录：一键启动脚本完整代码

**使用方法**：在桌面新建两个文件，把下面的代码分别粘进去。

### 10.1 文件一：`一键启动Shizuku.bat`

```bat
@echo off
title AutoSwapEng - Start Shizuku
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0shizuku-start.ps1"
```

> 💡 如果 `shizuku-start.ps1` 不在同一个文件夹，把 `%~dp0` 换成实际路径。

### 10.2 文件二：`shizuku-start.ps1`

```powershell
# ============================================================
#  自动翻转EN  -  一键启动 Shizuku
#  适用于任何 Windows 电脑：会自动下载所需的 adb 工具
# ============================================================

$ErrorActionPreference = 'Continue'
try {
    [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
    $OutputEncoding = [System.Text.Encoding]::UTF8
} catch {}

function Say($msg, $color = 'Gray') { Write-Host $msg -ForegroundColor $color }
function Step($n, $msg) { Write-Host ""; Write-Host "  [$n] $msg" -ForegroundColor Cyan }
function Ok($msg)   { Write-Host "        $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "        $msg" -ForegroundColor Yellow }
function Err($msg)  { Write-Host "        $msg" -ForegroundColor Red }

Clear-Host
Write-Host ""
Write-Host "  ============================================================" -ForegroundColor White
Write-Host "     自动翻转EN  -  一键启动 Shizuku" -ForegroundColor White
Write-Host "  ============================================================" -ForegroundColor White

# ---------- 1. 查找 adb（找不到就自动下载） ----------
Step "1/5" "正在查找 adb ..."

$adb = $null
$candidates = @()
$cmd = Get-Command adb -ErrorAction SilentlyContinue
if ($cmd) { $candidates += $cmd.Source }
$candidates += (Join-Path $env:USERPROFILE 'platform-tools\adb.exe')
$candidates += (Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe')
$candidates += (Join-Path ${env:ProgramFiles} 'Android\platform-tools\adb.exe')

foreach ($c in $candidates) {
    if ($c -and (Test-Path $c)) { $adb = $c; break }
}

if (-not $adb) {
    Warn "没有找到 adb，开始自动下载（约 8 MB，需要联网）..."
    $url = 'https://dl.google.com/android/repository/platform-tools-latest-windows.zip'
    $zip = Join-Path $env:TEMP 'platform-tools.zip'
    $dest = Join-Path $env:USERPROFILE 'platform-tools'
    try {
        Warn "正在下载 platform-tools ..."
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -TimeoutSec 300
        Warn "正在解压 ..."
        if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
        Expand-Archive -Path $zip -DestinationPath $env:USERPROFILE -Force
        Remove-Item $zip -Force -ErrorAction SilentlyContinue
        $adb = Join-Path $dest 'adb.exe'
    } catch {
        Err "自动下载失败：$($_.Exception.Message)"
        Say ""
        Say "  请手动处理：" -ForegroundColor Yellow
        Say "   1. 打开 https://developer.android.com/tools/releases/platform-tools" -ForegroundColor Yellow
        Say "   2. 下载 Windows 版，解压到 $env:USERPROFILE\" -ForegroundColor Yellow
        Say "   3. 重新运行本脚本" -ForegroundColor Yellow
        Read-Host "按回车退出"
        exit 1
    }
}
Ok "已找到：$adb"

# ---------- 2. 等待手机连接 ----------
Step "2/5" "等待手机连接 ..."
Say "        请确保：① 数据线已插好  ② 手机已开启「USB 调试」" -ForegroundColor DarkGray
Say ""

& $adb start-server 2>$null | Out-Null

$waited = 0
$found = $false
while ($waited -lt 60) {
    $devices = & $adb devices 2>$null
    foreach ($line in $devices) {
        if ($line -match '^(\S+)\s+device$') { $found = $true; break }
    }
    if ($found) { break }
    Write-Host "." -NoNewline -ForegroundColor DarkGray
    Start-Sleep -Seconds 1
    $waited++
}

if (-not $found) {
    Say ""
    Err "等了 60 秒还没检测到手机。请依次检查："
    Say ""
    Say "        1. 数据线是不是「只能充电」的线？换一根能传文件的线（最常见原因）" -ForegroundColor Yellow
    Say "        2. 换一个 USB 口（台式机建议插机箱后面的口）" -ForegroundColor Yellow
    Say "        3. 手机：设置 → 更多设置 → 开发者选项 →「USB 调试」关掉再打开" -ForegroundColor Yellow
    Say "        4. 手机上弹出「允许 USB 调试吗？」要点【允许】" -ForegroundColor Yellow
    Read-Host "按回车退出"
    exit 1
}
Say ""
Ok "手机已连接"

# ---------- 3. 启动 Shizuku ----------
Step "3/5" "检查 Shizuku ..."

function Test-Shizuku {
    $ps = & $adb shell "ps -A" 2>$null
    return ($ps | Select-String -Pattern 'shizuku' -Quiet)
}

if (Test-Shizuku) {
    Ok "Shizuku 已经在运行，跳过启动"
} else {
    Warn "未运行，开始启动 ..."
    Say ""

    $tries = @(
        @{ name = "自带启动脚本";       cmd = 'sh /storage/emulated/0/Android/data/moe.shizuku.privileged.api/start.sh' },
        @{ name = "local/tmp 启动脚本"; cmd = 'sh /data/local/tmp/shizuku_starter.sh' }
    )

    $started = $false
    foreach ($t in $tries) {
        Say "        [尝试] $($t.name) ..." -ForegroundColor DarkGray
        & $adb shell $t.cmd 2>$null | Out-Null
        Start-Sleep -Seconds 2
        if (Test-Shizuku) { $started = $true; break }
    }

    if (-not $started) {
        Say "        [尝试] 直接运行 native 程序 ..." -ForegroundColor DarkGray
        $pkgPath = (& $adb shell "pm path moe.shizuku.privileged.api" 2>$null | Select-Object -First 1)
        if ($pkgPath -match 'package:(.+)') {
            $base = $Matches[1].Trim()
            $lib = $base -replace 'base\.apk$', 'lib/arm64/libshizuku.so'
            & $adb shell $lib 2>$null | Out-Null
            Start-Sleep -Seconds 2
            if (Test-Shizuku) { $started = $true }
        }
    }

    if ($started) {
        Say ""
        Ok "Shizuku 启动成功！"
    } else {
        Say ""
        Err "三种方式都没能启动 Shizuku。常见原因："
        Say ""
        Say "        1. 手机上没有安装 Shizuku" -ForegroundColor Yellow
        Say "           → 去 https://shizuku.rikka.app/ 下载安装后重试" -ForegroundColor Yellow
        Say "        2. Shizuku 版本太旧 → 更新到最新版" -ForegroundColor Yellow
        Read-Host "按回车退出"
        exit 1
    }
}

# ---------- 4. 检查应用 ----------
Step "4/5" "检查应用 ..."

$installed = (& $adb shell "pm list packages com.autoswapeng.app" 2>$null | Select-String 'com.autoswapeng.app' -Quiet)

if (-not $installed) {
    Warn "没检测到「自动翻转EN」"
    $apk = Get-ChildItem -Path $PSScriptRoot -Filter '*.apk' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($apk) {
        Warn "发现同目录的 $($apk.Name)，正在安装 ..."
        & $adb install -r $apk.FullName
        Start-Sleep -Seconds 2
    } else {
        Say ""
        Say "        请把 AutoSwapEng 的 apk 放到本脚本同一个文件夹里，" -ForegroundColor Yellow
        Say "        或者手动传到手机安装，然后重新运行本脚本。" -ForegroundColor Yellow
        Read-Host "按回车退出"
        exit 1
    }
} else {
    Ok "应用已安装"
}

# ---------- 5. 打开应用 ----------
Step "5/5" "打开应用 ..."
& $adb shell am start -n com.autoswapeng.app/.MainActivity 2>$null | Out-Null
Ok "已打开"

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor White
Write-Host "     全部完成！" -ForegroundColor Green
Write-Host ""
Write-Host "     接下来在手机上操作：" -ForegroundColor White
Write-Host "       1. 打开「自动翻转EN」" -ForegroundColor White
Write-Host "       2. 点 Shizuku 卡片 → 授权（选「始终允许」）" -ForegroundColor White
Write-Host "       3. 点 OCR 识别权限 → 去授权 → 弹窗选【共享整个屏幕】" -ForegroundColor White
Write-Host "       4. 点「启动悬浮窗」" -ForegroundColor White
Write-Host "       5. 切到微信小程序，进拼写题，点悬浮球的「自动翻转」" -ForegroundColor White
Write-Host "  ============================================================" -ForegroundColor White
Write-Host ""
Read-Host "按回车退出"
```

### 10.3 使用脚本的注意事项

| 事项 | 说明 |
|---|---|
| **两个文件必须放同一文件夹** | bat 靠相对路径找 ps1 |
| **首次运行可能被拦截** | Windows 可能提示脚本风险 → 点「仍要运行」 |
| **把 apk 也放进去** | 脚本检测到同目录有 apk 会自动安装 |
| **手机必须开 USB 调试** | 并在弹窗里点「允许」 |
| **Shizuku 必须已安装** | 脚本只负责启动，不负责安装 |

---

## 附：完整使用流程速查

```
【一次性准备】
  ① 手机装好「自动翻转EN」
  ② 手机装好 Shizuku（https://shizuku.rikka.app/）
  ③ 电脑上放好两个脚本文件（可选）

【每次手机重启后】
  ④ 启动 Shizuku
      · 方法一：打开 Shizuku App → 点「启动」
      · 方法二：电脑上双击「一键启动Shizuku.bat」
  ⑤ 打开「自动翻转EN」→ 检查三项权限是否都绿
  ⑥ 点「启动悬浮窗」

【每次做题】
  ⑦ 切到微信 → 下拉 → 翻转外语小程序
  ⑧ 进拼写题
  ⑨ 点悬浮球的「自动翻转」
  ⑩ 结束后再点一次停止
```
