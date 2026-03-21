from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import Response
from app.inference import remove_background

router = APIRouter()

@router.post("/remove-background")
async def remove_background_route(file: UploadFile = File(...)):
    if file.content_type not in ["image/jpeg", "image/png", "image/webp"]:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG, PNG and WEBP images are supported."
        )

    input_bytes = await file.read()
    output_bytes = remove_background(input_bytes)

    return Response(content=output_bytes, media_type="image/png")
