/*
 * script.js
 *
 * This file defines the data structures for key works in robotic and
 * algorithmic art, as well as the categories that frame them. It also
 * implements two visualisations using D3.js: a vertical timeline and a
 * force‑directed network graph. Navigation buttons allow the user to
 * switch between views. Tooltips provide additional context for each
 * work.
 */

// Data definitions for categories and timeline branches
const categories = [
  { id: 'cyberkinetic', name: 'Cybernetic & Kinetic', color: '#E54B4B' },
  { id: 'interactive', name: 'Interactive & Participatory', color: '#006699' },
  { id: 'augmentation', name: 'Body & Augmentation', color: '#8E44AD' },
  { id: 'prediction', name: 'Behaviour Prediction & Voice', color: '#F39C12' },
  { id: 'telepresence', name: 'Telepresence & Remote', color: '#16A085' },
  { id: 'sociopolitical', name: 'Sociopolitical Critique', color: '#D35400' },
  { id: 'cocreative', name: 'Co‑creative Painting & Calligraphy', color: '#2980B9' }
];

/*
 * Branch definitions for the multi‑column timeline.
 * Each branch represents one of the three principal trajectories in
 * robotic art identified in Eduardo Kac’s analysis: (1) remote control
 * & telepresence, (2) organic–inorganic hybrids and body
 * augmentation, and (3) behavioural autonomy & algorithmic
 * prediction. Works are assigned to branches by their conceptual
 * affinity. The timeline visualisation will draw one column per
 * branch and align works vertically by year.
 */
const branchesTimeline = [
  {
    id: 'remote',
    name: 'Remote control & Telepresence',
    color: categories.find((c) => c.id === 'telepresence').color,
    workIds: ['robot_k456', 'telephonic_arm_wrestling', 'telegarden']
  },
  {
    id: 'hybrid',
    name: 'Organic–Inorganic & Augmentation',
    color: categories.find((c) => c.id === 'augmentation').color,
    workIds: ['squat', 'third_hand']
  },
  {
    id: 'autonomy',
    name: 'Behavioural Autonomy & Prediction',
    color: categories.find((c) => c.id === 'prediction').color,
    workIds: [
      'senster',
      'seek',
      'helpless_robot',
      'cant_help_myself',
      'crack_hourglass',
      'all_the_waters',
      'assembly_lines',
      'frida'
    ]
  }
];

