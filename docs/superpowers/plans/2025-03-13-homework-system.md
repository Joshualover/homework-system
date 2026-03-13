# 小学生作业系统 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个网页应用，允许用户输入自然语言描述的作业任务，系统自动识别并生成结构化的任务清单。

**Architecture:** 使用纯 HTML/CSS/JavaScript 构建单页应用，无需后端。任务识别通过前端 JavaScript 解析自然语言，提取科目、任务内容、截止时间等信息。

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), LocalStorage 数据持久化

---

## Chunk 1: 项目基础结构

### Task 1: 创建基础 HTML 结构

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`

- [ ] **Step 1: 创建 index.html 基础结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>小学生作业系统</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>📝 小学生作业系统</h1>
            <p>输入作业任务，自动生成清单</p>
        </header>
        
        <main>
            <section class="input-section">
                <textarea id="taskInput" placeholder="例如：数学作业第10页练习题，明天交..."></textarea>
                <button id="addTaskBtn">生成任务清单</button>
            </section>
            
            <section class="tasks-section">
                <h2>📋 任务清单</h2>
                <div id="taskList"></div>
            </section>
        </main>
    </div>
    
    <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建基础 CSS 样式**

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}

header {
    text-align: center;
    color: white;
    margin-bottom: 30px;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
}

header p {
    font-size: 1.1rem;
    opacity: 0.9;
}

.input-section {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    margin-bottom: 25px;
}

#taskInput {
    width: 100%;
    min-height: 120px;
    padding: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    resize: vertical;
    transition: border-color 0.3s;
}

#taskInput:focus {
    outline: none;
    border-color: #667eea;
}

#addTaskBtn {
    width: 100%;
    padding: 15px;
    margin-top: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

#addTaskBtn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.tasks-section {
    background: white;
    padding: 25px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.tasks-section h2 {
    margin-bottom: 20px;
    color: #333;
}

#taskList {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
```

- [ ] **Step 3: 初始化 Git 并提交**

```bash
git add .
git commit -m "feat: 创建项目基础结构"
```

---

## Chunk 2: 任务识别引擎

### Task 2: 实现任务解析器

**Files:**
- Create: `js/parser.js`
- Modify: `index.html` - 添加 parser.js 引用
- Create: `js/__tests__/parser.test.js` (可选，简单测试)

- [ ] **Step 1: 创建 parser.js 任务解析模块**

```javascript
/**
 * 作业任务解析器
 * 从自然语言中提取结构化任务信息
 */

// 科目关键词映射
const SUBJECT_KEYWORDS = {
    '语文': ['语文', '作文', '阅读', '背诵', '默写', '生字', '课文'],
    '数学': ['数学', '计算', '口算', '应用题', '练习', '习题', '试卷'],
    '英语': ['英语', '单词', '听力', '朗读', '背诵', '语法', '作文'],
    '科学': ['科学', '实验', '观察', '自然'],
    '美术': ['美术', '画画', '绘画', '手工'],
    '音乐': ['音乐', '唱歌', '乐器', '练'],
    '体育': ['体育', '运动', '跑步', '跳绳']
};

// 时间关键词
const TIME_KEYWORDS = {
    '今天': 0,
    '明天': 1,
    '后天': 2,
    '下周一': 7,
    '下周五': 11,
    '周末': 6,
    '下周': 7
};

/**
 * 检测科目
 * @param {string} text - 输入文本
 * @returns {string} - 检测到的科目
 */
function detectSubject(text) {
    for (const [subject, keywords] of Object.entries(SUBJECT_KEYWORDS)) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                return subject;
            }
        }
    }
    return '其他';
}

/**
 * 检测截止时间
 * @param {string} text - 输入文本
 * @returns {string|null} - 格式化后的日期或null
 */
function detectDeadline(text) {
    const today = new Date();
    
    for (const [keyword, days] of Object.entries(TIME_KEYWORDS)) {
        if (text.includes(keyword)) {
            const deadline = new Date(today);
            deadline.setDate(today.getDate() + days);
            return formatDate(deadline);
        }
    }
    
    // 尝试匹配 "X月X日" 格式
    const dateMatch = text.match(/(\d{1,2})月(\d{1,2})[日号]/);
    if (dateMatch) {
        const month = parseInt(dateMatch[1]) - 1;
        const day = parseInt(dateMatch[2]);
        const deadline = new Date(today.getFullYear(), month, day);
        if (deadline < today) {
            deadline.setFullYear(today.getFullYear() + 1);
        }
        return formatDate(deadline);
    }
    
    return null;
}

/**
 * 格式化日期
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日 (${weekday})`;
}

