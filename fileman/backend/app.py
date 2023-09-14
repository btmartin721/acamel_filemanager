from flask import Flask, jsonify
import json
import yaml

from flask_cors import CORS

MyApp = Flask(__name__)
CORS(MyApp)


@MyApp.route("/get_metadata", methods=["GET"])
def get_metadata():
    # Normally, you'd read this data from a file or database
    with open("../metadata.json", "r") as f:
        metadata = json.load(f)
    return jsonify(metadata)


@MyApp.route("/get_yaml_config", methods=["GET"])
def get_yaml_config():
    # Normally, you'd read this data from a file or database
    with open("../pipeline_config.yaml", "r") as f:
        yaml_config = yaml.safe_load(f)
    return jsonify(yaml_config)


@MyApp.route("/get_folders", methods=["GET"])
def get_folders():
    with open("../pipeline_config.yaml", "r") as stream:
        try:
            yaml_data = yaml.safe_load(stream)

            folder_set = set()

            # Extract from steps
            for step in yaml_data.get("steps", []):
                folder_set.update(step.get("input_dir", []))
                folder_set.add(step.get("output_dir", ""))

            # Extract from watchdog_triggers
            for trigger in yaml_data.get("watchdog_triggers", []):
                folder_set.add(trigger.get("folder", ""))

            folders = list(folder_set)
            return jsonify({"folders": folders})

        except yaml.YAMLError as exc:
            print(exc)
            return jsonify({"error": "Failed to read YAML"}), 500


if __name__ == "__main__":
    MyApp.run(debug=True)
