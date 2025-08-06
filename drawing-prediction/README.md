# Hand Drawing with SketchRNN - 修复版本

这是一个使用p5.js和ml5.js构建的手势控制绘画应用，结合了手部追踪和AI绘画完成功能。

## 修复内容

### 主要问题修复：
1. **库版本兼容性问题** - 统一使用与工作示例相同的稳定版本：
   - p5.js 0.9.0
   - ml5.js 0.12.2

2. **API调用方式错误** - 修复了ml5.js HandPose和SketchRNN的正确使用方法

3. **代码架构重构** - 从原生Canvas API转换为完整的p5.js框架

4. **手势识别优化** - 改进了手势检测的准确性和稳定性

### 功能特性：
- 👉 **指向手势** - 使用食指绘画
- 🤏 **捏合手势** - 点击按钮
- ✋ **张开手掌** - 清除画布
- 🎨 **AI绘画完成** - SketchRNN自动完成绘画

## 测试方法

### 本地测试：
```bash
cd drawing-prediction
python3 -m http.server 8000
```
然后访问：http://localhost:8000

### 比较测试：
1. **主应用** - http://localhost:8000
2. **手指追踪示例** - http://localhost:8001 (需要在forefingertrackexample目录启动)
3. **SketchRNN示例** - http://localhost:8002 (需要在sketchrnnexample目录启动)

### 浏览器要求：
- 需要HTTPS或localhost环境（摄像头权限）
- 推荐使用Chrome、Firefox或Safari
- 确保允许摄像头访问权限

## 故障排除

### 摄像头问题：
1. 检查浏览器权限设置
2. 确保使用HTTPS或localhost
3. 尝试刷新页面
4. 点击"Retry Camera Setup"按钮

### AI模型问题：
- SketchRNN模型需要时间加载（约5-15秒）
- 如果加载失败，会显示相应错误信息
- 可以切换不同的绘画类别重试

### 手势识别问题：
- 确保手部完整在摄像头画面中
- 手势需要保持稳定1秒以上
- 检查页面右侧的调试信息

## 文件结构
```
drawing-prediction/
├── index.html          # 主页面（已修复）
├── sketch.js           # p5.js主逻辑（重新编写）
├── README.md           # 说明文档
├── forefingertrackexample/  # 手指追踪工作示例
│   ├── index.html
│   └── sketch.js
└── sketchrnnexample/   # SketchRNN工作示例
    ├── index.html
    ├── sketch.js
    └── style.css
```

## 技术实现

### 使用的库：
- p5.js 0.9.0 - 图形绘制框架
- p5.dom.js - DOM操作扩展  
- ml5.js 0.12.2 - 机器学习库

### 手势识别逻辑：
- 使用21个手部关键点进行手势分析
- 基于手指位置和距离计算手势类型
- 添加时间延迟避免误触发

### SketchRNN集成：
- 支持flower、cat、pig、face四种绘画类别
- 使用种子路径进行AI绘画完成
- 实时显示AI生成的笔画

## 性能优化

- 减少手势检测延迟（500ms）
- 优化绘画触发条件（1笔画即可触发AI）
- 改进笔画数据格式匹配SketchRNN要求
- 添加视觉反馈显示手部关键点

---

## 原始功能保留：
- 美观的渐变背景UI
- 实时状态显示
- 调试信息面板
- 多类别AI绘画模型
- 响应式设计