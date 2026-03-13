from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from typing import TYPE_CHECKING

from .inference import CARE_ADVICE, FRIENDLY_NAMES

if TYPE_CHECKING:
    from .inference import PredictionResult


COHERE_CHAT_URL = "https://api.cohere.com/v2/chat"


class CommentaryService:
    def __init__(self) -> None:
        self.api_key = os.getenv("COHERE_API_KEY")
        self.model = os.getenv("COHERE_MODEL", "command-a-03-2025")
        self.timeout_seconds = float(os.getenv("COHERE_TIMEOUT_SECONDS", "20"))

    @property
    def enabled(self) -> bool:
        return bool(self.api_key)

    def build_commentary(self, result: PredictionResult) -> tuple[str, str]:
        if not self.enabled:
            return self._build_local_commentary(result), "local"

        try:
            commentary = self._request_cohere_commentary(result)
        except Exception:
            return self._build_local_commentary(result), "local"

        if not commentary:
            return self._build_local_commentary(result), "local"

        return commentary, "cohere"

    def _request_cohere_commentary(self, result: PredictionResult) -> str:
        label = result.predicted_class
        prompt = (
            "Analyse cette prediction d'une feuille de mais.\n"
            f"Classe predite: {FRIENDLY_NAMES.get(label, label)} ({label}).\n"
            f"Confiance: {round(result.confidence * 100, 1)}%.\n"
            f"Scores: {self._format_scores(result.scores)}.\n"
            f"Conseil local: {CARE_ADVICE.get(label, 'Analyse terminee.')}.\n"
            "Donne un commentaire clair en francais, en 2 phrases maximum, "
            "simple a comprendre pour un non-specialiste. "
            "Mentionne le niveau de confiance et une action immediate."
        )

        payload = {
            "model": self.model,
            "stream": False,
            "temperature": 0.3,
            "max_tokens": 120,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Tu es un assistant agronomique. "
                        "Reponds en francais simple, sans markdown, sans listes, "
                        "sans formule d'introduction."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        }

        request = urllib.request.Request(
            COHERE_CHAT_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "X-Client-Name": "AgriSmart",
            },
            method="POST",
        )

        with urllib.request.urlopen(request, timeout=self.timeout_seconds) as response:
            payload = json.loads(response.read().decode("utf-8"))

        content_blocks = payload.get("message", {}).get("content", [])
        for block in content_blocks:
            if block.get("type") == "text":
                text = block.get("text", "").strip()
                if text:
                    return text

        return ""

    def _build_local_commentary(self, result: PredictionResult) -> str:
        label = result.predicted_class
        confidence_percent = round(result.confidence * 100)
        confidence_note = (
            "La confiance du modele est tres elevee."
            if result.confidence >= 0.9
            else "La confiance du modele est correcte mais merite une verification visuelle."
        )
        return (
            f"Le modele classe la feuille comme {FRIENDLY_NAMES.get(label, label).lower()} "
            f"avec {confidence_percent}% de confiance. {confidence_note} "
            f"{CARE_ADVICE.get(label, 'Analyse terminee.')}"
        )

    @staticmethod
    def _format_scores(scores: dict[str, float]) -> str:
        ordered_scores = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        return ", ".join(f"{label}={round(score * 100, 1)}%" for label, score in ordered_scores)
