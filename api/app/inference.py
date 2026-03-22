import numpy as np
import onnxruntime as ort
from PIL import Image
from huggingface_hub import hf_hub_download
import io
import gc
import os

# Download and cache model on first run
MODEL_PATH = hf_hub_download(
    repo_id="briaai/RMBG-2.0",
    filename="onnx/model_quantized.onnx",
    token=os.environ.get("HF_TOKEN"),
)

opts = ort.SessionOptions()
opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
opts.intra_op_num_threads = 1
opts.inter_op_num_threads = 1
opts.enable_cpu_mem_arena = False
opts.enable_mem_pattern = False
opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
session = ort.InferenceSession(
    MODEL_PATH, sess_options=opts, providers=["CPUExecutionProvider"]
)

INPUT_SIZE = (1024, 1024)


def preprocess(image: Image.Image) -> np.ndarray:
    image = image.convert("RGB").resize(INPUT_SIZE)
    return np.expand_dims(
        (
            (np.array(image, dtype=np.float32) / 255.0 - [0.485, 0.456, 0.406])
            / [0.229, 0.224, 0.225]
        )
        .astype(np.float32)
        .transpose(2, 0, 1),
        axis=0,
    )


def postprocess(mask: np.ndarray, original_size: tuple) -> Image.Image:
    mask = (mask.squeeze() * 255).astype(np.uint8)
    return Image.fromarray(mask).resize(original_size)


def remove_background(image_bytes: bytes) -> bytes:
    image = Image.open(io.BytesIO(image_bytes))
    original_size = image.size

    input_arr = preprocess(image)
    del image
    gc.collect()

    input_name = session.get_inputs()[0].name
    mask_arr = session.run(None, {input_name: input_arr})[0]
    del input_arr
    gc.collect()

    mask = postprocess(mask_arr, original_size)
    del mask_arr, original_size
    gc.collect()

    result = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    result.putalpha(mask)

    output = io.BytesIO()
    result.save(output, format="PNG")

    return output.getvalue()
