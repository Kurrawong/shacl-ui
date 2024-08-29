from dominate import document
from dominate.tags import h1, p
from fastapi import Request

from shui.html.pages.base import BasePage


async def ErrorPage(
    request: Request, title: str, description: str | None = None
) -> document:
    with BasePage(request, title) as doc:
        main = doc.getElementById("main")
        with main:
            h1(title, cls="text-lg font-bold")
            if description:
                p(description)

    return doc