// Key works in robotic/algorithmic art. Each entry contains
// identifiers for categories, a brief description drawn from
// research, and citations for reference (these citations are not
// rendered on the page but can be used to trace the information back
// to its source).
const works = [
  {
    id: 'remote_control_painting',
    year: 1955,
    title: 'Remote‑control Painting',
    artist: 'Akira Kanayama',
    categories: ['cyberkinetic'],
    description:
      'An early electro‑mechanical process to create a painting via remote control, detaching the artist’s hand from the work and paving the way for robotic art.',
    citation: '【614287713600225†L26-L37】'
  },
  {
    id: 'cysp1',
    year: 1956,
    title: 'CYSP 1',
    artist: 'Nicolas Schöffer',
    categories: ['cyberkinetic'],
    description:
      'The first cybernetic spatiodynamic sculpture. Four motorized rollers and an electronic brain allowed it to respond autonomously to light, sound and movement, making it a landmark of cybernetic art.',
    citation: '【614287713600225†L44-L51】'
  },
  {
    id: 'robot_k456',
    year: 1964,
    title: 'Robot K‑456',
    artist: 'Nam June Paik & Shuya Abe',
    categories: ['interactive'],
    description:
      'A 20‑channel radio‑controlled anthropomorphic robot that performed on stage and on city streets, playing recordings and even scattering beans — an early exploration of robot performance art.',
    citation: '【451704598799977†L31-L54】'
  },
  {
    id: 'squat',
    year: 1966,
    title: 'Squat',
    artist: 'Tom Shannon',
    categories: ['interactive'],
    description:
      'An interactive robotic sculpture responsive to touch. Created by 19‑year‑old Tom Shannon, it became a seminal work in interactive sculpture and was exhibited at MoMA’s 1969 “The Machine as Seen at the End of the Mechanical Age”.',
    citation: '【284650057461259†L171-L179】'
  },
  {
    id: 'senster',
    year: 1970,
    title: 'The Senster',
    artist: 'Edward Ihnatowicz',
    categories: ['cyberkinetic'],
    description:
      'A 15‑foot hydraulic robotic creature commissioned by Philips. The first large‑scale computer‑controlled interactive sculpture, it used microphones and Doppler radar to sense sounds and movement, approaching moderate sounds and retreating from loud noises.',
    citation: '【709255236468950†L50-L87】'
  },
  {
    id: 'seek',
    year: 1970,
    title: 'SEEK',
    artist: 'Nicholas Negroponte & MIT Architecture Machine Group',
    categories: ['prediction'],
    description:
      'An experimental cybernetic installation where a robotic arm rearranged zinc‑plated cubes inside a plexiglass enclosure inhabited by gerbils. The machine attempted to maintain order despite unpredictable animal behaviour, questioning whether prediction is a service to its occupants or a means to impose its own logic.',
    citation: '【409354422715817†L20-L47】'
  },
  {
    id: 'third_hand',
    year: 1980,
    title: 'Third Hand',
    artist: 'Stelarc',
    categories: ['augmentation'],
    description:
      'A mechanical hand attached to the artist’s arm and controlled by electromyograph signals. Stelarc used it to explore body augmentation and the obsolescence of the human body, pioneering the notion of cybernetic extensions.',
    citation: '【452034515296378†L23-L34】'
  },
  {
    id: 'telephonic_arm_wrestling',
    year: 1986,
    title: 'Telephonic Arm Wrestling',
    artist: 'Norman White & Doug Back',
    categories: ['telepresence'],
    description:
      'An early telepresence artwork enabling people in different cities to arm‑wrestle via motorised systems connected through a telephone data link. It demonstrated how telecommunications could mediate physical interaction.',
    citation: '【573554427925503†L166-L174】'
  },
  {
    id: 'helpless_robot',
    year: 1987,
    title: 'The Helpless Robot',
    artist: 'Norman White',
    categories: ['prediction'],
    description:
      'A voice‑controlled robot with no motors. It entices visitors to move it by speaking in polite or harsh tones, attempting to assess and predict human behaviour. The piece exposes the tension between machine intention and human free will.',
    citation: '【93748040652726†L136-L143】'
  },
  {
    id: 'telegarden',
    year: 1995,
    title: 'Telegarden',
    artist: 'Ken Goldberg, Joseph Santarromana et al.',
    categories: ['telepresence'],
    description:
      'An internet‑connected garden tended by a SCARA robot arm that allowed online participants to plant, water and nurture seeds. Over nine years, more than 100,000 people collaborated through the web to cultivate living plants, making it a pioneering tele‑robotics installation.',
    citation: '【790596884711642†L21-L82】'
  },
  {
    id: 'cant_help_myself',
    year: 2016,
    title: "Can't Help Myself",
    artist: 'Sun Yuan & Peng Yu',
    categories: ['sociopolitical'],
    description:
      'A KUKA industrial robot attempts to contain a puddle of thick red fluid within a marked area. Equipped with cameras and sensors, it performs cleaning gestures and 32 pre‑programmed dances when idle. Commissioned by the Guggenheim, the work addresses surveillance, labour and border control.',
    citation: '【242132901409466†L141-L204】'
  },
  {
    id: 'all_the_waters',
    year: 2022,
    title: 'All the Waters',
    artist: 'Rafael Lozano‑Hemmer',
    categories: ['cocreative'],
    description:
      'A robot arm with a Japanese brush writes names of bottled waters on a heated corten steel plate. The water evaporates as new words are drawn, referencing the commodification and ephemerality of water resources.',
    citation: '【719989900268207†L453-L459】'
  },
  {
    id: 'crack_hourglass',
    year: 2020,
    title: 'A Crack in the Hourglass',
    artist: 'Rafael Lozano‑Hemmer',
    categories: ['sociopolitical'],
    description:
      'An ongoing memorial to victims of COVID‑19 in which a robotic plotter deposits grains of hourglass sand onto a black surface to recreate submitted portraits. The drawing slowly dissipates, symbolising impermanence and collective memory.',
    citation: '【719989900268207†L541-L551】'
  },
  {
    id: 'assembly_lines',
    year: 2023,
    title: 'Assembly Lines',
    artist: 'Sougwen Chung',
    categories: ['cocreative', 'augmentation'],
    description:
      'A kinetic installation where the artist co‑creates large paintings with a custom multi‑robotic system (D.O.U.G._5). EEG biosensors synchronise the robots to the artist’s brainwaves, resulting in meditative, improvisational brushstrokes that challenge industrial automation.',
    citation: '【165487452767662†L92-L116】'
  },
  {
    id: 'frida',
    year: 2023,
    title: 'FRIDA',
    artist: 'Carnegie Mellon University Bot Intelligence Group',
    categories: ['cocreative'],
    description:
      'A collaborative robotic painting system that uses AI models to plan brushstrokes. Users provide text prompts, images or other inputs, and FRIDA simulates and executes impressionistic paintings. It emphasises human creativity while leveraging machine learning for physical art making.',
    citation: '【901941762730077†L272-L306】'
  }
];

