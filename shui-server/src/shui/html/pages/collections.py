import textwrap

from dominate import document
from dominate.tags import a, div, form, input_, li, p, ul
from fastapi import Request

from shui.auth.models import User
from shui.html.shoelace import sl_button, sl_button_group
from shui.nav import NavItems

from ...collection import CollectionItem
from ...content_type import ContentType
from ..colours import PageColours
from .base import BasePage

TEXTWRAP_SHORTEN_WIDTH = 200
TEXTWRAP_SHORTEN_PLACEHOLDER = "..."


async def CollectionsListPage(
    request: Request,
    nav_items: NavItems,
    q: str,
    content_type: ContentType,
    collection_items: list[CollectionItem],
    count: int,
    has_previous: bool,
    has_next: bool,
    current_page: int,
    per_page: int,
    total_pages: int,
    user: User | None,
) -> document:
    title = content_type.label
    with BasePage(request, title, user) as doc:
        main = doc.getElementById("main")
        with main:
            with div(cls="space-y-8"):
                p(title, cls=f"text-xl pb-4 text-[{PageColours.text_primary.value}]")
                p(content_type.description)

                with form(
                    data_hx_boost="true",
                    data_hx_target="body",
                    data_hx_swap="outerHTML show:body:top",
                    data_hx_trigger="sl-input delay:500ms, input delay:500ms",
                    action=request.url_for(
                        "collection_route", collection_id=content_type.id
                    ),
                    cls="space-y-2",
                ):
                    input_(
                        id="q",
                        name="q",
                        type="search",
                        value=q,
                        placeholder=f"Search for {content_type.label}",
                        autocomplete="off",
                        clearable="true",
                        autofocus="true",
                        cls="px-4 py-2 w-full rounded outline outline-gray-300 focus:outline-blue-300 focus:outline-4",
                        # set the cursor position to the end of the input value on page load.
                        script="on load set q to #q then q.setSelectionRange(-1, -1)",
                    )

                if q:
                    p(f'{count} {content_type.id} found for "{q}"', id="result-details")
                else:
                    p(f"{count} {content_type.id} found", id="result-details")

                with ul(id="results", cls="space-y-2"):
                    for item in collection_items:
                        with li(cls="border-t pt-4 pb-3 min-h-16 max-h-32 space-y-1"):
                            a(
                                item.label,
                                cls="font-semibold underline",
                                href=request.url_for(
                                    "record_route", collection_id=content_type.id
                                ).include_query_params(iri=item.iri),
                            )
                            div(
                                textwrap.shorten(
                                    item.description,
                                    width=TEXTWRAP_SHORTEN_WIDTH,
                                    placeholder=TEXTWRAP_SHORTEN_PLACEHOLDER,
                                ),
                                cls="text-sm",
                            )

                with sl_button_group(data_hx_boost="true"):
                    with a(
                        href=request.url_for(
                            "collection_route", collection_id=content_type.id
                        ).include_query_params(page=current_page - 1, per_page=per_page)
                    ):
                        sl_button(
                            "Previous page", disabled=False if has_previous else True
                        )
                    sl_button(f"{current_page} of {total_pages}", disabled=True)
                    with a(
                        href=request.url_for(
                            "collection_route", collection_id=content_type.id
                        ).include_query_params(page=current_page + 1, per_page=per_page)
                    ):
                        sl_button(
                            "Next page",
                            disabled=False if has_next else True,
                            tabindex=0,
                        )

    return doc
