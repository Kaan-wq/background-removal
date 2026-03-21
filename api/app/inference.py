import numpy as np
import onnxruntime as ort
from PIL import Image
from huggingface_hub import hf_hub_download
import io

# Download and cache model on first run
MODEL_PATH = hf_hub_download(repo_id='briaai/RMBG-1.4', filename='onnx/model_quantized.onnx')
session = ort.InferenceSession(MODEL_PATH)

INPUT_SIZE = (1024, 1024)

def preprocess(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB").resize(INPUT_SIZE)
    arr = np.array(image, dtype=np.float32) / 255.0
    arr = ((arr - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]).astype(np.float32)
    arr = arr.transpose(2, 0, 1)           # HWC → CHW
    arr = np.expand_dims(arr, axis=0)      # add batch dimension
    return arr

def postprocess(mask: np.ndarray, original_size: tuple) -> Image.Image:
    mask = mask.squeeze()                  # remove batch + channel dims
    mask = (mask * 255).astype(np.uint8)
    return Image.fromarray(mask).resize(original_size)

def remove_background(image_bytes: bytes) -> bytes:
    image = Image.open(io.BytesIO(image_bytes))
    original_size = image.size

    input_arr = preprocess(image)
    input_name = session.get_inputs()[0].name
    mask_arr = session.run(None, {input_name: input_arr})[0]

    mask = postprocess(mask_arr, original_size)

    # Apply mask as alpha channel
    image = image.convert("RGBA")
    image.putalpha(mask)

    output = io.BytesIO()
    image.save(output, format="PNG")
    return output.getvalue()
