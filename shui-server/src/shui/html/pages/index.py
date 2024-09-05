from dominate import document
from dominate.tags import p
from fastapi import Request

from shui.auth.models import User
from shui.nav import NavItems

from ..colours import PageColours
from .base_with_nav import BaseWithNav


async def IndexPage(
    request: Request,
    nav_items: NavItems,
    user: User | None,
) -> document:
    title = "You are not logged in" if user is None else f"👋 Hello {user.email}"
    with BaseWithNav(request, nav_items, title, user) as doc:
        main = doc.getElementById("main")
        with main:
            p(title, cls=f"text-xl pb-4 text-[{PageColours.text_primary.value}]")

    return doc
