let questions = [];
let currentPage = 1;
const questionsPerPage = 5;
let selectedIndexes = []; // 用来保存勾选的题目索引

// 页面加载时读取题库
window.onload = async function () {
  const res = await fetch('questions.json');
  questions = await res.json();
  renderQuestions();
  setupFilter();
};

document.getElementById("jumpPageBtn").addEventListener("click", () => {
  const input = document.getElementById("jumpPageInput");
  const page = parseInt(input.value);
  const filtered = questions.filter(q =>
    q.type === selectedType &&
    q.topic === selectedKnowledge &&
    q.nandu === selectedDifficulty
  );
  const totalPages = Math.ceil(filtered.length / questionsPerPage);
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderFilteredQuestions();
  } else {
    alert("无效页码！");
  }
});


// 渲染题目
function renderQuestions() {
  const container = document.getElementById('questionContainer');
  container.innerHTML = "";

  const type = document.getElementById("typeFilter").value;
  const filtered = type === "all" ? questions : questions.filter(q => q.type === type);

  const totalPages = Math.ceil(filtered.length / questionsPerPage);
  const start = (currentPage - 1) * questionsPerPage;
  const pageItems = filtered.slice(start, start + questionsPerPage);
  
  pageItems.forEach((q, i) => {
    const isChecked = selectedIndexes.includes(questions.indexOf(q)); // 检查当前题目是否被选中

    const div = document.createElement('div');
    div.className = "question";
    div.innerHTML = `
      <h3><input type="checkbox" class="question-select" data-index="${questions.indexOf(q)}" ${isChecked ? 'checked' : ''} /> (${q.nandu})【${q.type}】${q.topic}</h3>
      <p>${q.content}</p>
     <button onclick="toggleExplanation(this)">显示解析</button>
     <div class="explanation" style="display: none;">${q.explanation}</div>
    `;
    container.appendChild(div);
  });

  document.getElementById("pageInfo").innerText = `第 ${currentPage} 页 / 共 ${totalPages} 页`;


  // 让 MathJax 渲染新内容
  MathJax.typesetPromise();
}

// 切换解析显示
function toggleExplanation(btn) {
  const expl = btn.nextElementSibling;
  if (expl.style.display === 'none') {
    expl.style.display = 'block';
    btn.textContent = '隐藏解析';
  } else {
    expl.style.display = 'none';
    btn.textContent = '显示解析';
  }
}

// 筛选
function setupFilter() {
  document.getElementById("typeFilter").addEventListener("change", () => {
    currentPage = 1;
    renderFilteredQuestions();
  });

}

const knowledgePoints = {
  "选择题": ["行列式", "矩阵", "线性方程组", "向量", "二次型", "线性空间"],
  "填空题": ["行列式", "矩阵", "线性方程组", "向量", "二次型", "线性空间"],
  "判断题": ["行列式", "矩阵", "线性方程组", "向量", "二次型", "线性空间"],
  "计算题": ["行列式", "矩阵", "线性方程组", "向量", "二次型", "线性空间"],
  "证明题": ["行列式", "矩阵", "线性方程组", "向量", "二次型", "线性空间"],
};

const difficulties = ["容易", "中等", "困难"];

let selectedType = null;
let selectedKnowledge = null;
let selectedDifficulty = null;

document.querySelectorAll(".type-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedType = btn.dataset.type;
    selectedKnowledge = null;
    selectedDifficulty = null;

    renderKnowledgeButtons();
    document.getElementById("knowledgeContainer").style.display = "block";
    document.getElementById("difficultyContainer").style.display = "none";
    document.getElementById("questionContainer").innerHTML = ""; // 清空题目
  });
});

function renderKnowledgeButtons() {
  const container = document.getElementById("knowledgeContainer");
  container.innerHTML = "<label>知识点：</label>";
  knowledgePoints[selectedType].forEach(kp => {
    const btn = document.createElement("button");
    btn.className = "knowledge-btn";
    btn.textContent = kp;
    btn.addEventListener("click", () => {
      selectedKnowledge = kp;
      renderDifficultyButtons();
      document.getElementById("difficultyContainer").style.display = "block";
      document.getElementById("questionContainer").innerHTML = "";
    });
    container.appendChild(btn);
  });
}

