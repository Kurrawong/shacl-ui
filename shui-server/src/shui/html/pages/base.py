from textwrap import dedent

from dominate import document
from dominate.tags import (
    a,
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
from ..shoelace import sl_alert, sl_spinner


@div(cls="content-center")
def Logo():
    a("SHUI CMS", href="/", cls="font-bold hover:underline")
    p(
        "Knowledge Graph Content Management System",
        cls=f"px-[0.2rem] italic text-xs bg-[{PageColours.bg_secondary.value}]",
    )


def NavLink(value: str, href: str):
    a(
        value,
        href=href,
        cls="p-2 content-center hover:bg-blue-100",
    )


@div(cls=f"bg-[{PageColours.bg_primary.value}]", data_hx_boost="true")
def Nav(request: Request, user: User):
    with div(cls="flex p-2"):
        Logo()
        with nav(cls="grow flex flex-row-reverse flex-nowrap overflow-x-auto"):
            with ul():
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

        vue = script(type="importmap")
        vue.add_raw_string(
            dedent(
                """
            {
                "imports": {
                    "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.prod.js"
                }
            }
            """
            )
        )

        # Tailwindcss
        script(src="https://cdn.tailwindcss.com")

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

        # HTMX
        link(rel="stylesheet", href=request.url_for("static", path="htmx.css"))
        script(src="https://unpkg.com/htmx.org@2.0.1")
        script(src=request.url_for("static", path="htmx.ext.shoelace.js"))
        script(src="https://unpkg.com/hyperscript.org@0.9.12")

    doc.body["data-hx-ext"] = "shoelace"
    doc.body["data-hx-indicator"] = "#page-loading-indicator"
    with doc:
        Nav(request, user)
        with div(cls="flex flex-row h-[calc(100vh-5rem)]"):
            div(id="nav", cls="min-w-[15rem] overflow-y-auto border-r h-full")

            with div(cls="overflow-y-auto w-full"):
                with main(id="main", cls="container mx-auto p-4"):
                    if messages:
                        with div(cls="pb-4"):
                            for message in messages:
                                alert = sl_alert(
                                    cls="sticky", variant=message["category"]
                                )
                                alert["open"] = ""
                                alert["closable"] = ""
                                alert.add(span(message["message"]))

            with div(
                id="page-loading-indicator",
                cls="htmx-indicator w-screen h-screen fixed grid place-content-center",
            ):
                with div(cls="text-center"):
                    sl_spinner(style="font-size: 3rem; --track-width: 5px;")
                    div("Loading", cls="pt-3")

    return doc
