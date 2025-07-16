import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

// 配置transformers.js使用webgpu或wasm
env.allowRemoteModels = true;

const promptInput = document.getElementById('prompt-input');
const generateBtn = document.getElementById('generate-btn');
const candidateArea = document.getElementById('candidate-area');
const treeContainer = document.getElementById('tree-container');

let generator = null;
let currentPrompt = promptInput.value;
let nodes = [];
let links = [];
let nodeId = 0;
let rootNode = null;
let currentNode = null;
let path = [];
let simulation = null;

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
function resetGraph() {
  nodes = [];
  links = [];
  nodeId = 0;
  const prompt = promptInput.value.trim();
  rootNode = { id: nodeId++, name: prompt, isRoot: true, selected: true, parent: null, x: 400, y: 250 };
  nodes.push(rootNode);
  currentNode = rootNode;
  path = [rootNode.id];
  updateGraphVis();
  candidateArea.innerHTML = '';
}

// 监听输入框变化
promptInput.addEventListener('input', () => {
  currentPrompt = promptInput.value;
  resetGraph();
});

// 页面加载时初始化树
resetGraph();

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

  // 为每个候选添加节点和连线
  let candidateNodes = candidates.map((cand, idx) => {
    // 新节点初始坐标与父节点一致，避免瞬移
    const n = { id: nodeId++, name: cand, selected: false, parent: currentNode.id, x: currentNode.x, y: currentNode.y };
    nodes.push(n);
    links.push({ source: currentNode.id, target: n.id });
    return n;
  });
  updateGraphVis();

  // 显示候选按钮
  candidateArea.innerHTML = '';
  candidates.forEach((cand, idx) => {
    let btn = document.createElement('button');
    btn.className = 'candidate-btn';
    btn.textContent = cand;
    btn.onclick = () => selectCandidate(candidateNodes[idx]);
    candidateArea.appendChild(btn);
  });
  generateBtn.disabled = false;
  generateBtn.textContent = 'Generate Next';
}

generateBtn.addEventListener('click', generateCandidates);

// 用户选择候选分支
function selectCandidate(node) {
  // 标记路径
  path.push(node.id);
  // 标记选中
  nodes.forEach(n => n.selected = false);
  node.selected = true;
  // 更新prompt
  currentPrompt = (currentPrompt + ' ' + node.name).trim();
  promptInput.value = currentPrompt;
  currentNode = node;
  updateGraphVis();
  candidateArea.innerHTML = '';
}

// d3树可视化，节点为小圆点，文本在右侧水平排列，长文本不截断
function updateGraphVis() {
  treeContainer.innerHTML = '';
  const width = treeContainer.offsetWidth || 800;
  const height = 500;
  const svg = d3.select(treeContainer)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', '#f8f9fa');
  const g = svg.append('g');

  // 画布缩放/平移
  const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on('zoom', (event) => {
      g.attr('transform', event.transform);
    });
  svg.call(zoom);
  svg.append('text')
    .attr('x', 10)
    .attr('y', 20)
    .attr('font-size', '12px')
    .attr('fill', '#666')
    .text('Use mouse wheel to zoom, drag to pan, drag nodes to move');

  // simulation只初始化一次
  if (!simulation) {
    simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(90))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(24));
  } else {
    simulation.nodes(nodes);
    simulation.force('link').links(links);
  }
  simulation.alpha(1).restart();

  // 连线
  const link = g.append('g')
    .attr('stroke', '#bbb')
    .attr('stroke-width', 2)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', d => {
      // 高亮路径
      return path.includes(d.target) && path.includes(d.source) ? '#3264a8' : '#bbb';
    })
    .attr('stroke-width', d => path.includes(d.target) && path.includes(d.source) ? 3 : 2);

  // 节点
  const node = g.append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 18)
    .attr('fill', d => d.selected || d.isRoot || path.includes(d.id) ? '#3264a8' : '#fff')
    .attr('stroke', d => d.selected || d.isRoot || path.includes(d.id) ? '#3264a8' : '#bbb')
    .attr('stroke-width', d => d.selected || d.isRoot || path.includes(d.id) ? 3 : 1.5)
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended)
    );

  // 节点文本
  const label = g.append('g')
    .selectAll('text')
    .data(nodes)
    .join('text')
    .attr('text-anchor', 'middle')
    .attr('y', -24)
    .attr('font-size', 15)
    .attr('fill', d => d.selected || d.isRoot || path.includes(d.id) ? '#3264a8' : '#222')
    .style('font-weight', d => d.selected || d.isRoot || path.includes(d.id) ? 700 : 400)
    .text(d => d.name);

  simulation.on('tick', () => {
    link
      .attr('x1', d => getNodeById(d.source).x)
      .attr('y1', d => getNodeById(d.source).y)
      .attr('x2', d => getNodeById(d.target).x)
      .attr('y2', d => getNodeById(d.target).y);
    node
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
    label
      .attr('x', d => d.x)
      .attr('y', d => d.y - 24);
  });

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  function getNodeById(id) {
    return typeof id === 'object' ? id : nodes.find(n => n.id === id);
  }
}