function renderDifficultyButtons() {
  const container = document.getElementById("difficultyContainer");
  container.innerHTML = "<label>难度：</label>";
  difficulties.forEach(level => {
    const btn = document.createElement("button");
    btn.className = "difficulty-btn";
    btn.textContent = level;
    btn.addEventListener("click", () => {
      selectedDifficulty = level;
      currentPage = 1;
      renderFilteredQuestions();
    });
    container.appendChild(btn);
  });
}

function renderFilteredQuestions() {
  const filtered = questions.filter(q =>
    q.type === selectedType &&
    q.topic === selectedKnowledge &&
    q.nandu === selectedDifficulty
  );

  renderQuestionsFromList(filtered);
}

function renderQuestionsFromList(filtered) {
  const container = document.getElementById('questionContainer');
  container.innerHTML = "";

  const totalPages = Math.ceil(filtered.length / questionsPerPage);
  const start = (currentPage - 1) * questionsPerPage;
  const pageItems = filtered.slice(start, start + questionsPerPage);

  pageItems.forEach(q => {
    const isChecked = selectedIndexes.includes(questions.indexOf(q));
    const div = document.createElement('div');
    div.className = "question";
    div.innerHTML = `
      <h3><input type="checkbox" class="question-select" data-index="${questions.indexOf(q)}" ${isChecked ? 'checked' : ''} /> (${q.nandu})【${q.type}】${q.topic}</h3>
      <p>${q.content}</p>
      <button onclick="toggleExplanation(this)">显示解析</button>
      <div class="explanation" style="display: none;">${q.explanation}</div>
    `;
    container.appendChild(div);
  });

  document.getElementById("pageInfo").innerText = `第 ${currentPage} 页 / 共 ${totalPages} 页`;

  MathJax.typesetPromise();
}


// 监听复选框选择
document.getElementById("questionContainer").addEventListener("change", (e) => {
  if (e.target.classList.contains("question-select")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    if (e.target.checked) {
      selectedIndexes.push(index);
    } else {
      selectedIndexes = selectedIndexes.filter(i => i !== index);
    }
  }
});

// 生成试卷
document.getElementById("generatePaper").addEventListener("click", () => {
  const selectedQuestions = selectedIndexes.map(i => questions[i]);

  if (selectedQuestions.length === 0) {
    alert("请至少选择一道题目！");
    return;
  }

  showPaper(selectedQuestions);
});

// 显示试卷
function showPaper(selected) {
  const win = window.open("", "_blank");
  win.document.write(`
    <html>
    <head>
      <title>组卷结果</title>
      <script>
        window.MathJax = {
          tex: { inlineMath: [['\\\\(', '\\\\)'], ['\\$', '\\$']] },
          svg: { fontCache: 'global' }
        };
      </script>
      <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" async></script>
      <style>
        body { font-family: sans-serif; padding: 20px; line-height: 1.8; }
        .question { margin-bottom: 30px; }
      </style>
    </head>
    <body>
      <h1>试卷预览</h1>
      ${selected.map((q, idx) => `
        <div class="question">
          <strong>第 ${idx + 1} 题【${q.type}】${q.topic}：</strong>
          <p>${q.content}</p>
        </div>
      `).join("")}
    </body>
    </html>
  `);
  win.document.close();
}


// 导出 LaTeX 代码
document.getElementById("exportLatex").addEventListener("click", () => {
  const selectedQuestions = selectedIndexes.map(i => questions[i]);

  if (selectedQuestions.length === 0) {
    alert("请至少选择一道题目！");
    return;
  }

  const latexCode = generateLatex(selectedQuestions);
  downloadLatexFile(latexCode);
});


