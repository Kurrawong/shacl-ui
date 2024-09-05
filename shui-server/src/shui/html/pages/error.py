from dominate import document
from dominate.tags import h1, p
from fastapi import Request

from shui.html.pages.base_with_nav import BaseWithNav
from shui.nav import NavItems


async def ErrorPage(
    request: Request, title: str, nav_items: NavItems, description: str | None = None
) -> document:
    with BaseWithNav(request, nav_items, title) as doc:
        main = doc.getElementById("main")
        with main:
            h1(title, cls="text-lg font-bold")
            if description:
                p(description)

    return doc
