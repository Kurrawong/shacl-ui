from dominate import document
from dominate.tags import a, div, li, span, ul
from fastapi import Request

from shui.nav import NavGroup, NavItem, NavItems

from ...auth.models import User
from ..shoelace import sl_icon
from .base import BasePage


def BaseWithNav(
    request: Request, nav_items: NavItems, title: str, user: User = None
) -> document:
    with BasePage(request, title, user) as doc:
        nav = doc.getElementById("nav")
        with nav:
            with ul(data_hx_boost="true"):
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
                                with li(cls="pt-1 pr-1 pb-1 pl-3 hover:bg-blue-100"):
                                    with a(
                                        href=group_nav_item.href,
                                        cls="block space-x-1 flex items-center text-sm",
                                    ):
                                        if group_nav_item.icon:
                                            sl_icon(name=group_nav_item.icon)
                                        span(group_nav_item.label)

    return doc
