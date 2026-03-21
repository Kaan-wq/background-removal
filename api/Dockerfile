FROM python:3.11-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml poetry.lock ./

RUN poetry config virtualenvs.create false && poetry install --without dev --no-root

RUN python -c "from huggingface_hub import hf_hub_download; hf_hub_download(repo_id='briaai/RMBG-1.4', filename='onnx/model_quantized.onnx', local_dir='/app/models')"
RUN pip uninstall huggingface-hub hf-xet -y

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