// 生成 LaTeX 格式的代码
function generateLatex(selectedQuestions) {
  let latex = `\\documentclass[twocolumn,landscape,UTF8]{article}
\\usepackage{float,color,titlesec,graphicx,makecell,fancyhdr,setspace}
\\usepackage[absolute,overlay]{textpos} 
\\usepackage{amsmath,amsfonts,amsmath,amssymb,times,txfonts,ctex,zhnumber,array}
\\usepackage{parskip}  
\\setlength{\\parindent}{2em}  % 调整缩进量
\\setlength{\\columnsep}{2cm}
\\setlength{\\marginparwidth}{10mm}
\\usepackage{enumerate}
\\usepackage[a3paper,top=2cm, bottom=2cm, left=1.5cm, right=4cm]{geometry}
\\oddsidemargin=-0.15cm   
\\linespread{1.3} 

\\newcommand{\\defen}{\\zihao{4}\\hspace*{-0.3cm}\\vspace{0mm}
\\renewcommand{\\arraystretch}{1.2}
\\begin{tabular}[b]{|>{\\centering\\arraybackslash}m{1.8cm}|>{\\centering\\arraybackslash}m{2.3cm}|}
\\hline
\\centering 得~~分 &阅卷人 \\\\
\\hline 
\\centering   &   \\\\
\\hline
\\end{tabular}}

\\newsavebox{\\zdx}
\\newsavebox{\\zdxr}

\\newcommand{\\putzdxr}{
\t\\begin{picture}(0,0)
\t\t\\put(440,210){\\rotatebox{270}{\\usebox{\\zdxr}}}
\t\\end{picture}
}

\\newcommand{\\kg}{\\\\\\hspace*{\\parindent}}

\\renewcommand{\\headrulewidth}{0pt}
\\pagestyle{fancy}
\\fancyfoot[L]{\\hspace{0.5\\columnwidth}\\footnotesize\\zihao{5}\\textbf{《线性代数》}第\\number\\numexpr2*\\thepage-1\\relax 页（共4页）$A$卷 \\hspace{0.5\\columnwidth}} 
\\fancyfoot[R]{\\hspace{0.5\\columnwidth}\\footnotesize \\zihao{5}\\textbf{《线性代数》}第\\number\\numexpr2*\\thepage\\relax 页（共4页）$A$卷 \\hspace{0.5\\columnwidth}} 
\\fancyfoot[C]{} 


\\begin{document} 
\t
\\sbox{\\zdx}
{\\parbox{30cm}{\\zihao{3}\\centering\\vspace{7mm}
\t姓名~\\underline{\\makebox[44mm][c]{}}~ 学号\\underline{\\makebox[44mm][c]{}}~ 专业\\underline{\\makebox[44mm][c]{}}~ 院系\\underline{\\makebox[44mm][c]{}} ~\\\\
 \\dotfill{}\\dotfill{} 密\\dotfill{}封\\dotfill{}线{\\dotfill} \\dotfill{}}}

\t
\\sbox{\\zdxr}
{\\parbox{30cm}{\\zihao{3}~\\\\\\centering\\vspace{-2mm}
\t姓名~\\underline{\\makebox[44mm][c]{}}~ 学号\\underline{\\makebox[44mm][c]{}}~ 专业\\underline{\\makebox[44mm][c]{}}~ 院系\\underline{\\makebox[44mm][c]{}} ~\\\\
\t\\vspace{2mm}
\\dotfill{}\\dotfill{} 密\\dotfill{}封 \\dotfill{}线{\\dotfill}\\dotfill{}}}

\\begin{spacing}{1.25}
\\zihao{-4}\t\\begin{center}
       \\begin{LARGE}
           \\textbf{昭通学院2024-2025学年第二学期\\\\
            《线性代数》期末考试 $A$ 卷}\\\\
        \\end{LARGE}
(本卷共4页，满分100分；考试时间：120分钟；考试方式：闭卷)\\\\
\t\\vspace{0CM}
\t\\setlength{\\tabcolsep}{6mm}
\t\\renewcommand\\arraystretch{1.7} 
            \\begin{tabular}{|c|c|c|c|c|c|c|c|c|}
               \t\\hline
               题~号 &一 &二 &三 &四 &五 &总~分 &累分人  & 复核人   \\\\
            	\\hline
               得~分 &   &  &  &   &  &  &   & \\\\
        	    \\hline
           \\end{tabular}
    \\end{center}
\\end{spacing}

\\vspace{-0.2cm}
\\setlength{\\marginparsep}{1.5cm}
\\begin{textblock*}{20mm}(-8mm, -3mm)
\t\\rotatebox{90}{\\usebox{\\zdx}}
\\end{textblock*}%\\rule{3cm}{0.4pt}
\t

\\vspace{6mm}\n\n`;

  // 按题型分组题目
  const questionsByType = {};
  selectedQuestions.forEach(q => {
    if (!questionsByType[q.type]) {
      questionsByType[q.type] = [];
    }
    questionsByType[q.type].push(q);
  });

  // 生成题目内容
  let sectionNumber = 1;
  let questionNumber = 1;
  
// 选择题
if (questionsByType['选择题']) {
  latex += `\\defen \\quad \\textbf{一、选择题 ~(每题 3 分，共 ${questionsByType['选择题'].length * 3} 分)}\n{\\zihao{3}\n\t\n`;
  
  questionsByType['选择题'].forEach((q, idx) => {
    // 删除原有题号并处理内容
    let content = removeQuestionNumber(q.content)
      .replace(/<br><br>/g, "\n\\kg  ")
      .replace(/&nbsp/g, "\\quad");
    latex += `${idx + 1}. ${content}\n`;
    
    // 添加解析，前面加换行
    if (q.explanation) {
      latex += `\n\\textbf{解析:} ${removeQuestionNumber(q.explanation).replace(/&nbsp/g, "\\quad")}\n\n`;
    } else {
      latex += `\n`; // 保持题目间距一致
    }
  });
  
  latex += `}\n\\vspace{2mm}\n\n`;
  sectionNumber++;
}

// 判断题
if (questionsByType['判断题']) {
  latex += `\\defen \\quad \\textbf{二、判断题 ~(每题 2 分，共 ${questionsByType['判断题'].length * 2} 分)}\n{\\zihao{3}\n\t\n`;
  
  questionsByType['判断题'].forEach((q, idx) => {
    let content = removeQuestionNumber(q.content).replace(/&nbsp/g, "\\quad");
    latex += `${idx + 1}. ${content}\n`;
    
    // 添加解析，前面加换行
    if (q.explanation) {
      latex += `\n\\textbf{解析:} ${removeQuestionNumber(q.explanation).replace(/&nbsp/g, "\\quad")}\n\n`;
    } else {
      latex += `\n`;
    }
  });
  
  latex += `}\n\\vspace{2mm}\n\n`;
  sectionNumber++;
}

// 填空题
if (questionsByType['填空题']) {
  latex += `\\defen \\quad \\textbf{${sectionNumberToChinese(sectionNumber)}、填空题 ~(每题 3 分，共 ${questionsByType['填空题'].length * 3} 分)}\n{\\zihao{3}\n\n`;
  
  questionsByType['填空题'].forEach((q, idx) => {
    let content = removeQuestionNumber(q.content).replace(/&nbsp/g, "\\quad");
    latex += `${idx + 1}. ${content}\\\\\n\t\n`;
    
    // 添加解析，前面加换行
    if (q.explanation) {
      latex += `\n\\textbf{解析:} ${removeQuestionNumber(q.explanation).replace(/&nbsp/g, "\\quad")}\n\n`;
    } else {
      latex += `\n`;
    }
  });
  
  latex += `}\n\\vspace{1mm}\n\n`;
  sectionNumber++;
}

// 计算题
if (questionsByType['计算题']) {
  latex += `\\defen \\quad \\textbf{${sectionNumberToChinese(sectionNumber)}、计算题 ~(每题 10 分，共 ${questionsByType['计算题'].length * 10} 分)}\n{\\zihao{3}\n\t\t\n`;
  
  questionsByType['计算题'].forEach((q, idx) => {
    let content = removeQuestionNumber(q.content).replace(/&nbsp/g, "\\quad");
    latex += `${idx + 1}. ${content}\\\\\n\t\\\\\n\t\\\\\n\t\t\\\\\n\t\\\\\n\t\\\\\n\n`;
    
    // 添加解析，前面加换行
    if (q.explanation) {
      latex += `\n\\textbf{解析:} ${removeQuestionNumber(q.explanation).replace(/&nbsp/g, "\\quad")}\n\n`;
    } else {
      latex += `\n`;
    }
  });
  
  latex += `}\n\\vspace{2mm}\n\n`;
}

  // 结束文档
  latex += `\\vspace*{-2cm} 

\\begin{textblock*}{20mm}(386mm, 0mm) 
\t\\rotatebox{270}{\\usebox{\\zdxr}} 
\\end{textblock*}

\\end{document}`;

  return latex;
}

