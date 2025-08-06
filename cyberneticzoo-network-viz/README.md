# Cybernetic Zoo Network Visualization

An interactive network visualization of robotic art projects from [cyberneticzoo.com](https://cyberneticzoo.com/category/robots-in-art/). This project creates a beautiful, dark-themed web interface that displays articles as connected nodes with thumbnails, allowing users to explore relationships between different robotic art projects.

## Features

- **Interactive Network Graph**: Articles represented as nodes with thumbnail images
- **Smart Categorization**: Automatic tagging based on content analysis
- **Dark Theme UI**: Modern, cyberpunk-inspired interface
- **Search & Filter**: Find articles by title or tags
- **Responsive Design**: Works on desktop and mobile devices
- **Node Details**: Click nodes to view full article information
- **Multiple Layouts**: Switch between force-directed and circular layouts
- **Zoom & Pan**: Interactive exploration of the network
- **Live Connections**: Links between articles based on shared tags

## Technology Stack

- **Backend**: Node.js, Express, Puppeteer (web scraping)
- **Frontend**: D3.js, HTML5, CSS3 (with modern CSS Grid/Flexbox)
- **Data Processing**: Custom algorithms for relationship mapping
- **Visualization**: Force-directed graph layout with D3.js

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cyberneticzoo-network-viz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Scrape the data** (This will take a few minutes)
   ```bash
   npm run scrape
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## Usage

### Data Scraping
The scraper will automatically:
- Crawl cyberneticzoo.com's robots-in-art category
- Extract article titles, images, links, and content
- Generate automatic tags based on content analysis
- Create network connections based on shared themes
- Save processed data for the visualization

### Visualization Controls
- **Mouse**: Drag to pan, scroll to zoom
- **Search**: Type to highlight matching articles
- **Filters**: Click tags in sidebar to filter the network
- **Layout**: Toggle between force-directed and circular layouts
- **Reset**: Return to default view
- **Node Click**: View detailed article information

### Color Coding
- **Cyan (#64ffda)**: Art & Sculpture projects
- **Red (#ff6b6b)**: Performance art
- **Yellow (#f9ca24)**: Interactive installations
- **Blue (#45b7d1)**: Electronic art
- **Green (#4ecdc4)**: Kinetic sculptures

## Project Structure

```
cyberneticzoo-network-viz/
├── src/
│   ├── server.js          # Express server
│   └── scraper.js         # Web scraping logic
├── static/
│   ├── index.html         # Main webpage
│   ├── style.css          # Dark theme styling
│   └── network-visualization.js  # D3.js visualization
├── data/
│   └── cyberneticzoo-data.json   # Scraped and processed data
└── package.json
```

## Development

For development with auto-reload:
```bash
npm run dev
```

### Adding New Features
- **New filters**: Modify the tag generation logic in `scraper.js`
- **Visual themes**: Update CSS variables in `style.css`
- **Layout algorithms**: Add new layout functions in `network-visualization.js`
- **Data sources**: Extend the scraper to include additional categories

## Data Structure

The scraped data includes:
```json
{
  "nodes": [
    {
      "id": "unique-identifier",
      "title": "Article Title with Year",
      "link": "https://cyberneticzoo.com/...",
      "image": "thumbnail-url",
      "excerpt": "Article description",
      "tags": ["art", "robots", "1970s"],
      "year": 1975,
      "connections": [
        {"id": "related-article", "strength": 3}
      ]
    }
  ],
  "tags": ["art", "robots", "sculpture", ...],
  "stats": {
    "totalArticles": 150,
    "totalTags": 45,
    "averageConnections": 8.3
  }
}
```

## Performance Notes

- The scraper is limited to 10 pages to be respectful to the source website
- Images are loaded lazily to improve initial load time
- The force simulation is optimized for networks up to 500 nodes
- Responsive design adapts to different screen sizes

## Browser Compatibility

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers with ES6 support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the visualization
5. Submit a pull request

## License

MIT License - Feel free to use this project for educational or commercial purposes.

## Acknowledgments

- Data source: [Cybernetic Zoo](https://cyberneticzoo.com)
- Visualization library: [D3.js](https://d3js.org)
- Inspiration: Network analysis of creative works and digital humanities

---

*This visualization celebrates the intersection of robotics and art, providing an interactive way to explore the rich history of cybernetic creativity.*