// Influence edges between works (for the network graph). Each entry
// represents a directed relationship where an earlier work conceptually
// influences a later one. These connections are illustrative rather
// than exhaustive.
const influences = [
  { source: 'remote_control_painting', target: 'cysp1' },
  { source: 'cysp1', target: 'senster' },
  { source: 'senster', target: 'seek' },
  { source: 'seek', target: 'cant_help_myself' },
  { source: 'third_hand', target: 'assembly_lines' },
  { source: 'helpless_robot', target: 'assembly_lines' },
  { source: 'telegarden', target: 'assembly_lines' },
  { source: 'cant_help_myself', target: 'all_the_waters' },
  { source: 'all_the_waters', target: 'assembly_lines' },
  { source: 'assembly_lines', target: 'frida' }
];

// Once the DOM is loaded, render both visualisations and wire up
// navigation buttons.
document.addEventListener('DOMContentLoaded', () => {
  renderTimeline();
  renderNetwork();

  // Navigation logic
  const btnTimeline = document.getElementById('btnTimeline');
  const btnNetwork = document.getElementById('btnNetwork');
  const timelineSection = document.getElementById('timelineSection');
  const networkSection = document.getElementById('networkSection');

  btnTimeline.addEventListener('click', () => {
    btnTimeline.classList.add('active');
    btnNetwork.classList.remove('active');
    timelineSection.classList.remove('hidden');
    networkSection.classList.add('hidden');
  });
  btnNetwork.addEventListener('click', () => {
    btnNetwork.classList.add('active');
    btnTimeline.classList.remove('active');
    networkSection.classList.remove('hidden');
    timelineSection.classList.add('hidden');
    // On first activation you may want to reheat the simulation
    restartNetworkSimulation();
  });
});

/**
 * Render a vertical timeline of the works. Circles are placed along
 * a y‑axis scaled to the range of years. Hovering reveals a tooltip
 * describing the work and its context.
 */
