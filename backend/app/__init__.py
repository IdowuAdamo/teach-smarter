"""TeachSmarter Backend Application."""
import sys
from pathlib import Path

# Ensure project root and backend directory are in sys.path so 'agents' and 'app' resolve everywhere
_BACKEND_DIR = Path(__file__).resolve().parent.parent
_REPO_ROOT = _BACKEND_DIR.parent

for _p in [str(_REPO_ROOT), str(_BACKEND_DIR)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

__version__ = "0.1.0"
