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
                <div class=\"empty-state\">
                    <p>🎯 还没有作业任务</p>
                    <p>在上方输入作业内容，点击\"生成任务清单\"</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.tasks.map(task => `
            <div class=\"task-card ${task.completed ? 'completed' : ''}\" 
                 style=\"border-left-color: ${this.getSubjectColor(task.subject)}\">
                <div class=\"task-header\">
                    <span class=\"subject-badge\" style=\"background: ${this.getSubjectColor(task.subject)}\">
                        ${this.getSubjectIcon(task.subject)} ${task.subject}
                    </span>
                    ${task.deadline ? `<span class=\"deadline\">⏰ ${task.deadline}</span>` : ''}
                </div>
                <p class=\"task-description\">${this.escapeHtml(task.description)}</p>
                <div class=\"task-actions\">
                    <button class=\"btn-toggle\" onclick=\"homeworkSystem.toggleTask('${task.id}')\">
                        ${task.completed ? '↩️ 撤销完成' : '✅ 标记完成'}
                    </button>
                    <button class=\"btn-delete\" onclick=\"homeworkSystem.deleteTask('${task.id}')\">
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
        
        const statsHtml = `
            <div class=\"stats-bar\">
                <span>📊 总计: ${total}</span>
                <span>⏳ 待完成: ${pending}</span>
                <span>✅ 已完成: ${completed}</span>
                ${total > 0 ? `<button onclick=\"homeworkSystem.clearAllTasks()\" class=\"btn-clear\">🗑️ 清空全部</button>` : ''}
            </div>
        `;
        
        let statsEl = document.querySelector(\'.stats-bar\');
        if (statsEl) {
            statsEl.outerHTML = statsHtml;
        } else {
            const tasksSection = document.querySelector(\'.tasks-section\');
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
    clearAllTasks() {
        if (this.tasks.length === 0) return;
        if (confirm('确定要清空所有任务吗？')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.showMessage('所有任务已清空', 'success');
        }
    }
}

window.setExample = (text) => {
    const input = document.getElementById('taskInput');
    if (input) {
        input.value = text;
    }
};

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
