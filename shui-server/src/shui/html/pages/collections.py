import textwrap

from dominate import document
from dominate.tags import a, div, form, h1, input_, li, p, ul
from fastapi import Request

from shui.auth.models import User
from shui.html.shoelace import sl_button, sl_button_group, sl_link_button

from ...collection import CollectionItem
from ...content_type import ContentType
from ..colours import PageColours
from .base import BasePage

TEXTWRAP_SHORTEN_WIDTH = 200
TEXTWRAP_SHORTEN_PLACEHOLDER = "..."


async def CollectionsListPage(
    request: Request,
    q: str,
    collection_id: str,
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
                with div(cls="flex pb-4"):
                    h1(title, cls=f"text-xl text-[{PageColours.text_primary.value}]")
                    with div(cls="grow flex flex-row-reverse"):
                        sl_link_button(
                            "Create",
                            href=request.url_for(
                                "record_new_route", collection_id=collection_id
                            ),
                            data_hx_boost="true",
                        )

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

                with ul(id="results", cls="space-y-2", data_hx_boost="true"):
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
                    sl_link_button(
                        "Previous page",
                        href=request.url_for(
                            "collection_route", collection_id=content_type.id
                        ).include_query_params(
                            page=current_page - 1, per_page=per_page
                        ),
                        disabled=False if has_previous else True,
                    )
                    sl_button(f"{current_page} of {total_pages}", disabled=True)
                    sl_link_button(
                        "Next page",
                        href=request.url_for(
                            "collection_route", collection_id=content_type.id
                        ).include_query_params(
                            page=current_page + 1, per_page=per_page
                        ),
                        disabled=False if has_next else True,
                    )

    return doc
