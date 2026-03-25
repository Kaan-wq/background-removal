# Background Removal

[![CI](https://github.com/Kaan-wq/background-removal/actions/workflows/deploy.yml/badge.svg)](https://github.com/Kaan-wq/background-removal/actions/workflows/deploy.yml)
![Python](https://img.shields.io/badge/python-3.11-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> Upload an image. Get it back without the background.

![Demo](docs/demo.gif)

**[Live Demo](https://background-removal-taupe.vercel.app)**

---

## Overview

A full-stack AI web application that removes image backgrounds using [BRIA RMBG-2.0](https://huggingface.co/briaai/RMBG-2.0), a state-of-the-art open-source segmentation model. Upload any image and download the result as a transparent PNG in seconds.

---

## Architecture

```
User uploads image
       │
       ▼
React + TypeScript (Vercel)
       │  POST /remove-background
       ▼
FastAPI + ONNX Runtime (Hugging Face Spaces)
       │
       ▼
BRIA RMBG-2.0 inference (~35s on CPU)
       │
       ▼
Returns transparent PNG
```

---

## Tech Stack

| Layer                 | Technology              |
| --------------------- | ----------------------- |
| Frontend              | React, TypeScript, Vite |
| Backend               | FastAPI, Python 3.11    |
| ML Model              | BRIA RMBG-2.0 (ONNX)    |
| Containerization      | Docker                  |
| Dependency management | Poetry                  |
| CI/CD                 | GitHub Actions          |
| Backend hosting       | Hugging Face Spaces     |
| Frontend hosting      | Vercel                  |
| Linting               | Ruff                    |
| Testing               | pytest                  |

---

## Running Locally

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) 18+
- A [Hugging Face](https://huggingface.co/) account with access to [BRIA RMBG-2.0](https://huggingface.co/briaai/RMBG-2.0)

### 1. Clone the repository

```bash
git clone https://github.com/Kaan-wq/background-removal.git
cd background-removal
```

### 2. Configure environment variables

Create a `.env` file at the repo root:

```bash
HF_TOKEN=your_hugging_face_token
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Start the API

```bash
docker compose up --build
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| `GET`  | `/health`            | Health check                 |
| `POST` | `/remove-background` | Remove background from image |

### Example

```bash
curl -X POST http://localhost:8000/remove-background \
  -F "file=@photo.jpg" \
  --output result.png
```

Accepted formats: `JPEG`, `PNG`, `WEBP`

---

## Running Tests

```bash
cd api
poetry run pytest tests/ -v
```

---

## CI/CD

Every push to `main` triggers the GitHub Actions pipeline:

1. **Test** — runs `pytest` against the FastAPI backend
2. **Deploy** — builds the Docker image and pushes to Hugging Face Spaces

The frontend deploys automatically via Vercel's GitHub integration.

---

## License

MIT
