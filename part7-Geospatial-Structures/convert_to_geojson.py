#!/usr/bin/env python3
import csv
import json
import random

def convert_csv_to_geojson(csv_file, geojson_file, sample_size=5000):
    """Convert NYC Tree Census CSV to GeoJSON with sampling"""
    
    features = []
    
    with open(csv_file, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        rows = list(reader)
        
        # Sample the data for better performance
        if len(rows) > sample_size:
            rows = random.sample(rows, sample_size)
        
        for row in rows:
            try:
                lat = float(row['latitude'])
                lon = float(row['longitude'])
                
                # Skip rows with invalid coordinates
                if lat == 0 or lon == 0:
                    continue
                
                # Create feature
                feature = {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    },
                    "properties": {
                        "tree_id": row.get('tree_id', ''),
                        "species_latin": row.get('spc_latin', ''),
                        "species_common": row.get('spc_common', ''),
                        "diameter": row.get('tree_dbh', ''),
                        "health": row.get('health', ''),
                        "status": row.get('status', ''),
                        "borough": row.get('borough', ''),
                        "address": row.get('address', ''),
                        "steward": row.get('steward', ''),
                        "problems": row.get('problems', '')
                    }
                }
                
                features.append(feature)
                
            except (ValueError, KeyError) as e:
                # Skip rows with invalid data
                continue
    
    # Create GeoJSON structure
    geojson = {
        "type": "FeatureCollection",
        "features": features
    }
    
    # Write to file
    with open(geojson_file, 'w', encoding='utf-8') as outfile:
        json.dump(geojson, outfile, indent=2)
    
    print(f"Converted {len(features)} trees to GeoJSON")
    return len(features)

if __name__ == "__main__":
    convert_csv_to_geojson('nyc_trees_2015.csv', 'nyc_trees_sample.geojson', 5000)