/**
 * 提取任务描述
 * @param {string} text - 输入文本
 * @returns {string}
 */
function extractDescription(text) {
    // 移除时间相关词汇，保留核心任务描述
    let desc = text;
    for (const keyword of Object.keys(TIME_KEYWORDS)) {
        desc = desc.replace(new RegExp(keyword, 'g'), '');
    }
    desc = desc.replace(/\d{1,2}月\d{1,2}[日号]/g, '');
    desc = desc.replace(/之前|以前|前交|前完成/g, '');
    return desc.trim() || text;
}

/**
 * 解析单个任务
 * @param {string} text - 任务文本
 * @returns {Object} - 结构化任务对象
 */
export function parseTask(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }
    
    const trimmed = text.trim();
    if (!trimmed) {
        return null;
    }
    
    return {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        rawText: trimmed,
        subject: detectSubject(trimmed),
        description: extractDescription(trimmed),
        deadline: detectDeadline(trimmed),
        completed: false,
        createdAt: new Date().toISOString()
    };
}

/**
 * 解析多个任务（按标点符号分割）
 * @param {string} text - 包含多个任务的文本
 * @returns {Array} - 任务对象数组
 */
export function parseMultipleTasks(text) {
    if (!text) return [];
    
    // 按常见分隔符分割
    const separators = /[。；;\n]+/;
    const parts = text.split(separators).filter(p => p.trim());
    
    return parts
        .map(part => parseTask(part))
        .filter(task => task !== null);
}

export default { parseTask, parseMultipleTasks };
```

- [ ] **Step 2: 更新 index.html 添加模块引用**

修改 index.html 的 script 标签：
```html
<script type="module" src="js/app.js"></script>
```

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: 实现任务解析引擎"
```

---

## Chunk 3: 主应用逻辑与 UI 交互

### Task 3: 实现主应用逻辑

**Files:**
- Modify: `js/app.js` - 完整实现
- Modify: `css/style.css` - 添加任务卡片样式

- [ ] **Step 1: 实现 app.js 主逻辑**