function renderTimeline() {
  const container = document.getElementById('timeline');
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 600;
  // Remove any previous svg
  d3.select('#timeline').selectAll('*').remove();
  const svg = d3
    .select('#timeline')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Compute a band scale for evenly spaced entries regardless of
  // clustering by year. This avoids label overlap when multiple
  // works occur in nearby years. Each entry gets a unique row.
  const sorted = works.slice().sort((a, b) => a.year - b.year);
  const yScale = d3
    .scaleBand()
    .domain(d3.range(sorted.length))
    .range([20, height - 20])
    .padding(0.2);

  // Draw vertical axis line
  // Position the timeline axis in the middle of the available width so
  // that labels to the left and right have equal room. This improves
  // readability on wide screens and prevents labels from being cut off.
  const axisX = width / 2;
  svg
    .append('line')
    .attr('x1', axisX)
    .attr('x2', axisX)
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', '#ccc')
    .attr('stroke-width', 1);

  // Tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // Plot each work as a node on the timeline. Alternate labels left
  // and right of the axis to reduce overlap. Use the index from the
  // sorted array to position each entry.
  svg
    .selectAll('g.event')
    .data(sorted)
    .enter()
    .append('g')
    .attr('class', 'event')
    .attr('transform', (d, i) => `translate(0, ${yScale(i)})`)
    .each(function (d, i) {
      const g = d3.select(this);
      // Determine horizontal offset for alternating sides
      const isLeft = i % 2 === 0;
      const xOffset = isLeft ? -200 : 30;
      const lineLength = isLeft ? -20 : 20;
      // Line connector
      g.append('line')
        .attr('x1', axisX)
        .attr('x2', axisX + lineLength)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', '#888');
      // Circle at axis
      g.append('circle')
        .attr('cx', axisX)
        .attr('cy', 0)
        .attr('r', 5)
        .attr('fill', getCategoryColor(d.categories[0]));
      // Text label positioned left or right
      g.append('text')
        .attr('x', axisX + lineLength + (isLeft ? -10 : 10))
        .attr('y', 4)
        .attr('class', 'label')
        .style('text-anchor', isLeft ? 'end' : 'start')
        .text(`${d.year} – ${d.title}`)
        .style('font-size', '0.8rem')
        .style('fill', '#111');
      // Hover interactions
      g.on('mouseover', (event) => {
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d.title}</strong><br/>` +
              `<em>${d.artist}</em><br/>` +
              `<span>${d.description}</span>`
          );
        positionTooltip(event);
      });
      g.on('mousemove', positionTooltip);
      g.on('mouseout', () => {
        tooltip.style('opacity', 0);
      });
    });

  function positionTooltip(event) {
    tooltip
      .style('left', event.pageX + 15 + 'px')
      .style('top', event.pageY + 15 + 'px');
  }
}

/**
 * Render a force‑directed network connecting works to their categories
 * and to one another via influence links. Nodes representing works are
 * coloured according to their primary category, while category nodes
 * use a neutral hue. Hovering reveals information about each node.
 */
let networkSimulation; // keep a handle to restart on view change
function renderNetwork() {
  const container = document.getElementById('network');
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 600;
  d3.select('#network').selectAll('*').remove();
  const svg = d3
    .select('#network')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Build nodes array: categories + works
  const nodeMap = new Map();
  const nodes = [];
  categories.forEach((cat) => {
    const node = { id: cat.id, type: 'category', name: cat.name, color: '#aaa' };
    nodes.push(node);
    nodeMap.set(cat.id, node);
  });
  works.forEach((work) => {
    const node = {
      id: work.id,
      type: 'work',
      name: work.title,
      year: work.year,
      artist: work.artist,
      description: work.description,
      categories: work.categories,
      color: getCategoryColor(work.categories[0])
    };
    nodes.push(node);
    nodeMap.set(work.id, node);
  });

  // Build links: works to categories and influences
  const links = [];
  works.forEach((work) => {
    work.categories.forEach((catId) => {
      links.push({ source: work.id, target: catId, type: 'belongs' });
    });
  });
  influences.forEach((inf) => {
    links.push({ source: inf.source, target: inf.target, type: 'influence' });
  });

  // Tooltip
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  // Simulation
  networkSimulation = d3
    .forceSimulation(nodes)
    .force(
      'link',
      d3
        .forceLink(links)
        .id((d) => d.id)
        .distance((d) => (d.type === 'belongs' ? 80 : 120))
        .strength(0.5)
    )
    .force('charge', d3.forceManyBody().strength(-300))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(40));

  // Draw links
  const link = svg
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(links)
    .enter()
    .append('line')
    .attr('stroke', (d) => (d.type === 'belongs' ? '#ccc' : '#999'))
    .attr('stroke-width', (d) => (d.type === 'belongs' ? 1 : 1.5))
    .attr('stroke-dasharray', (d) => (d.type === 'belongs' ? '2,2' : ''));

  // Draw nodes
  const node = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(nodes)
    .enter()
    .append('circle')
    .attr('r', (d) => (d.type === 'category' ? 10 : 8))
    .attr('fill', (d) => (d.type === 'category' ? '#666' : d.color))
    .call(
      d3
        .drag()
        .on('start', (event, d) => {
          if (!event.active) networkSimulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) networkSimulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

  // Node labels
  const label = svg
    .append('g')
    .attr('class', 'labels')
    .selectAll('text')
    .data(nodes)
    .enter()
    .append('text')
    .text((d) => (d.type === 'category' ? d.name : d.name))
    .style('font-size', (d) => (d.type === 'category' ? '0.8rem' : '0.7rem'))
    .style('fill', '#333')
    .style('text-anchor', 'middle');

  // Hover interactions
  node
    .on('mouseover', (event, d) => {
      if (d.type === 'work') {
        tooltip
          .style('opacity', 1)
          .html(
            `<strong>${d.name}</strong><br/>` +
              `<em>${d.artist}</em><br/>` +
              `<span>${d.description}</span>`
          );
        positionTooltip(event);
      }
    })
    .on('mousemove', positionTooltip)
    .on('mouseout', () => {
      tooltip.style('opacity', 0);
    });

  networkSimulation.on('tick', () => {
    link
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y);

    node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    label.attr('x', (d) => d.x).attr('y', (d) => d.y - 12);
  });

  function positionTooltip(event) {
    tooltip
      .style('left', event.pageX + 15 + 'px')
      .style('top', event.pageY + 15 + 'px');
  }
}

// Reheat the network simulation when the network view becomes active.
function restartNetworkSimulation() {
  if (networkSimulation) {
    networkSimulation.alpha(0.5).restart();
  }
}

// Helper: get the colour associated with a category id
function getCategoryColor(catId) {
  const cat = categories.find((c) => c.id === catId);
  return cat ? cat.color : '#333';
}

/*
 * Override the default timeline renderer with a multi‑column
 * branching timeline. This version organises works into three
 * conceptual trajectories (branches) and aligns entries
 * vertically by year. Each column shows a clear, separate
 * development path while allowing viewers to compare chronology
 * across branches.
 */
function renderTimeline() {
  const container = document.getElementById('timeline');
  const width = container.clientWidth || 600;
  const height = container.clientHeight || 600;
  // Clear previous content
  d3.select('#timeline').selectAll('*').remove();
  const svg = d3
    .select('#timeline')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  // Collect years for scaling
  const years = [];
  branchesTimeline.forEach((branch) => {
    branch.workIds.forEach((id) => {
      const w = works.find((item) => item.id === id);
      if (w) years.push(w.year);
    });
  });
  const minYear = d3.min(years);
  const maxYear = d3.max(years);
  const topMargin = 50;
  const bottomMargin = 40;
  const yScale = d3
    .scaleLinear()
    .domain([maxYear, minYear])
    .range([topMargin, height - bottomMargin]);

  const branchCount = branchesTimeline.length;
  const colWidth = width / branchCount;

  // Tooltip for descriptions
  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

  branchesTimeline.forEach((branch, idx) => {
    const xCenter = colWidth * idx + colWidth / 2;
    // Column heading
    svg
      .append('text')
      .attr('x', xCenter)
      .attr('y', topMargin - 25)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
      .style('font-size', '0.85rem')
      .text(branch.name);
    // Guideline
    svg
      .append('line')
      .attr('x1', xCenter)
      .attr('x2', xCenter)
      .attr('y1', topMargin)
      .attr('y2', height - bottomMargin)
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1);
    // Prepare vertical offsets for years with multiple events within this branch
    const yearCounts = {};
    branch.workIds.forEach((wid) => {
      const w = works.find((it) => it.id === wid);
      if (w) {
        yearCounts[w.year] = (yearCounts[w.year] || 0) + 1;
      }
    });
    const yearOffsets = {};
    Object.keys(yearCounts).forEach((yr) => {
      const count = yearCounts[yr];
      const offsets = [];
      const spacing = 12;
      if (count === 1) offsets.push(0);
      else {
        const total = (count - 1) * spacing;
        for (let i = 0; i < count; i++) {
          offsets.push(-total / 2 + i * spacing);
        }
      }
      yearOffsets[yr] = offsets;
    });
    const yearUseIndex = {};
    branch.workIds.forEach((wid) => {
      const d = works.find((w) => w.id === wid);
      if (!d) return;
      const baseY = yScale(d.year);
      yearUseIndex[d.year] = (yearUseIndex[d.year] || 0) + 1;
      const offsList = yearOffsets[d.year] || [0];
      const offIndex = yearUseIndex[d.year] - 1;
      const y = baseY + offsList[offIndex];
      // Horizontal tick on outer columns
      const tickLength = 40;
      let x2 = xCenter;
      if (idx === 0) x2 = xCenter + tickLength;
      else if (idx === branchCount - 1) x2 = xCenter - tickLength;
      svg
        .append('line')
        .attr('x1', xCenter)
        .attr('x2', x2)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', '#aaa')
        .attr('stroke-dasharray', '2,2');
      // Marker circle
      svg
        .append('circle')
        .attr('cx', xCenter)
        .attr('cy', y)
        .attr('r', 5)
        .attr('fill', branch.color)
        .on('mouseover', (event) => {
          tooltip
            .style('opacity', 1)
            .html(
              `<strong>${d.title} (${d.year})</strong><br/><em>${d.artist}</em><br/>${d.description}`
            )
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 30 + 'px');
        })
        .on('mousemove', (event) => {
          tooltip
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 30 + 'px');
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0);
        });
      // Label position and anchor
      const anchor = idx === 0 ? 'start' : idx === branchCount - 1 ? 'end' : 'middle';
      const labelOffset = 45;
      const lx = idx === 0 ? xCenter + labelOffset : idx === branchCount - 1 ? xCenter - labelOffset : xCenter;
      svg
        .append('text')
        .attr('x', lx)
        .attr('y', y)
        .attr('text-anchor', anchor)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '0.75rem')
        .text(`${d.year} – ${d.title}`);
    });
  });
}