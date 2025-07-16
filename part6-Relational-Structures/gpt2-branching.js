import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// 配置transformers.js使用webgpu或wasm
env.allowRemoteModels = true;

const promptInput = document.getElementById('prompt-input');
const generateBtn = document.getElementById('generate-btn');
const candidateArea = document.getElementById('candidate-area');
const treeContainer = document.getElementById('tree-container');

let generator = null;
let currentPrompt = promptInput.value;
let treeData = { name: '', children: [] }; // 根节点
let currentNode = treeData;

// 限制候选数
const MAX_CANDIDATES = 8;
const TOP_P = 0.9;

// 初始化pipeline
async function init() {
  generateBtn.disabled = true;
  generateBtn.textContent = 'Loading Model...';
  generator = await pipeline('text-generation', 'Xenova/distilgpt2');
  generateBtn.disabled = false;
  generateBtn.textContent = 'Generate Next';
}

init();

// 监听输入框变化
promptInput.addEventListener('input', () => {
  currentPrompt = promptInput.value;
  // 重置树
  treeData = { name: '', children: [] };
  currentNode = treeData;
  updateTreeVis();
  candidateArea.innerHTML = '';
});

// 生成下一个token的候选
async function generateCandidates() {
  if (!generator) return;
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  candidateArea.innerHTML = '';

  // 只生成1个新token，top-p采样，返回多个候选
  // transformers.js pipeline不直接返回概率分布，只能用num_return_sequences
  // 但会有重复，需去重
  let results = await generator(currentPrompt, {
    max_new_tokens: 1,
    do_sample: true,
    top_p: TOP_P,
    num_return_sequences: MAX_CANDIDATES * 2, // 多取一些，后面去重
    temperature: 1.0
  });

  // 提取新token（去掉prompt部分），去重
  let promptLen = currentPrompt.split(' ').length;
  let candidates = [];
  let seen = new Set();
  for (let r of results) {
    let text = r.generated_text.trim();
    let next = text.substring(currentPrompt.length).trim().split(' ')[0];
    if (next && !seen.has(next)) {
      seen.add(next);
      candidates.push(next);
    }
    if (candidates.length >= MAX_CANDIDATES) break;
  }

  // 没有候选则禁用
  if (candidates.length === 0) {
    candidateArea.innerHTML = '<span style="color:#888">No candidates found.</span>';
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Next';
    return;
  }

  // 显示候选按钮
  for (let cand of candidates) {
    let btn = document.createElement('button');
    btn.className = 'candidate-btn';
    btn.textContent = cand;
    btn.onclick = () => selectCandidate(cand);
    candidateArea.appendChild(btn);
  }
  generateBtn.disabled = false;
  generateBtn.textContent = 'Generate Next';
}

generateBtn.addEventListener('click', generateCandidates);

// 用户选择候选
function selectCandidate(token) {
  // 更新prompt
  currentPrompt = (currentPrompt + ' ' + token).trim();
  promptInput.value = currentPrompt;
  // 更新树结构
  let newNode = { name: token, children: [] };
  if (!currentNode.children) currentNode.children = [];
  currentNode.children.push(newNode);
  currentNode = newNode;
  updateTreeVis();
  candidateArea.innerHTML = '';
}

// d3树可视化
function updateTreeVis() {
  treeContainer.innerHTML = '';
  const width = treeContainer.offsetWidth || 700;
  const dx = 32, dy = 120;
  const treeLayout = d3.tree().nodeSize([dx, dy]);
  const root = d3.hierarchy(treeData, d => d.children);
  treeLayout(root);
  let x0 = Infinity, x1 = -Infinity;
  root.each(d => {
    if (d.x < x0) x0 = d.x;
    if (d.x > x1) x1 = d.x;
  });
  const svg = d3.select(treeContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', x1 - x0 + dx * 2)
    .style('font', '14px Roboto');
  const g = svg.append('g').attr('transform', `translate(${dy/2},${dx-x0})`);
  // links
  g.append('g')
    .selectAll('path')
    .data(root.links())
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', '#bbb')
    .attr('stroke-width', 2)
    .attr('d', d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x));
  // nodes
  const node = g.append('g')
    .selectAll('g')
    .data(root.descendants())
    .join('g')
    .attr('transform', d => `translate(${d.y},${d.x})`);
  node.append('circle')
    .attr('r', 16)
    .attr('fill', d => d.depth === 0 ? '#eee' : '#3264a8');
  node.append('text')
    .attr('dy', '0.35em')
    .attr('x', 0)
    .attr('text-anchor', 'middle')
    .attr('fill', d => d.depth === 0 ? '#888' : '#fff')
    .text(d => d.depth === 0 ? 'ROOT' : d.data.name);
}

// 初始渲染
updateTreeVis();