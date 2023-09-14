import json
import yaml
import pandas as pd


def load_metadata_to_df(json_path):
    """
    Load metadata from a JSON file to a pandas DataFrame.
    
    Args:
        json_path (str): The path to the JSON metadata file.
    
    Returns:
        pd.DataFrame: A DataFrame containing the metadata.
    """
    with open(json_path, 'r') as f:
        data = json.load(f)
    
    return pd.DataFrame(data['files'])

def load_yaml_config(yaml_path):
    """
    Load configuration from a YAML file.
    
    Args:
        yaml_path (str): The path to the YAML configuration file.
    
    Returns:
        dict: A dictionary containing the configuration.
    """
    with open(yaml_path, 'r') as f:
        config = yaml.safe_load(f)
        
    return config

# Example usage:
# config = load_yaml_config("pipeline_config.yaml")

