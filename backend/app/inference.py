from __future__ import annotations

import io
import json
import time
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image, UnidentifiedImageError


ROOT_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = ROOT_DIR / "models" / "final"
MODEL_PATH = MODEL_DIR / "agrismart_model_final.tflite"
METADATA_PATH = MODEL_DIR / "model_metadata.json"


FRIENDLY_NAMES = {
    "common_rust": "Rouille commune",
    "healthy": "Feuille saine",
    "northern_leaf_blight": "Brulure septentrionale",
}

CARE_ADVICE = {
    "common_rust": "Surveillez la propagation et isolez les plants les plus touches.",
    "healthy": "Aucune maladie detectee. Continuez la surveillance reguliere.",
    "northern_leaf_blight": "Inspectez rapidement la parcelle et preparez une intervention adaptee.",
}


class InvalidImageError(ValueError):
    """Raised when the uploaded file is not a valid image."""


@dataclass
class PredictionResult:
    predicted_class: str
    confidence: float
    scores: dict[str, float]
    input_size: list[int]
    inference_time_ms: float


class ModelService:
    def __init__(self) -> None:
        metadata = json.loads(METADATA_PATH.read_text(encoding="utf-8"))
        self.class_labels: list[str] = metadata["class_labels"]
        self.input_size: tuple[int, int] = tuple(metadata["input_size"][:2])

        self.interpreter = tf.lite.Interpreter(model_path=str(MODEL_PATH))
        input_shape = [1, self.input_size[0], self.input_size[1], 3]
        self.interpreter.resize_tensor_input(0, input_shape)
        self.interpreter.allocate_tensors()

        self.input_details = self.interpreter.get_input_details()[0]
        self.output_details = self.interpreter.get_output_details()[0]

    def _preprocess_image(self, image_bytes: bytes) -> np.ndarray:
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        except (UnidentifiedImageError, OSError) as exc:
            raise InvalidImageError("Le fichier envoye n'est pas une image exploitable.") from exc

        image = image.resize(self.input_size, Image.Resampling.BILINEAR)
        image_array = np.asarray(image, dtype=np.float32) / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        return image_array.astype(self.input_details["dtype"])

    def predict(self, image_bytes: bytes) -> PredictionResult:
        input_tensor = self._preprocess_image(image_bytes)

        started_at = time.perf_counter()
        self.interpreter.set_tensor(self.input_details["index"], input_tensor)
        self.interpreter.invoke()
        raw_scores = self.interpreter.get_tensor(self.output_details["index"])[0]
        elapsed_ms = (time.perf_counter() - started_at) * 1000

        scores = {label: float(score) for label, score in zip(self.class_labels, raw_scores)}
        best_label = max(scores, key=scores.get)

        return PredictionResult(
            predicted_class=best_label,
            confidence=float(scores[best_label]),
            scores=scores,
            input_size=[self.input_size[0], self.input_size[1], 3],
            inference_time_ms=round(elapsed_ms, 2),
        )


def build_public_response(result: PredictionResult) -> dict[str, object]:
    label = result.predicted_class
    return {
        "predicted_class": label,
        "predicted_label": FRIENDLY_NAMES.get(label, label),
        "confidence": round(result.confidence, 4),
        "scores": {key: round(value, 4) for key, value in result.scores.items()},
        "input_size": result.input_size,
        "inference_time_ms": result.inference_time_ms,
        "advice": CARE_ADVICE.get(label, "Analyse terminee."),
    }
