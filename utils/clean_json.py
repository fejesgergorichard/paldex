"""
Script to clean up Palworld JSON data by removing unnecessary properties
"""

import json
import sys

def clean_pal_object(pal):
    """
    Clean a single pal object by removing specified properties
    """
    cleaned = pal.copy()
    
    # Remove top level image property
    if 'image' in cleaned:
        del cleaned['image']
    
    # Convert types to simple string array (keep only name)
    if 'types' in cleaned:
        cleaned['types'] = [t['name'] for t in cleaned['types']]
    
    # Remove imageWiki
    if 'imageWiki' in cleaned:
        del cleaned['imageWiki']
    
    # Remove image from suitability array objects
    if 'suitability' in cleaned:
        for suit in cleaned['suitability']:
            if 'image' in suit:
                del suit['image']
    
    # Remove aura object
    if 'aura' in cleaned:
        del cleaned['aura']
    
    # Remove description
    if 'description' in cleaned:
        del cleaned['description']
    
    # Remove skills
    if 'skills' in cleaned:
        del cleaned['skills']
    
    return cleaned

def clean_json_file(input_file, output_file):
    """
    Read JSON file, clean all objects, and write to output file
    """
    try:
        # Read the input file
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Handle both single object and array of objects
        if isinstance(data, list):
            cleaned_data = [clean_pal_object(pal) for pal in data]
        else:
            cleaned_data = clean_pal_object(data)
        
        # Write to output file with nice formatting
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
        
        print(f"✓ Successfully cleaned JSON data")
        print(f"  Input:  {input_file}")
        print(f"  Output: {output_file}")
        
        if isinstance(cleaned_data, list):
            print(f"  Processed {len(cleaned_data)} objects")
        
    except FileNotFoundError:
        print(f"Error: File '{input_file}' not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in '{input_file}': {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python clean_json.py <input_file> [output_file]")
        print("Example: python clean_json.py data.json cleaned_data.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else "cleaned_" + input_file
    
    clean_json_file(input_file, output_file)