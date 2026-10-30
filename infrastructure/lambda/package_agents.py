"""
Package individual agent directories into standalone AWS Lambda deployable zip bundles.
"""

import os
import shutil
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
AGENTS_DIR = BASE_DIR / "agents"
DIST_DIR = BASE_DIR / "infrastructure" / "lambda" / "dist"

AGENT_NAMES = [
    "ingestion",
    "assessment_intelligence",
    "student_diagnostics",
    "teaching_strategy",
    "parent_communication",
]


def package_agent(agent_name: str):
    agent_path = AGENTS_DIR / agent_name
    shared_path = AGENTS_DIR / "shared"
    zip_path = DIST_DIR / f"{agent_name}.zip"

    print(f"Packaging {agent_name} -> {zip_path}")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        # Add agent files
        for root, _, files in os.walk(agent_path):
            if "__pycache__" in root:
                continue
            for f in files:
                full_path = Path(root) / f
                arc_name = full_path.relative_to(AGENTS_DIR)
                zf.write(full_path, arc_name)

        # Add shared files
        for root, _, files in os.walk(shared_path):
            if "__pycache__" in root:
                continue
            for f in files:
                full_path = Path(root) / f
                arc_name = full_path.relative_to(AGENTS_DIR)
                zf.write(full_path, arc_name)


def main():
    DIST_DIR.mkdir(parents=True, exist_ok=True)
    for agent in AGENT_NAMES:
        package_agent(agent)
    print("[OK] All agent Lambda bundles packaged successfully in dist/")


if __name__ == "__main__":
    main()

