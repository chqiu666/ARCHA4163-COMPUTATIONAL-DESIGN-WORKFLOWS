# NYC Urban Forest - Geospatial Structures Visualization

## Overview

This project visualizes New York City's urban forest through the 2015 TreesCount! Street Tree Census data, creating an interactive geospatial canvas using Mapbox GL JS. The visualization represents 5,000 street trees as points on a map, with each tree colored by health status and sized by trunk diameter.

## Dataset

**Source**: NYC Parks & Recreation 2015 Street Tree Census  
**Collection Method**: Citizen Science Initiative  
**Total Trees in Full Dataset**: 666,134 trees  
**Displayed Sample**: 5,000 trees (for performance optimization)

### Data Download
The original CSV file (210MB) was too large for GitHub. To get the full dataset:
```bash
curl -o nyc_trees_2015.csv "https://data.cityofnewyork.us/api/views/uvpi-gqnh/rows.csv?accessType=DOWNLOAD"
```

### Data Attributes
- **Location**: Latitude and longitude coordinates
- **Species**: Scientific and common names
- **Health Status**: Excellent, Good, Fair, Poor, Dead
- **Physical Characteristics**: Trunk diameter, tree condition
- **Context**: Borough, address, steward information

## Visual Design Principles

### Aesthetics & Composition
- **Dark Theme**: Professional dark background (#0f1419) for better contrast
- **Color Palette**: Health-based gradient from green (healthy) to red (dead/poor)
- **Typography**: Inter font family for modern, clean readability
- **Layout**: Asymmetrical composition with overlaid information panels

### Interactive Elements
- **Hover Effects**: Dynamic stroke highlighting on tree points
- **Click Popups**: Detailed information cards with tree-specific data
- **Smooth Transitions**: Opacity changes during map navigation
- **Responsive Design**: Adaptive layout for different screen sizes

### Line Weights & Visual Hierarchy
- **Tree Points**: Variable radius (3-12px) based on trunk diameter
- **Stroke Weights**: 1px default, 3px on hover for emphasis
- **Panel Borders**: 1px subtle borders with transparency
- **Typography Scale**: Hierarchical sizing from 0.9rem to 4rem

## Geospatial Structures in Project Applications

### Urban Planning & Environmental Studies
Geospatial structures like this tree census visualization could be invaluable for:

**1. Climate Resilience Planning**
- Identifying areas with low tree coverage for targeted planting initiatives
- Analyzing tree health patterns in relation to air quality and temperature
- Planning green corridors to combat urban heat islands

**2. Public Health Research**
- Correlating tree density with respiratory health outcomes
- Studying the relationship between green spaces and mental health
- Identifying environmental justice issues in tree distribution

**3. Infrastructure Development**
- Planning utility lines around existing tree infrastructure
- Assessing root system impacts on sidewalks and foundations
- Coordinating construction projects with tree preservation efforts

### Data Journalism & Civic Engagement

**Community Reporting**
- Visualizing neighborhood-level environmental disparities
- Tracking changes in urban canopy over time
- Creating compelling stories about environmental stewardship

**Policy Advocacy**
- Supporting budget requests for parks and recreation departments
- Demonstrating the economic value of urban forestry programs
- Engaging citizens in environmental monitoring and maintenance

### Smart City Applications

**IoT Integration**
- Combining tree census data with air quality sensors
- Monitoring tree health through satellite imagery and ground sensors
- Predicting maintenance needs through predictive analytics

**Resource Optimization**
- Routing tree maintenance crews efficiently
- Scheduling seasonal care based on species and health data
- Optimizing watering systems during drought conditions

## Technical Implementation

### Data Processing
- **Format Conversion**: CSV to GeoJSON for web mapping
- **Sampling Strategy**: Random selection of 5,000 trees for performance
- **Data Validation**: Filtering invalid coordinates and missing values

### Mapping Technology
- **Mapbox GL JS**: Modern WebGL-based mapping library
- **Custom Styling**: Dark theme with custom color schemes
- **Performance Optimization**: Efficient rendering of point data

### Interactivity Features
- **Dynamic Styling**: Expression-based coloring and sizing
- **Event Handling**: Mouse interactions and popup management
- **Responsive Design**: Cross-device compatibility

## Future Enhancements

1. **Temporal Analysis**: Time-series visualization showing tree health changes
2. **Species Clustering**: Grouping trees by species for ecological analysis
3. **Environmental Correlation**: Overlaying air quality, temperature, and precipitation data
4. **Community Features**: User-generated content and tree adoption programs
5. **Predictive Modeling**: Machine learning for tree health predictions

## Files Structure

```
part7/
├── index.html              # Main visualization webpage
├── nyc_trees_sample.geojson # GeoJSON data file (5,000 trees)
├── convert_to_geojson.py   # Data processing script
├── README.md               # This documentation
└── project_summary.md      # Project overview

Note: nyc_trees_2015.csv (210MB) not included due to GitHub file size limits
```

## Running the Project

1. Start a local web server in the `part7` directory:
   ```bash
   python3 -m http.server 8000
   ```
2. Open `http://localhost:8000/` in a modern web browser
3. Ensure internet connectivity for Mapbox tiles and fonts
4. Replace the Mapbox access token with your own for production use

## Conclusion

This geospatial visualization demonstrates how environmental data can be transformed into compelling, interactive experiences that inform decision-making and engage communities. The combination of meaningful data, thoughtful design, and modern web technologies creates a powerful tool for understanding and improving urban environments.

The project showcases the potential of geospatial structures to bridge the gap between complex datasets and public understanding, making environmental data accessible and actionable for diverse stakeholders.