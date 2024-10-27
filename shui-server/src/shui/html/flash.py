from typing import Any

from fastapi import Request


def flash(request: Request, message: Any, category: str = "success") -> None:
    if "_messages" not in request.session:
        request.session["_messages"] = []
    request.session["_messages"].append({"message": message, "category": category})


def get_flashed_messages(request: Request) -> list[dict[str, str]] | Any:
    return request.session.pop("_messages") if "_messages" in request.session else []
