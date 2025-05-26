import re
import json

def split_braces(s):
    """
    输入形如 {内容} {内容} {内容} {内容} {内容} 的字符串
    返回内容列表，能正确匹配嵌套的大括号。
    """
    results = []
    stack = []
    current = []
    for c in s:
        if c == '{':
            if stack:
                current.append(c)
            stack.append(c)
        elif c == '}':
            stack.pop()
            if stack:
                current.append(c)
            else:
                # 大括号闭合，保存结果
                results.append(''.join(current))
                current = []
        else:
            if stack:
                current.append(c)
    return results

def parse_questions_tex(tex_filename):
    with open(tex_filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # 先匹配所有 \begin{question} ... \end{question} 整块内容
    blocks = re.findall(r'\\begin{question}(.+?)\\end{question}', content, re.DOTALL)

    questions = []

    for block in blocks:
        # 替换 \left\{ 和 \right\} 为占位符，避免干扰大括号匹配
        block = block.replace(r'\left\{', 'LEFTCURLY').replace(r'\right\}', 'RIGHTCURLY')

        # 五组大括号内容按顺序出现
        parts = split_braces(block)

        if len(parts) != 5:
            print("警告: 题目字段数量不为5，跳过。内容片段：", parts)
            continue

        # 把占位符还原
        parts = [p.replace('LEFTCURLY', r'\left\{').replace('RIGHTCURLY', r'\right\}') for p in parts]

        q_type, topic, nandu, content, explanation = parts

        if len(parts) != 5:
            print("⚠️ 警告: 题目字段数量不为5，跳过该题。内容为：")
            print(block)
            continue
        q_type, topic, nandu, content, explanation = parts

        # 清理多余换行和空格，保留LaTeX格式
        content_clean = ' '.join(line.strip() for line in content.splitlines())
        explanation_clean = ' '.join(line.strip() for line in explanation.splitlines())

        # 替换 \quad 为 &nbsp
        content_clean = re.sub(r'\\quad', '&nbsp;',  content_clean)
        # 替换 \quad 为 &nbsp
        content_clean = re.sub(r'\\qquad', '&nbsp &nbsp;',  content_clean)
        # 替换 \quad 为 &nbsp
        explanation_clean = re.sub(r'\\quad', '&nbsp;', explanation_clean)
        # 替换 \quad 为 &nbsp
        explanation_clean = re.sub(r'\\qquad', '&nbsp &nbsp;', explanation_clean)

        question_dict = {
            "type": q_type.strip(),
            "topic": topic.strip(),
            "nandu": nandu.strip(),
            "content": content_clean,
            "explanation": explanation_clean
        }

        questions.append(question_dict)
    return questions

def save_to_json(data, json_filename):
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    questions = parse_questions_tex('questions.tex')

    save_to_json(questions, 'questions.json')
    print(f"转换完成，导出 {len(questions)} 道题目到 questions.json")