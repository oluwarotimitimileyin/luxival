"""
Luxival Translation Service
Powered by deep-translator (Google Translate free API — no key needed).
Language detection via langdetect.
"""
from deep_translator import GoogleTranslator
from langdetect import detect as langdetect_detect, DetectorFactory, LangDetectException

DetectorFactory.seed = 0

SUPPORTED_LANGUAGES = {
    "en": "English",
    "fi": "Finnish",
    "sv": "Swedish",
    "de": "German",
    "fr": "French",
    "it": "Italian",
    "ru": "Russian",
    "no": "Norwegian",
    "da": "Danish",
    "ja": "Japanese",
    "zh": "Chinese (Simplified)",
    "es": "Spanish",
    "pt": "Portuguese",
    "nl": "Dutch",
    "pl": "Polish",
    "tr": "Turkish",
    "ar": "Arabic",
    "ko": "Korean",
    "th": "Thai",
    "vi": "Vietnamese",
    "el": "Greek",
    "cs": "Czech",
    "ro": "Romanian",
    "hu": "Hungarian",
}


def translate_text(text: str, source: str = "auto", target: str = "en") -> dict:
    if target not in SUPPORTED_LANGUAGES:
        return {
            "success": False,
            "error": f"Unsupported target language: {target}",
            "supported": list(SUPPORTED_LANGUAGES.keys()),
        }

    try:
        translator = GoogleTranslator(source=source, target=target)
        translated = translator.translate(text)
        return {
            "success": True,
            "translated_text": translated,
            "source_language": source,
            "target_language": target,
            "character_count": len(text),
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }


def detect_language(text: str) -> dict:
    try:
        detected = langdetect_detect(text)
        return {
            "success": True,
            "detected_language": detected,
            "text": text,
        }
    except LangDetectException as e:
        return {
            "success": False,
            "error": str(e),
        }


def batch_translate(
    texts: list[str], source: str = "auto", target: str = "en"
) -> dict:
    try:
        translator = GoogleTranslator(source=source, target=target)
        translated = translator.translate_batch(texts)
        return {
            "success": True,
            "translated_texts": translated,
            "source_language": source,
            "target_language": target,
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
        }
