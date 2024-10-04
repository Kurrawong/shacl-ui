from fastapi import Request

from shui.auth.models import User
from shui.html.pages.base import BasePage
from shui.html.shui import shui_form


async def RecordPage(
    request: Request,
    user: User,
    iri: str,
    graph_name: str,
    node_shape: str,
    data: str,
    submission_url: str,
):
    title = ""
    with BasePage(request, title, user) as doc:
        main = doc.getElementById("main")
        with main:
            shui_form(request, iri, graph_name, node_shape, data, submission_url)

    return doc
