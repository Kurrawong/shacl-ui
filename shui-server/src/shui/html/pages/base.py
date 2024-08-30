from dominate import document
from dominate.tags import (
    a,
    body,
    div,
    li,
    link,
    main,
    meta,
    nav,
    p,
    script,
    span,
    ul,
)
from fastapi import Request

from ...auth.models import User
from ..colours import PageColours
from ..flash import get_flashed_messages
from ..shoelace import sl_alert


@div(cls="content-center")
def Logo():
    a("SHUI Admin", href="/", cls="font-bold")
    p(
        "Knowledge graph resource management",
        cls=f"px-[0.2rem] italic text-xs bg-[{PageColours.bg_secondary.value}]",
    )


def NavLink(value: str, href: str):
    a(
        value,
        href=href,
        cls=f"p-2 content-center hover:bg-[{PageColours.bg_secondary.value}]",
    )


@nav(cls=f"bg-[{PageColours.bg_primary.value}]")
def Nav(request: Request, user: User):
    with div(cls="flex p-2"):
        Logo()
        with ul(cls="grow flex flex-row-reverse flex-nowrap overflow-x-auto"):
            with li(cls="flex space-x-2"):
                NavLink("Home", href=str(request.url_for("home_route")))
                if user:
                    NavLink("Log out", href=str(request.url_for("logout_route")))


def BasePage(request: Request, title: str, user: User = None) -> document:
    """
    The base HTML component for all pages.

    Slots:
      - main - the main content of the body.

    :param title: Title of the page in the HTML head.
    """
    messages = get_flashed_messages(request)

    doc = document(title=title)
    with doc.head:
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")

        # Tailwindcss
        script(src="https://cdn.tailwindcss.com")

        # HTMX
        script(src="https://unpkg.com/htmx.org@2.0.1")

        # Shoelace
        link(
            rel="stylesheet",
            media="(prefers-color-scheme:light)",
            href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.16.0/cdn/themes/light.css",
        )
        link(
            rel="stylesheet",
            media="(prefers-color-scheme:dark)",
            href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.16.0/cdn/themes/dark.css",
            onload="document.documentElement.classList.add('sl-theme-dark');",
        )
        script(
            type="module",
            src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.16.0/cdn/shoelace-autoloader.js",
        )

    with doc:
        with body():
            Nav(request, user)
            with main(id="main", cls="container mx-auto mt-2 px-2"):
                if messages:
                    with div(cls="pb-4"):
                        for message in messages:
                            alert = sl_alert(cls="sticky", variant=message["category"])
                            alert["open"] = ""
                            alert["closable"] = ""
                            alert.add(span(message["message"]))

                # Pages inheriting from base page should target element with id main
                # to slot content in.
                ...

    return doc
