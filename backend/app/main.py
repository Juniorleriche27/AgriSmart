from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .inference import InvalidImageError, ModelService, build_public_response


app = FastAPI(
    title="AgriSmart API",
    version="1.0.0",
    description="API locale pour detecter des maladies du mais a partir d'une photo.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model_service = ModelService()


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "AgriSmart API active"}


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "classes": model_service.class_labels,
        "input_size": [*model_service.input_size, 3],
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> dict[str, object]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier doit etre une image.")

    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Le fichier envoye est vide.")

    try:
        prediction = model_service.predict(image_bytes)
    except InvalidImageError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erreur d'inference: {exc}") from exc

    return build_public_response(prediction)
