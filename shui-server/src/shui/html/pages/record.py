from textwrap import dedent

from dominate.tags import div, li, ol, p, script, span
from fastapi import Request
from jinja2 import Template

from shui.auth.models import User
from shui.html.pages.base import BasePage
from shui.html.shoelace import (
    sl_avatar,
    sl_badge,
    sl_button,
    sl_dialog,
    sl_icon_button,
    sl_relative_time,
    sl_tab,
    sl_tab_group,
    sl_tab_panel,
)
from shui.html.shui import shui_form
from shui.namespaces import EVENT
from shui.record import ChangeEventTimelineItem


def li_change_events(
    request: Request,
    collection_id: str,
    iri: str,
    change_events: list[ChangeEventTimelineItem],
    page: int,
):
    with span() as component:
        if not change_events:
            li("End of timeline", cls="mb-10 ms-4 text-gray-600")
            return component

        for i, change_event in enumerate(change_events):
            with li(
                cls="mb-10 ms-4",
                data_hx_trigger="intersect once",
                data_hx_swap="afterend",
                data_hx_get=request.url_for(
                    "record_change_events_route",
                    collection_id=collection_id,
                ).include_query_params(iri=iri, page=page)
                if i == len(change_events) - 1
                else None,
            ):
                change_event_id = f"A{change_event.id.split(':')[-1]}"
                div(
                    cls="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"
                )
                sl_relative_time(
                    date=change_event.start_time,
                    cls="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500",
                )

                if change_event.action_status == str(EVENT.accepted):
                    sl_badge(
                        change_event.action_status.split("#")[-1].split("/")[-1],
                        cls="pl-1",
                        variant="success",
                        pill="",
                    )
                elif change_event.action_status == str(EVENT.pending):
                    sl_badge(
                        change_event.action_status.split("#")[-1].split("/")[-1],
                        cls="pl-1",
                        pill="",
                    )
                elif change_event.action_status == str(EVENT.rejected):
                    sl_badge(
                        change_event.action_status.split("#")[-1].split("/")[-1],
                        cls="pl-1",
                        variant="danger",
                        pill="",
                    )
                else:
                    sl_badge(
                        change_event.action_status.split("#")[-1].split("/")[-1],
                        cls="pl-1",
                        variant="neutral",
                        pill="",
                    )

                with div(cls="ml-[-0.6rem]"):
                    with sl_dialog(
                        id=change_event_id,
                        label="Changes",
                        cls="dialog-overview",
                        style="--width: 80vw",
                    ):
                        with div(cls="change-event-diff"):
                            for line in change_event.result.text.split("\n"):
                                div(
                                    line,
                                    cls=f"{line[0]}-line",
                                )
                        sl_button(
                            "Close",
                            slot="footer",
                            variant="primary",
                        )

                    with div():
                        sl_icon_button(
                            cls="translate-y-[0.1rem] mr-[-0.5rem]",
                            name="file-diff",
                        )
                        p(
                            change_event.description or "No description",
                            cls="inline text-base font-normal text-gray-800 hover:cursor-pointer hover:text-blue-600 hover:underline",
                        )

                with div(cls="pt-1 text-sm text-gray-600"):
                    sl_avatar(
                        cls="translate-y-[-0.08rem]",
                        style="--size: 15px",
                    )
                    span(change_event.agent.name)

            s = script()
            s.add_raw_string(
                dedent(
                    Template(
                        """
                        (function () {
                            const dialog = document.querySelector("#{{ change_event_id }}");
                            const openButton = dialog.nextElementSibling;
                            const closeButton = dialog.querySelector('sl-button[slot="footer"]');
    
                            openButton.addEventListener('click', () => dialog.show());
                            closeButton.addEventListener('click', () => dialog.hide());
                        })()
                    """
                    ).render(change_event_id=change_event_id)
                )
            )

    return component


async def RecordPage(
    request: Request,
    user: User,
    collection_id: str,
    iri: str,
    graph_name: str,
    node_shape_iri: str,
    node_shape_data: str,
    data: str,
    submission_url: str,
    change_events: list[ChangeEventTimelineItem],
):
    title = ""
    with BasePage(request, title, user) as doc:
        main = doc.getElementById("main")
        with main:
            with div(cls="flex flex-row h-[calc(100vh-10rem)]"):
                with div(cls="w-full overflow-y-auto space-y-8 pr-3"):
                    shui_form(
                        request,
                        iri,
                        graph_name,
                        node_shape_iri,
                        node_shape_data,
                        data,
                        submission_url,
                    )

                with div(cls="w-[20rem] overflow-y-auto"):
                    with sl_tab_group():
                        sl_tab("History", slot="nav", panel="history")
                        with sl_tab_panel(name="history", cls="px-4"):
                            if change_events:
                                with ol(
                                    cls="relative border-s border-gray-200 dark:border-gray-700"
                                ):
                                    li_change_events(
                                        request, collection_id, iri, change_events, 2
                                    )
                            else:
                                p("No changes.")

    return doc
