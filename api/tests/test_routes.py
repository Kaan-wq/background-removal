from fastapi.testclient import TestClient
from app.main import app
from PIL import Image
import io

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_remove_background_invalid_file_type():
    response = client.post(
        "/remove-background",
        files={"file": ("test.txt", b"not an image", "text/plain")},
    )
    assert response.status_code == 400


def test_remove_background_valid_image():
    img = Image.new("RGB", (100, 100), color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    response = client.post(
        "/remove-background", files={"file": ("test.png", buf, "image/png")}
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
