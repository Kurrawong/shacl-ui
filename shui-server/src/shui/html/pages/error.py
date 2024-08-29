from dominate import document
from dominate.tags import h1
from fastapi import Request

from shui.html.pages.base import BasePage


def ErrorPage(request: Request, title: str) -> document:
    with BasePage(request, title) as doc:
        main = doc.getElementById("main")
        with main:
            h1(title, cls="text-lg font-bold")

    return doc
