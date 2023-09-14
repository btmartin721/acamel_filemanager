# File: scripts/pipeline_execution.py
import subprocess
import yaml


class PipelineExecutor:
    def __init__(self, config_path="pipeline_config.yaml"):
        with open(config_path, "r") as f:
            self.config = yaml.safe_load(f)

    def execute_pipeline(self):
        for step in self.config["steps"]:
            self._run_step(step)

    def _run_step(self, step):
        script_path = step.get("script_path", "")
        if not script_path:
            print(f"No script specified for step: {step['name']}")
            return
        print(f"Executing step: {step['name']}")
        subprocess.run(["python", script_path])


# Usage
if __name__ == "__main__":
    executor = PipelineExecutor()
    executor.execute_pipeline()
