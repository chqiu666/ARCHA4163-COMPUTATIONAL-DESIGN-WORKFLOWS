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
const TOP_P = 0.99; // 更高阈值，提升多样性
const TEMPERATURE = 1.2; // 更高温度，提升多样性

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

  // 采样参数大幅提升，允许短语作为候选
  let results = await generator(currentPrompt, {
    max_new_tokens: 1,
    do_sample: true,
    top_p: TOP_P,
    num_return_sequences: MAX_CANDIDATES * 8, // 极大提升采样数量
    temperature: TEMPERATURE
  });

  // 提取新token（允许短语），去重
  let candidates = [];
  let seen = new Set();
  for (let r of results) {
    let text = r.generated_text.trim();
    let next = text.substring(currentPrompt.length).replace(/^\s+/, '');
    // 允许短语（如标点、多个token），但去除空
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

// d3树可视化，节点为小圆点，文本在右侧水平排列，长文本不截断
function updateTreeVis() {
  treeContainer.innerHTML = '';
  if (!treeData) return;
  const width = treeContainer.offsetWidth || 700;
  const dx = 48, dy = 180;
  const treeLayout = d3.tree().nodeSize([dx, dy]);
  const root = d3.hierarchy(treeData, d => d.children);
  treeLayout(root);
  let x0 = Infinity, x1 = -Infinity;
  root.each(d => {
    if (d.x < x0) x0 = d.x;
    if (d.x > x1) x1 = d.x;
  });
  const height = x1 - x0 + dx * 2;
  const svg = d3.select(treeContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('font', '15px Roboto');
  const g = svg.append('g');

  // 统一zoom变换
  function zoomed(event) {
    g.attr('transform', event.transform);
  }
  const initialTransform = d3.zoomIdentity.translate(dy/2, dx-x0);
  svg.call(d3.zoom()
    .scaleExtent([0.3, 2])
    .on('zoom', zoomed)
  ).call('zoom', initialTransform);
  g.attr('transform', initialTransform);

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

  // links 动画
  const linkSel = g.selectAll('path.link')
    .data(root.links(), d => d.target.data.name + d.source.data.name);
  linkSel.enter()
    .append('path')
    .attr('class', 'link')
    .attr('fill', 'none')
    .attr('stroke', d => highlightLinks.has(d.target) ? '#3264a8' : '#bbb')
    .attr('stroke-width', d => highlightLinks.has(d.target) ? 3 : 2)
    .attr('d', d => {
      // 初始动画：起点和终点重合
      const o = {x: d.source.x, y: d.source.y};
      return d3.linkHorizontal()({source: o, target: o});
    })
    .transition().duration(500)
    .attr('d', d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x));
  linkSel.transition().duration(500)
    .attr('stroke', d => highlightLinks.has(d.target) ? '#3264a8' : '#bbb')
    .attr('stroke-width', d => highlightLinks.has(d.target) ? 3 : 2)
    .attr('d', d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x));
  linkSel.exit().transition().duration(300).style('opacity',0).remove();

  // nodes 动画
  const nodeSel = g.selectAll('g.node')
    .data(root.descendants(), d => d.data.name + d.depth);
  const nodeEnter = nodeSel.enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', d => `translate(${d.y},${d.x})`)
    .style('opacity',0);
  nodeEnter.transition().duration(500).style('opacity',1);
  nodeSel.transition().duration(500)
    .attr('transform', d => `translate(${d.y},${d.x})`);
  nodeSel.exit().transition().duration(300).style('opacity',0).remove();

  nodeEnter.append('text')
    .attr('text-anchor', 'middle')
    .attr('x', 0)
    .attr('y', -16)
    .attr('fill', d => highlightNodes.has(d.data) ? '#3264a8' : (d.data.isRoot ? '#888' : '#222'))
    .text(d => d.data.name)
    .style('font-weight', d => highlightNodes.has(d.data) ? 700 : 400)
    .style('paint-order', 'stroke')
    .style('stroke', '#fff')
    .style('stroke-width', 3)
    .style('stroke-opacity', 0.7)
    .style('font-size', '15px');
  nodeEnter.append('circle')
    .attr('r', 0)
    .attr('fill', d => highlightNodes.has(d.data) ? '#3264a8' : (d.data.isRoot ? '#eee' : '#fff'))
    .attr('stroke', d => highlightNodes.has(d.data) ? '#3264a8' : '#bbb')
    .attr('stroke-width', d => highlightNodes.has(d.data) ? 3 : 1.5)
    .transition().duration(500)
    .attr('r', 8);
  nodeSel.select('text')
    .transition().duration(500)
    .attr('fill', d => highlightNodes.has(d.data) ? '#3264a8' : (d.data.isRoot ? '#888' : '#222'));
  nodeSel.select('circle')
    .transition().duration(500)
    .attr('fill', d => highlightNodes.has(d.data) ? '#3264a8' : (d.data.isRoot ? '#eee' : '#fff'))
    .attr('stroke', d => highlightNodes.has(d.data) ? '#3264a8' : '#bbb')
    .attr('stroke-width', d => highlightNodes.has(d.data) ? 3 : 1.5);
}