// 辅助函数：数字转中文
function sectionNumberToChinese(num) {
  const chineseNumbers = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  return chineseNumbers[num - 1] || num;
}

function removeQuestionNumber(content) {
  return content.trim().replace(/^\d+[\.\、\):：]?\s*/, '');
}

// 下载 LaTeX 代码到文件
function downloadLatexFile(latexCode) {
  const blob = new Blob([latexCode], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'exam_paper.tex';
  link.click();
}

// 滑动面板控制逻辑
const toggleBtn = document.getElementById("togglePanelBtn");
const sidePanel = document.getElementById("sidePanel");
const closePanelBtn = document.getElementById("closePanelBtn");
const selectedListDiv = document.getElementById("selectedQuestionsList");

toggleBtn.addEventListener("click", () => {
  updateSelectedQuestionsList();
  sidePanel.classList.add("open");
});

closePanelBtn.addEventListener("click", () => {
  sidePanel.classList.remove("open");
});

function updateSelectedQuestionsList() {
  selectedListDiv.innerHTML = "";
  if (selectedIndexes.length === 0) {
    selectedListDiv.innerHTML = "<p>尚未勾选任何题目。</p>";
    return;
  }

  selectedIndexes.forEach(index => {
    const q = questions[index];
    const div = document.createElement("div");
    div.className = "selected-question";
    div.innerHTML = `
      <h4>【${q.type}】${q.topic}（${q.nandu}）</h4>
      <p>${q.content}</p>
      <hr />
    `;
    selectedListDiv.appendChild(div);
  });

  MathJax.typesetPromise();
}

// 处理：删除某一道题
function removeSelectedQuestion(indexToRemove) {
  const idx = selectedIndexes.indexOf(indexToRemove);
  if (idx !== -1) {
    selectedIndexes.splice(idx, 1);
    updateSelectedQuestionsList();
    renderQuestionCards(); // 更新主界面卡片的勾选状态
  }
}

// 处理：清空所有已选题
document.getElementById("clearAllBtn").addEventListener("click", () => {
  if (confirm("确定要清空所有已选题吗？")) {
    selectedIndexes = [];
    updateSelectedQuestionsList();
    renderQuestionCards();
  }
});

// 更新右侧面板内容（添加删除按钮）
function updateSelectedQuestionsList() {
  selectedListDiv.innerHTML = "";
  if (selectedIndexes.length === 0) {
    selectedListDiv.innerHTML = "<p>尚未勾选任何题目。</p>";
    return;
  }

  selectedIndexes.forEach(index => {
    const q = questions[index];
    const div = document.createElement("div");
    div.className = "selected-question";
    div.innerHTML = `
      <h4>
        【${q.type}】${q.topic}（${q.nandu}）
        <button onclick="removeSelectedQuestion(${index})" title="移除此题">❌</button>
      </h4>
      <p>${q.content}</p>
      <hr />
    `;
    selectedListDiv.appendChild(div);
  });

  MathJax.typesetPromise();
}
// 上一页
document.getElementById("prevPageBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderFilteredQuestions();
  }
});

// 下一页
document.getElementById("nextPageBtn").addEventListener("click", () => {
  const filtered = questions.filter(q =>
    q.type === selectedType &&
    q.topic === selectedKnowledge &&
    q.nandu === selectedDifficulty
  );
  const totalPages = Math.ceil(filtered.length / questionsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderFilteredQuestions();
  }
});
