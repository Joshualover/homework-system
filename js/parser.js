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
