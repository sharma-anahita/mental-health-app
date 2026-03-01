import importlib.util
import os
import sys

# This wrapper dynamically loads the FastAPI app from ml-service/main.py
# and exposes the symbol `app` for Uvicorn to import as `ml_service_asgi:app`.

BASE_DIR = os.path.dirname(__file__)
ML_MAIN_PATH = os.path.join(BASE_DIR, "ml-service", "main.py")

if not os.path.exists(ML_MAIN_PATH):
    raise ImportError(f"ml service entry not found at {ML_MAIN_PATH}")

spec = importlib.util.spec_from_file_location("ml_service_main", ML_MAIN_PATH)
ml_module = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = ml_module
spec.loader.exec_module(ml_module)

# Support common export patterns: `app` or `create_app()`
if hasattr(ml_module, "app"):
    app = getattr(ml_module, "app")
elif hasattr(ml_module, "create_app"):
    app = ml_module.create_app()
else:
    raise ImportError("No FastAPI `app` or `create_app()` found in ml-service/main.py")
"""ASGI wrapper to load the FastAPI app from the folder named `ml-service`.

Render (and Python import rules) don't allow module names with hyphens, so
we load the `ml-service/main.py` file dynamically and expose its `app` name
at module level so Uvicorn can import it as `ml_service_asgi:app`.

Usage (Render start command):
  uvicorn ml_service_asgi:app --host 0.0.0.0 --port $PORT
"""
import importlib.util
import os
from pathlib import Path

ROOT = Path(__file__).parent
MAIN_PATH = ROOT.joinpath('ml-service', 'main.py')

if not MAIN_PATH.exists():
    raise RuntimeError(f"Expected ml-service/main.py at {MAIN_PATH!s}")

spec = importlib.util.spec_from_file_location('ml_service_main', str(MAIN_PATH))
ml = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ml)

# The FastAPI app must be defined as `app` in ml-service/main.py
try:
    app = getattr(ml, 'app')
except AttributeError:
    raise RuntimeError('ml-service.main does not expose `app`')
