from dominate import document
from dominate.tags import p, span
from fastapi import Request

from shui.auth.models import User
from shui.html.shoelace import (
    sl_button,
)

from ..colours import PageColours
from .base import BasePage


async def IndexPage(
    request: Request,
    user: User | None,
) -> document:
    title = "You are not logged in" if user is None else f"👋 Hello {user.email}"
    with BasePage(request, title, user) as doc:
        main = doc.getElementById("main")
        with main:
            p(title, cls=f"text-xl pb-4 text-[{PageColours.text_primary.value}]")

            if user is None:
                with sl_button(href=request.url_for("login_route"), variant="primary"):
                    span("Login here")

    return doc
