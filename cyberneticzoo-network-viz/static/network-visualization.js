class NetworkVisualization {
    constructor() {
        this.data = null;
        this.nodes = [];
        this.links = [];
        this.svg = null;
        this.simulation = null;
        this.width = 0;
        this.height = 0;
        this.zoom = null;
        this.activeFilters = new Set();
        this.currentLayout = 'force';
        this.colorScale = this.createColorScale();
        
        this.init();
    }

    async init() {
        this.setupSVG();
        this.setupEventListeners();
        await this.loadData();
        this.createVisualization();
        this.hideLoading();
    }

    setupSVG() {
        const container = document.querySelector('.visualization-container');
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.svg = d3.select('#networkSvg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Create main group for zooming/panning
        this.mainGroup = this.svg.append('g').attr('class', 'main-group');
        
        // Create groups for different elements
        this.linksGroup = this.mainGroup.append('g').attr('class', 'links');
        this.nodesGroup = this.mainGroup.append('g').attr('class', 'nodes');

        // Setup zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.mainGroup.attr('transform', event.transform);
            });

        this.svg.call(this.zoom);

        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupEventListeners() {
        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetView();
        });

        // Layout button
        document.getElementById('layoutBtn').addEventListener('click', () => {
            this.toggleLayout();
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Info panel close button
        document.getElementById('closeInfoBtn').addEventListener('click', () => {
            this.closeInfoPanel();
        });
    }

    async loadData() {
        try {
            const response = await fetch('/api/data');
            this.data = await response.json();
            this.updateStats();
            this.createFilterTags();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data');
        }
    }

    updateStats() {
        if (!this.data.stats) return;
        
        document.getElementById('totalArticles').textContent = this.data.stats.totalArticles;
        document.getElementById('totalTags').textContent = this.data.stats.totalTags;
        document.getElementById('avgConnections').textContent = 
            Math.round(this.data.stats.averageConnections * 10) / 10;
    }

    createFilterTags() {
        const container = document.getElementById('filterTags');
        const tagCounts = {};
        
        // Count occurrences of each tag
        this.data.nodes.forEach(node => {
            node.tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
        });

        // Sort tags by frequency
        const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20); // Limit to top 20 tags

        container.innerHTML = '';
        sortedTags.forEach(([tag, count]) => {
            const tagElement = document.createElement('div');
            tagElement.className = 'filter-tag';
            tagElement.innerHTML = `
                <span>${tag}</span>
                <span class="filter-tag-count">${count}</span>
            `;
            
            tagElement.addEventListener('click', () => {
                this.toggleFilter(tag, tagElement);
            });
            
            container.appendChild(tagElement);
        });
    }

    toggleFilter(tag, element) {
        if (this.activeFilters.has(tag)) {
            this.activeFilters.delete(tag);
            element.classList.remove('active');
        } else {
            this.activeFilters.add(tag);
            element.classList.add('active');
        }
        
        this.updateVisualization();
    }

    createColorScale() {
        const colors = {
            'art': '#64ffda',
            'sculpture': '#ff6b6b', 
            'performance': '#f9ca24',
            'interactive': '#4ecdc4',
            'kinetic': '#45b7d1',
            'electronic': '#a55eea',
            'robots': '#26de81',
            'default': '#95a5a6'
        };

        return (tags) => {
            for (const tag of tags) {
                const lowerTag = tag.toLowerCase();
                for (const [key, color] of Object.entries(colors)) {
                    if (lowerTag.includes(key)) {
                        return color;
                    }
                }
            }
            return colors.default;
        };
    }

    createVisualization() {
        this.processData();
        this.createSimulation();
        this.drawNetwork();
    }

    processData() {
        // Filter nodes based on active filters
        let filteredNodes = this.data.nodes;
        
        if (this.activeFilters.size > 0) {
            filteredNodes = this.data.nodes.filter(node => 
                node.tags.some(tag => this.activeFilters.has(tag))
            );
        }

        this.nodes = filteredNodes.map(node => ({
            ...node,
            x: Math.random() * this.width,
            y: Math.random() * this.height,
            color: this.colorScale(node.tags),
            radius: this.calculateNodeRadius(node)
        }));

        // Create links based on connections
        this.links = [];
        const nodeIds = new Set(this.nodes.map(n => n.id));
        
        this.nodes.forEach(node => {
            node.connections.forEach(connection => {
                if (nodeIds.has(connection.id)) {
                    this.links.push({
                        source: node.id,
                        target: connection.id,
                        strength: connection.strength
                    });
                }
            });
        });

        // Remove duplicate links
        const linkSet = new Set();
        this.links = this.links.filter(link => {
            const key = [link.source, link.target].sort().join('-');
            if (linkSet.has(key)) {
                return false;
            }
            linkSet.add(key);
            return true;
        });
    }

    calculateNodeRadius(node) {
        const baseRadius = 20;
        const connectionBonus = Math.min(node.connections.length * 2, 15);
        return baseRadius + connectionBonus;
    }

    createSimulation() {
        if (this.simulation) {
            this.simulation.stop();
        }

        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links)
                .id(d => d.id)
                .distance(d => 100 + d.strength * 20)
                .strength(0.3)
            )
            .force('charge', d3.forceManyBody()
                .strength(-300)
                .distanceMax(400)
            )
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide()
                .radius(d => d.radius + 5)
                .strength(0.7)
            )
            .on('tick', () => this.updatePositions());
    }

    drawNetwork() {
        // Clear existing elements
        this.linksGroup.selectAll('*').remove();
        this.nodesGroup.selectAll('*').remove();

        // Draw links
        const links = this.linksGroup.selectAll('.link')
            .data(this.links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .style('stroke-opacity', d => Math.min(d.strength / 3, 0.6));

        // Create node groups
        const nodeGroups = this.nodesGroup.selectAll('.node-group')
            .data(this.nodes)
            .enter()
            .append('g')
            .attr('class', 'node-group')
            .call(this.createDragBehavior());

        // Add circular backgrounds for images
        nodeGroups.append('circle')
            .attr('class', 'node-circle')
            .attr('r', d => d.radius)
            .style('fill', d => d.color)
            .style('stroke', '#fff')
            .style('stroke-width', 2)
            .style('opacity', 0.8);

        // Add images with clipping
        nodeGroups.each(function(d) {
            const group = d3.select(this);
            
            // Create clip path for circular image
            const clipId = `clip-${d.id}`;
            group.append('defs')
                .append('clipPath')
                .attr('id', clipId)
                .append('circle')
                .attr('r', d.radius - 3);

            // Add image
            if (d.image) {
                group.append('image')
                    .attr('class', 'node-image')
                    .attr('x', -(d.radius - 3))
                    .attr('y', -(d.radius - 3))
                    .attr('width', (d.radius - 3) * 2)
                    .attr('height', (d.radius - 3) * 2)
                    .attr('href', d.image)
                    .attr('clip-path', `url(#${clipId})`)
                    .style('opacity', 0.9);
            }
        });

        // Add labels
        nodeGroups.append('text')
            .attr('class', 'node-label')
            .attr('y', d => d.radius + 15)
            .text(d => this.truncateText(d.title, 20))
            .style('fill', '#cccccc');

        // Add interactions
        nodeGroups
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip())
            .on('click', (event, d) => this.showNodeInfo(d));

        this.links = links;
        this.nodeGroups = nodeGroups;
    }

    createDragBehavior() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }

    updatePositions() {
        if (this.links) {
            this.links
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
        }

        if (this.nodeGroups) {
            this.nodeGroups
                .attr('transform', d => `translate(${d.x},${d.y})`);
        }
    }

    showTooltip(event, d) {
        const tooltip = document.getElementById('tooltip');
        tooltip.innerHTML = `
            <strong>${d.title}</strong><br>
            <em>Tags: ${d.tags.slice(0, 3).join(', ')}</em><br>
            <small>Connections: ${d.connections.length}</small>
        `;
        tooltip.style.left = (event.pageX + 10) + 'px';
        tooltip.style.top = (event.pageY - 10) + 'px';
        tooltip.classList.add('visible');
    }

    hideTooltip() {
        document.getElementById('tooltip').classList.remove('visible');
    }

    showNodeInfo(node) {
        const panel = document.getElementById('infoPanel');
        const image = document.getElementById('infoImage');
        const title = document.getElementById('infoTitle');
        const tags = document.getElementById('infoTags');
        const excerpt = document.getElementById('infoExcerpt');
        const visitBtn = document.getElementById('visitBtn');

        image.src = node.image || 'https://via.placeholder.com/300x200?text=No+Image';
        image.alt = node.title;
        title.textContent = node.title;
        excerpt.textContent = node.excerpt || 'No description available.';
        visitBtn.href = node.link;

        // Populate tags
        tags.innerHTML = '';
        node.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'info-tag';
            tagElement.textContent = tag;
            tags.appendChild(tagElement);
        });

        panel.classList.add('open');
    }

    closeInfoPanel() {
        document.getElementById('infoPanel').classList.remove('open');
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.highlightNodes(null);
            return;
        }

        const matchingNodes = this.nodes.filter(node =>
            node.title.toLowerCase().includes(query.toLowerCase()) ||
            node.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );

        this.highlightNodes(matchingNodes.map(n => n.id));
    }

    highlightNodes(nodeIds) {
        if (!this.nodeGroups) return;

        this.nodeGroups
            .style('opacity', nodeIds ? 0.3 : 1)
            .filter(d => !nodeIds || nodeIds.includes(d.id))
            .style('opacity', 1);

        if (this.links) {
            this.links
                .style('opacity', nodeIds ? 0.1 : 0.3)
                .filter(d => !nodeIds || 
                    (nodeIds.includes(d.source.id) && nodeIds.includes(d.target.id)))
                .style('opacity', 0.6);
        }
    }

    updateVisualization() {
        this.processData();
        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.links);
        this.drawNetwork();
        this.simulation.alpha(1).restart();
    }

    resetView() {
        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity);
        
        this.activeFilters.clear();
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        
        document.getElementById('searchInput').value = '';
        this.updateVisualization();
    }

    toggleLayout() {
        if (this.currentLayout === 'force') {
            this.applyCircularLayout();
            this.currentLayout = 'circular';
        } else {
            this.applyForceLayout();
            this.currentLayout = 'force';
        }
    }

    applyCircularLayout() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) / 3;

        this.nodes.forEach((node, i) => {
            const angle = (i / this.nodes.length) * 2 * Math.PI;
            node.fx = centerX + radius * Math.cos(angle);
            node.fy = centerY + radius * Math.sin(angle);
        });

        this.simulation.alpha(1).restart();
    }

    applyForceLayout() {
        this.nodes.forEach(node => {
            node.fx = null;
            node.fy = null;
        });

        this.simulation.alpha(1).restart();
    }

    handleResize() {
        const container = document.querySelector('.visualization-container');
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        if (this.simulation) {
            this.simulation
                .force('center', d3.forceCenter(this.width / 2, this.height / 2))
                .alpha(1)
                .restart();
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        loading.style.opacity = '0';
        setTimeout(() => {
            loading.style.display = 'none';
        }, 300);
    }

    showError(message) {
        const loading = document.getElementById('loading');
        loading.innerHTML = `
            <div style="color: #ff6b6b;">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize the visualization when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new NetworkVisualization();
});