```javascript
import { parseMultipleTasks } from './parser.js';

/**
 * 小学生作业系统 - 主应用
 */

class HomeworkSystem {
    constructor() {
        this.tasks = this.loadTasks();
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderTasks();
    }
    
    bindEvents() {
        const addBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        
        addBtn.addEventListener('click', () => this.handleAddTasks());
        
        taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleAddTasks();
            }
        });
    }
    
    handleAddTasks() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        
        if (!text) {
            this.showMessage('请输入作业内容', 'warning');
            return;
        }
        
        const newTasks = parseMultipleTasks(text);
        
        if (newTasks.length === 0) {
            this.showMessage('未能识别有效任务', 'error');
            return;
        }
        
        this.tasks.unshift(...newTasks);
        this.saveTasks();
        this.renderTasks();
        
        input.value = '';
        this.showMessage(`成功添加 ${newTasks.length} 个任务`, 'success');
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    }
    
    getSubjectIcon(subject) {
        const icons = {
            '语文': '📖',
            '数学': '🔢',
            '英语': '🔤',
            '科学': '🔬',
            '美术': '🎨',
            '音乐': '🎵',
            '体育': '⚽',
            '其他': '📝'
        };
        return icons[subject] || '📝';
    }
    
    getSubjectColor(subject) {
        const colors = {
            '语文': '#e74c3c',
            '数学': '#3498db',
            '英语': '#9b59b6',
            '科学': '#1abc9c',
            '美术': '#e67e22',
            '音乐': '#f39c12',
            '体育': '#2ecc71',
            '其他': '#95a5a6'
        };
        return colors[subject] || '#95a5a6';
    }
    
    renderTasks() {
        const container = document.getElementById('taskList');
        
        if (this.tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>🎯 还没有作业任务</p>
                    <p>在上方输入作业内容，点击"生成任务清单"</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.tasks.map(task => `
            <div class="task-card ${task.completed ? 'completed' : ''}" 
                 style="border-left-color: ${this.getSubjectColor(task.subject)}">
                <div class="task-header">
                    <span class="subject-badge" style="background: ${this.getSubjectColor(task.subject)}">
                        ${this.getSubjectIcon(task.subject)} ${task.subject}
                    </span>
                    ${task.deadline ? `<span class="deadline">⏰ ${task.deadline}</span>` : ''}
                </div>
                <p class="task-description">${this.escapeHtml(task.description)}</p>
                <div class="task-actions">
                    <button class="btn-toggle" onclick="homeworkSystem.toggleTask('${task.id}')">
                        ${task.completed ? '↩️ 撤销完成' : '✅ 标记完成'}
                    </button>
                    <button class="btn-delete" onclick="homeworkSystem.deleteTask('${task.id}')">
                        🗑️ 删除
                    </button>
                </div>
            </div>
        `).join('');
        
        this.renderStats();
    }
    
    renderStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        // 可以添加统计信息到界面
        const statsHtml = `
            <div class="stats-bar">
                <span>📊 总计: ${total}</span>
                <span>⏳ 待完成: ${pending}</span>
                <span>✅ 已完成: ${completed}</span>
            </div>
        `;
        
        // 如果已存在统计栏则更新，否则添加到任务区域顶部
        let statsEl = document.querySelector('.stats-bar');
        if (statsEl) {
            statsEl.outerHTML = statsHtml;
        } else {
            const tasksSection = document.querySelector('.tasks-section');
            tasksSection.insertAdjacentHTML('afterbegin', statsHtml);
        }
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    showMessage(message, type = 'info') {
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    saveTasks() {
        localStorage.setItem('homeworkTasks', JSON.stringify(this.tasks));
    }
    
    loadTasks() {
        const saved = localStorage.getItem('homeworkTasks');
        return saved ? JSON.parse(saved) : [];
    }
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// 初始化应用
window.homeworkSystem = new HomeworkSystem();
```

- [ ] **Step 2: 更新 CSS 添加任务卡片样式**

在 `css/style.css` 末尾添加：

```css
/* 统计栏 */
.stats-bar {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding: 12px 15px;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 0.9rem;
    color: #666;
}

/* 空状态 */
.empty-state {
    text-align: center;
    padding: 50px 20px;
    color: #999;
}

.empty-state p:first-child {
    font-size: 1.2rem;
    margin-bottom: 10px;
}

/* 任务卡片 */
.task-card {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 18px;
    border-left: 4px solid;
    transition: all 0.3s ease;
}

.task-card:hover {
    transform: translateX(5px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.task-card.completed {
    opacity: 0.6;
    background: #e8e8e8;
}

.task-card.completed .task-description {
    text-decoration: line-through;
    color: #888;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.subject-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 12px;
    border-radius: 20px;
    color: white;
    font-size: 0.85rem;
    font-weight: 500;
}

.deadline {
    color: #e74c3c;
    font-size: 0.85rem;
    font-weight: 500;
}

.task-description {
    color: #333;
    line-height: 1.6;
    margin-bottom: 15px;
}

.task-actions {
    display: flex;
    gap: 10px;
}

.task-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
}

.btn-toggle {
    background: #2ecc71;
    color: white;
}

.btn-toggle:hover {
    background: #27ae60;
}

.btn-delete {
    background: #e74c3c;
    color: white;
}

.btn-delete:hover {
    background: #c0392b;
}

/* 响应式 */
@media (max-width: 600px) {
    header h1 {
        font-size: 1.8rem;
    }
    
    .stats-bar {
        flex-wrap: wrap;
        gap: 10px;
    }
    
    .task-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
}
```

- [ ] **Step 3: 提交代码**

```bash
git add .
git commit -m "feat: 实现主应用逻辑和 UI 交互"
```

---

## Chunk 4: 完善与优化

### Task 4: 添加示例数据和交互优化

**Files:**
- Create: `README.md`
- Modify: `index.html` - 添加示例提示
- Modify: `js/app.js` - 添加清空功能

- [ ] **Step 1: 更新 index.html 添加示例输入**

