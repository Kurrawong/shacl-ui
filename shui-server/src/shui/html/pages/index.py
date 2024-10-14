from dominate import document
from dominate.tags import li, p, ul
from fastapi import Request

from shui.auth.models import User

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

            p(
                "Some things that may be added to the user's home page in a future update:"
            )
            with ul():
                li(
                    "A timeline of changes made to the system by other users.",
                    cls="list-disc translate-x-5 first:pt-2",
                )
                li(
                    "A list of recent changes made by the user.",
                    cls="list-disc translate-x-5 first:pt-2",
                )
                li(
                    "A list of quick links to commonly accessed pages.",
                    cls="list-disc translate-x-5 first:pt-2",
                )

    return doc
