"""Checks the X-Device-Key header sent by the ESP32 devices."""

import secrets

from fastapi import Depends, Header, HTTPException, status

from app.config import Settings, get_settings


def require_device_key(
    x_device_key: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> None:
    if not settings.device_api_key:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "DEVICE_API_KEY is not set on the server, so device uploads are disabled.",
        )
    if not x_device_key:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing X-Device-Key header.")
    # compare_digest takes the same time for any wrong key, so the key can't be guessed by timing.
    if not secrets.compare_digest(x_device_key.encode(), settings.device_api_key.encode()):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid X-Device-Key.")
