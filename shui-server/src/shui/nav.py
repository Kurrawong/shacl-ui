from collections.abc import Callable, Coroutine
from contextlib import AsyncExitStack
from typing import Optional

from bs4 import BeautifulSoup
from dominate.tags import a, div, li, span, ul
from fastapi import Request
from fastapi.dependencies.utils import get_dependant, solve_dependencies
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware

from shui.auth.consts import USER_AUTH_COOKIE_NAME
from shui.content_type import ContentTypeService, get_content_type_service
from shui.html.shoelace import sl_icon
from shui.redis import redis

type NavItems = list[NavGroup | NavItem]


class NavItem(BaseModel):
    label: str
    href: str
    icon: Optional[str] = None


class NavGroup(BaseModel):
    label: str
    items: list[NavItem]
    icon: Optional[str] = None


async def get_nav_items(request, content_type_service: ContentTypeService):
    content_types = await content_type_service.get_list()
    nav_items = [
        NavItem(label="Manage Content Types", href="#", icon="database-fill-gear")
    ]
    content_type_nav_items = [
        NavItem(
            label=content_type.label,
            href=str(
                request.url_for("collection_route", collection_id=content_type.id)
            ),
            icon="dot",
        )
        for content_type in content_types
    ]
    content_type_group = NavGroup(
        label="Content Types", items=content_type_nav_items, icon="boxes"
    )
    nav_items.append(content_type_group)
    return nav_items


def get_nav_html(nav_items: NavItems) -> str:
    with ul(data_hx_boost="false") as component:
        for nav_item in nav_items:
            if isinstance(nav_item, NavItem):
                with li(cls="p-2 hover:bg-blue-100"):
                    with a(
                        href=nav_item.href,
                        cls="block space-x-2 flex items-center text-base",
                    ):
                        if nav_item.icon:
                            sl_icon(name=nav_item.icon)
                        span(nav_item.label)
            elif isinstance(nav_item, NavGroup):
                with div(
                    cls="p-2 flex items-center text-base font-semibold space-x-2 border-t"
                ):
                    if nav_item.icon:
                        sl_icon(name=nav_item.icon)
                    span(nav_item.label)

                with ul():
                    for group_nav_item in nav_item.items:
                        with li(cls="hover:bg-blue-100"):
                            with a(
                                href=group_nav_item.href,
                                cls="pt-1 pr-1 pb-1 pl-3 block space-x-1 flex items-center text-sm",
                            ):
                                if group_nav_item.icon:
                                    sl_icon(name=group_nav_item.icon)
                                span(group_nav_item.label)
    return component.render()


class NavMiddleware(BaseHTTPMiddleware):
    """
    A middleware to inject the application's navigation into the HTML response.
    """

    @staticmethod
    async def _is_authenticated(request: Request) -> bool:
        user_session_id = request.cookies.get(USER_AUTH_COOKIE_NAME)
        if user_session_id is None:
            return False
        user_session_key = f"{USER_AUTH_COOKIE_NAME}:{user_session_id}"
        result = await redis.get(user_session_key)
        if result:
            return True
        return False

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Coroutine[StreamingResponse]],
    ):
        response: StreamingResponse = await call_next(request)
        is_authenticated = await self._is_authenticated(request)
        if is_authenticated:
            content_type_header = response.headers.get("Content-Type")
            if content_type_header and "text/html" in content_type_header:
                async with AsyncExitStack() as stack:
                    dependant = get_dependant(
                        path=request.url.path, call=get_content_type_service
                    )
                    solved = await solve_dependencies(
                        request=request, dependant=dependant, async_exit_stack=stack
                    )
                    client = solved[0].get("client")
                    content_type_service = ContentTypeService(client)
                    nav_items = await get_nav_items(request, content_type_service)
                    content = b""
                    async for chunk in response.body_iterator:
                        content += chunk
                    soup = BeautifulSoup(content.decode("utf-8"), "html.parser")
                    nav_tag = soup.select_one("#nav")
                    if nav_tag:
                        nav_html = get_nav_html(nav_items)
                        nav_tag.append(BeautifulSoup(nav_html, "html.parser"))
                    headers = {}
                    for k, v in response.headers.items():
                        if k != "content-length":
                            headers[k] = v
                    return HTMLResponse(
                        soup.prettify(), response.status_code, headers=headers
                    )

        return response
