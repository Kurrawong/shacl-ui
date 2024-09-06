import traceback

from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse
from loguru import logger

from shui.auth.core import current_active_user
from shui.auth.models import User
from shui.collection import CollectionService, get_collection_service
from shui.content_type import ContentTypeService, get_content_type_service
from shui.html.pages.collections import CollectionsListPage
from shui.html.pages.error import ErrorPage
from shui.html.pages.index import IndexPage
from shui.nav import NavGroup, NavItem

router = APIRouter()


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


@router.get("/", response_class=HTMLResponse)
async def home_route(
    request: Request,
    user: User = Depends(current_active_user),
    content_type_service: ContentTypeService = Depends(get_content_type_service),
):
    nav_items = await get_nav_items(request, content_type_service)
    page = await IndexPage(request, nav_items, user)
    return HTMLResponse(page.render())


@router.get("/collections/{collection_id}")
async def collection_route(
    request: Request,
    collection_id: str,
    q: str = "",
    page: int = 1,
    per_page: int = 10,
    user: User = Depends(current_active_user),
    collection_service: CollectionService = Depends(get_collection_service),
    content_type_service: ContentTypeService = Depends(get_content_type_service),
):
    nav_items = await get_nav_items(request, content_type_service)
    try:
        content_type = await content_type_service.get_one_by_id(collection_id)
        items = await collection_service.get_list(collection_id, q, page, per_page)
        count = await collection_service.get_list_count(collection_id, q)
        page = await CollectionsListPage(
            request, nav_items, q, content_type, items, count, user
        )
        return HTMLResponse(page.render())
    except Exception as err:
        logger.error(traceback.print_exc())
        page = await ErrorPage(request, "An error has occurred.", nav_items, str(err))
        return HTMLResponse(page.render())


@router.get("/collections/{collection_id}/items")
async def record_route(
    request: Request,
    collection_id: str,
    iri: str,
    user: User = Depends(current_active_user),
):
    return iri
