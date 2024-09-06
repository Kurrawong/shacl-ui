from dominate import document
from dominate.tags import a, div, form, input_, li, p, ul
from fastapi import Request

from shui.auth.models import User
from shui.nav import NavItems

from ...collection import CollectionItem
from ...content_type import ContentType
from ..colours import PageColours
from .base_with_nav import BaseWithNav


async def CollectionsListPage(
    request: Request,
    nav_items: NavItems,
    q: str,
    content_type: ContentType,
    collection_items: list[CollectionItem],
    count: int,
    user: User | None,
) -> document:
    title = content_type.label
    with BaseWithNav(request, nav_items, title, user) as doc:
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
                        with li(cls="border-t pt-2 min-h-16 max-h-32 space-y-1"):
                            a(
                                item.label,
                                cls="font-semibold underline",
                                href=request.url_for(
                                    "record_route", collection_id=content_type.id
                                ).include_query_params(iri=item.iri),
                            )
                            div(item.description, cls="text-sm")

    return doc
