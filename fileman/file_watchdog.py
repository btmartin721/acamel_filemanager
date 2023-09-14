from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import json
import os
import time
import hashlib
import yaml
from pathlib import Path

from watchers.pipeline_execution import PipelineExecutor


def update_yaml_config(action, file_path, file_meta):
    """Updates the YAML configuration to designate final input and output files.

    Args:
        action (str): The action taken on the file (added, modified, deleted).
        file_path (str): The path of the file.
        file_meta (dict): The metadata of the file.
    """
    with open("pipeline_config.yaml", "r") as f:
        config = yaml.safe_load(f)

    for step in config["steps"]:
        input_dirs = step["input_dir"]
        output_dir = step["output_dir"]

        if (
            any(dir_name in file_path for dir_name in input_dirs)
            or output_dir in file_path
        ):
            if action in ["added", "modified", "renamed"]:
                if output_dir in file_path:
                    step["final_output"] = file_meta["filename"]
                else:
                    step["final_input"] = file_meta["filename"]
            elif action == "deleted":
                if step["final_output"] == file_meta["filename"]:
                    step["final_output"] = None
                if step["final_input"] == file_meta["filename"]:
                    step["final_input"] = None

    with open("pipeline_config.yaml", "w") as f:
        yaml.safe_dump(config, f)


import time


def generate_checksum(file_path, retries=3, delay=0.5):
    for i in range(retries):
        try:
            if not os.path.exists(file_path):
                write_to_log(
                    f"Could not generate checksum for file {file_path}"
                )
                return None

            sha256_hash = hashlib.sha256()
            with open(file_path, "rb") as f:
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
            return sha256_hash.hexdigest()
        except FileNotFoundError:
            if i < retries - 1:
                time.sleep(delay)
                continue
            else:
                write_to_log(
                    f"File {file_path} not found after {retries} retries."
                )
                return None


def write_to_log(message):
    with open("debug.log", "a") as log_file:
        log_file.write(f"{message}\n")


class Handler(FileSystemEventHandler):
    def __init__(self):
        with open("pipeline_config.yaml", "r") as f:
            self.config = yaml.safe_load(f)

    def process(self, event, action, src_path=None, dest_path=None):
        """Process the file system event and update metadata and configuration.

        Args:
            event (Event): The watchdog event object.
            action (str): The action taken on the file (added, modified, deleted, renamed).
        """
        ignored_extensions = [".swp", ".swx"]
        if event.is_directory:
            return None
        if "metadata.json" in event.src_path:
            return None
        if "pipeline_config.yaml" in event.src_path:
            return None
        if any(event.src_path.endswith(ext) for ext in ignored_extensions):
            return None
        if "debug.log" in event.src_path:
            return None
        if dest_path is not None and any(
            dest_path.endswith(ext) for ext in ignored_extensions
        ):
            return None

        watch_dirs = ["align", "analysis", "notebooks", "dataprep", "scripts"]

        if not any(ele in event.src_path for ele in watch_dirs):
            return None

        file_path = dest_path if dest_path is not None else event.src_path
        old_file_path = event.src_path if dest_path is not None else None

        checksum = generate_checksum(file_path)
        timestamp = time.strftime("%Y%m%d%H%M%S")

        # Validate file_path existence before attempting to access its metadata
        if not os.path.exists(file_path):
            write_to_log(f"Could not find file {file_path}")
            return

        # Read existing metadata
        with open("metadata.json", "r") as f:
            data = json.load(f)

        # Check if the file has been processed before with the same checksum
        for file_meta in data.get("files", []):
            if (
                file_meta["filename"] == os.path.basename(file_path)
                and file_meta["checksum"] == checksum
            ):
                return  # Skip processing if file has not changed

        # update_yaml_config(
        #     action,
        #     file_path,
        #     {
        #         "filename": os.path.basename(file_path),
        #         "version": 1.0,
        #         "type": "intermediate",
        #         "path": file_path,
        #         "checksum": checksum,
        #         "timestamp": timestamp,
        #         "date_created": str(time.ctime(os.path.getctime(file_path))),
        #         "original_filename": old_file_path,
        #     },
        # )

        dirname = Path(file_path).parent.name

        with open("metadata.json", "r+") as f:
            data = json.load(f)
            data["files"].append(
                {
                    "filename": os.path.basename(file_path),
                    "directory": str(dirname),
                    "version": 1.0,
                    "type": "intermediate",
                    "path": file_path,
                    "checksum": checksum,
                    "timestamp": timestamp,
                    "date_created": str(
                        time.ctime(os.path.getctime(file_path))
                    ),
                    "original_filename": old_file_path,
                }
            )

            f.seek(0)
            json.dump(data, f, indent=4)
            f.truncate()

    def process_deleted(self, event):
        file_path = event.src_path  # Deleted file path

        # Read existing metadata
        with open("metadata.json", "r") as f:
            data = json.load(f)

        # Remove the entry for the deleted file
        data["files"] = [
            file_meta
            for file_meta in data.get("files", [])
            if file_meta["filename"] != os.path.basename(file_path)
        ]

        # Write updated metadata back to 'metadata.json'
        with open("metadata.json", "w") as f:
            json.dump(data, f, indent=4)

    def on_modified(self, event):
        self.process(event, "modified", src_path=event.src_path)

    def on_created(self, event):
        self.process(event, "added")

    def on_deleted(self, event):
        self.process_deleted(event)

    def on_moved(self, event):
        """Handles file move events.

        Args:
            event: The event object representing the file operation.
        """
        self.process(event, "renamed", dest_path=event.dest_path)


if __name__ == "__main__":
    if not os.path.exists("metadata.json"):
        with open("metadata.json", "w") as f:
            json.dump({"files": []}, f, indent=4)

    project_dir = "./"
    handler = Handler()
    observer = Observer()
    observer.schedule(handler, path=project_dir, recursive=True)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
