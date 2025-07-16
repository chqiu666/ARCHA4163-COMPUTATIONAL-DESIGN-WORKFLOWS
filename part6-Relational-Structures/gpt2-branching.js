import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// 配置transformers.js使用webgpu或wasm
env.allowRemoteModels = true;

const promptInput = document.getElementById('prompt-input');
const generateBtn = document.getElementById('generate-btn');
const candidateArea = document.getElementById('candidate-area');
const treeContainer = document.getElementById('tree-container');

let generator = null;
let currentPrompt = promptInput.value;
let treeData = null; // 树根节点为初始prompt
let currentNode = null; // 当前分支末端节点
let path = []; // 记录被选中分支的索引路径

// 限制候选数
const MAX_CANDIDATES = 8;
const TOP_P = 0.98; // 增大阈值，提升多样性

// 初始化pipeline
async function init() {
  generateBtn.disabled = true;
  generateBtn.textContent = 'Loading Model...';
  generator = await pipeline('text-generation', 'Xenova/distilgpt2');
  generateBtn.disabled = false;
  generateBtn.textContent = 'Generate Next';
}

init();

// 重置树结构
function resetTree() {
  treeData = {
    name: promptInput.value.trim(),
    children: [],
    isRoot: true,
    selected: true // 根节点总是选中
  };
  currentNode = treeData;
  path = [];
  updateTreeVis();
  candidateArea.innerHTML = '';
}

// 监听输入框变化
promptInput.addEventListener('input', () => {
  currentPrompt = promptInput.value;
  resetTree();
});

// 页面加载时初始化树
resetTree();

// 生成下一个token的候选
async function generateCandidates() {
  if (!generator) return;
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  candidateArea.innerHTML = '';

  let results = await generator(currentPrompt, {
    max_new_tokens: 1,
    do_sample: true,
    top_p: TOP_P,
    num_return_sequences: MAX_CANDIDATES * 3, // 多取，去重
    temperature: 1.0
  });

  // 提取新token，去重
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

  if (candidates.length === 0) {
    candidateArea.innerHTML = '<span style="color:#888">No candidates found. Try a different prompt or increase top-p.</span>';
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate Next';
    return;
  }

  // 构建所有分支节点，全部加入树，后续只在选中分支继续生长
  currentNode.children = candidates.map((cand, idx) => ({
    name: cand,
    children: [],
    selected: false,
    parent: currentNode,
    candidateIndex: idx
  }));
  updateTreeVis();

  // 显示候选按钮
  candidateArea.innerHTML = '';
  candidates.forEach((cand, idx) => {
    let btn = document.createElement('button');
    btn.className = 'candidate-btn';
    btn.textContent = cand;
    btn.onclick = () => selectCandidate(idx);
    candidateArea.appendChild(btn);
  });
  generateBtn.disabled = false;
  generateBtn.textContent = 'Generate Next';
}

generateBtn.addEventListener('click', generateCandidates);

// 用户选择候选分支
function selectCandidate(idx) {
  // 标记选中分支
  currentNode.children.forEach((child, i) => {
    child.selected = (i === idx);
  });
  // 记录路径
  path.push(idx);
  // 更新prompt
  let selectedNode = currentNode.children[idx];
  currentPrompt = (currentPrompt + ' ' + selectedNode.name).trim();
  promptInput.value = currentPrompt;
  // 后续只在选中分支继续生长
  currentNode = selectedNode;
  updateTreeVis();
  candidateArea.innerHTML = '';
}

// d3树可视化，所有分支都显示，选中路径高亮
function updateTreeVis() {
  treeContainer.innerHTML = '';
  if (!treeData) return;
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

  // 计算高亮路径
  let highlightNodes = new Set();
  let highlightLinks = new Set();
  let node = root;
  highlightNodes.add(node.data);
  for (let idx of path) {
    if (!node.children || !node.children[idx]) break;
    highlightLinks.add(node.children[idx]);
    node = node.children[idx];
    highlightNodes.add(node.data);
  }

  // links
  g.append('g')
    .selectAll('path')
    .data(root.links())
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', d => highlightLinks.has(d.target) ? '#3264a8' : '#bbb')
    .attr('stroke-width', d => highlightLinks.has(d.target) ? 3 : 2)
    .attr('d', d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x));
  // nodes
  const nodeSel = g.append('g')
    .selectAll('g')
    .data(root.descendants())
    .join('g')
    .attr('transform', d => `translate(${d.y},${d.x})`);
  nodeSel.append('circle')
    .attr('r', 16)
    .attr('fill', d => highlightNodes.has(d.data) ? '#3264a8' : (d.data.isRoot ? '#eee' : '#fff'))
    .attr('stroke', d => highlightNodes.has(d.data) ? '#3264a8' : '#bbb')
    .attr('stroke-width', d => highlightNodes.has(d.data) ? 3 : 1.5);
  nodeSel.append('text')
    .attr('dy', '0.35em')
    .attr('x', 0)
    .attr('text-anchor', 'middle')
    .attr('fill', d => highlightNodes.has(d.data) ? '#fff' : (d.data.isRoot ? '#888' : '#3264a8'))
    .text(d => d.data.name);
}