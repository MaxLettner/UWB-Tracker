import asyncio
import random
from datetime import datetime, timezone
from scalar_fastapi import get_scalar_api_reference
from fastapi import FastAPI, WebSocket
from fastapi.responses import HTMLResponse, RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.websockets import WebSocketDisconnect
from pathlib import Path
import mimetypes

DIST = Path("../Frontend/dist")

app = FastAPI()
app = FastAPI(
    root_path="/api",
    docs_url=None,
    redoc_url=None,
    title="UWB Tracker API",
    description="API for streaming UWB tracker coordinates.",
    version="0.1.0",
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    }
)

@app.get("/scalar", include_in_schema=False)
async def read_scalar():
    return RedirectResponse(url="/docs")

@app.get("/docs", include_in_schema=False)
async def scalar_html():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title
    )

# Simple HTML page to test the Websocket data streaming
@app.get("/test", name="test for api", include_in_schema=False)
async def test():
    return HTMLResponse("""
<html><body>
<pre id="out"></pre>
<script>
  const ws = new WebSocket(`ws://${location.host}/api/stream/coordinates`);
  ws.onmessage = e => {
    const out = document.getElementById("out");
    out.textContent += e.data + "\\n";
  };
  ws.onerror = e => console.error("WebSocket error:", e);
  ws.onclose = e => console.warn("WebSocket closed:", e.code, e.reason);
</script>
</body></html>
""")

# State for slow movement simulation
_position = {"x": 0.0, "y": 0.0, "z": 0.0}

async def get_data_from_dongle():
    await asyncio.sleep(0.001)
    for axis in _position:
        _position[axis] += random.uniform(-1, 1)
        _position[axis] = max(-100, min(100, _position[axis]))
    return {
        "x": _position["x"],
        "y": _position["y"],
        "z": _position["z"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

async def get_scale_from_dongle():
    return 200

# Websocket endpoint to stream coordinates
@app.websocket("/stream/coordinates", name="Stream coordinates")
async def websocket_coordinates(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await get_data_from_dongle()
            await websocket.send_json(data)
    except WebSocketDisconnect:
        pass

# HTTP endpoint to get the scale of the coordinate system (anchors)
@app.get("/scale", name="Get scale", description="Get the scale of the coordinate system", include_in_schema=True)
async def get_scale():
    scale = await get_scale_from_dongle()
    return scale


@app.get("/{full_path:path}", name="root", include_in_schema=False)
async def serve_react(full_path: str):
    file = DIST / full_path
    if file.is_file():
        mime_type, _ = mimetypes.guess_type(file)
        return FileResponse(file, media_type=mime_type)
    return FileResponse(DIST / "index.html")