在输入框下方添加示例区域：
```html
<section class="input-section">
    <textarea id="taskInput" placeholder="例如：数学作业第10页练习题，明天交..."></textarea>
    <div class="examples">
        <p>💡 示例：</p>
        <button class="example-btn" onclick="setExample('语文背诵课文第三课，明天检查')">语文背诵</button>
        <button class="example-btn" onclick="setExample('数学口算题卡第15页，周五交')">数学口算</button>
        <button class="example-btn" onclick="setExample('英语单词抄写3遍；听力练习20分钟')">英语作业</button>
    </div>
    <button id="addTaskBtn">生成任务清单</button>
</section>
```

- [ ] **Step 2: 添加示例按钮样式**

```css
.examples {
    margin: 15px 0;
    padding: 12px;
    background: #f0f4ff;
    border-radius: 8px;
}

.examples p {
    margin-bottom: 8px;
    color: #667eea;
    font-size: 0.9rem;
}

.example-btn {
    margin: 3px;
    padding: 6px 12px;
    background: white;
    border: 1px solid #667eea;
    border-radius: 15px;
    color: #667eea;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
}

.example-btn:hover {
    background: #667eea;
    color: white;
}
```

- [ ] **Step 3: 更新 app.js 添加示例功能**

在 HomeworkSystem 类中添加：
```javascript
// 在 constructor 之后添加全局函数
window.setExample = (text) => {
    document.getElementById('taskInput').value = text;
};
```

添加清空所有任务功能：
```javascript
clearAllTasks() {
    if (this.tasks.length === 0) return;
    
    if (confirm('确定要清空所有任务吗？')) {
        this.tasks = [];
        this.saveTasks();
        this.renderTasks();
        this.showMessage('所有任务已清空', 'success');
    }
}
```

在 renderStats 中添加清空按钮：
```javascript
if (this.tasks.length > 0) {
    statsHtml += `<button onclick="homeworkSystem.clearAllTasks()" class="btn-clear">🗑️ 清空全部</button>`;
}
```

- [ ] **Step 4: 创建 README.md**

```markdown
# 📝 小学生作业系统

一个简洁的网页应用，帮助小学生和家长管理作业任务。

## 功能特点

- 🎯 自然语言输入 - 像聊天一样输入作业内容
- 🤖 智能识别 - 自动识别科目、截止时间和任务内容
- 📋 任务清单 - 清晰展示所有待办任务
- ✅ 完成标记 - 一键标记任务完成状态
- 💾 本地存储 - 数据保存在浏览器本地，刷新不丢失
- 📱 响应式设计 - 支持手机、平板、电脑访问

## 使用方法

1. 打开 `index.html` 文件（双击即可在浏览器中打开）
2. 在输入框中输入作业内容，例如：
   - "数学作业第10页，明天交"
   - "语文背诵课文第三课；英语单词抄写5遍"
3. 点击"生成任务清单"按钮
4. 系统自动解析并生成结构化任务

## 支持的科目

- 📖 语文
- 🔢 数学
- 🔤 英语
- 🔬 科学
- 🎨 美术
- 🎵 音乐
- ⚽ 体育

## 技术栈

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- LocalStorage 数据持久化

## 浏览器支持

- Chrome / Edge
- Firefox
- Safari
- 移动端浏览器

## 本地开发

```bash
# 克隆或下载项目
cd homework-system

# 使用任意静态服务器（可选）
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# 然后访问 http://localhost:8000
```

## License

MIT
```

- [ ] **Step 5: 最终提交**

```bash
git add .
git commit -m "feat: 添加示例数据、README 和交互优化"
```

---

## 测试清单

- [ ] 输入单条任务，验证科目识别正确
- [ ] 输入多条任务（用分号/句号分隔），验证批量解析
- [ ] 测试不同时间表达（今天/明天/后天/具体日期）
- [ ] 测试任务完成/撤销功能
- [ ] 测试任务删除功能
- [ ] 测试清空全部功能
- [ ] 刷新页面，验证数据持久化
- [ ] 测试响应式布局（手机尺寸）

---

## 注意事项

1. 使用 ES6 模块语法 (`type="module"`)，需要通过 HTTP 服务器访问，不能直接用 file:// 协议打开
2. 建议使用本地服务器进行测试
3. 任务识别基于关键词匹配，可能不够智能，后续可考虑接入 AI API
