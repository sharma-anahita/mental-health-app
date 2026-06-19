import importlib.util
import os
import sys
import traceback
from pathlib import Path

# This wrapper dynamically loads the FastAPI app from ml-service/main.py
# and exposes the symbol `app` for Uvicorn to import as `ml_service_asgi:app`.
try:
    ROOT = Path(__file__).resolve().parent
    MAIN_PATH = ROOT.joinpath('ml-service', 'main.py')

    if not MAIN_PATH.exists():
        raise ImportError(f"ML service entry point not found at: {MAIN_PATH}")

    # Add the ml-service directory to sys.path to allow imports from within it
    ml_dir = str(ROOT.joinpath('ml-service'))
    if ml_dir not in sys.path:
        sys.path.insert(0, ml_dir)

    spec = importlib.util.spec_from_file_location('ml_service_main', str(MAIN_PATH))
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load spec for {MAIN_PATH}")

    ml_module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = ml_module
    spec.loader.exec_module(ml_module)

    # Support common export patterns: `app` or `create_app()`
    if hasattr(ml_module, 'app'):
        app = getattr(ml_module, 'app')
    elif hasattr(ml_module, 'create_app'):
        app = ml_module.create_app()
    else:
        raise ImportError("No FastAPI `app` or `create_app()` found in ml-service/main.py")

except Exception as e:
    print("CRITICAL ERROR: Failed to load ml_service_asgi", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    raise e

