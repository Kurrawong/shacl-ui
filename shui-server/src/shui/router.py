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

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def home_route(
    request: Request,
    user: User = Depends(current_active_user),
    content_type_service: ContentTypeService = Depends(get_content_type_service),
):
    page = await IndexPage(request, user)
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
    current_page = page
    try:
        content_type = await content_type_service.get_one_by_id(collection_id)
        items = await collection_service.get_list(
            collection_id, q, current_page, per_page
        )
        count = await collection_service.get_list_count(collection_id, q)
        has_previous = current_page - 1 > 0
        has_next = current_page * per_page < count
        total_pages = -(count // -per_page)
        page = await CollectionsListPage(
            request,
            [],
            q,
            content_type,
            items,
            count,
            has_previous,
            has_next,
            current_page,
            per_page,
            total_pages,
            user,
        )
        return HTMLResponse(page.render())
    except Exception as err:
        logger.error(traceback.print_exc())
        page = await ErrorPage(request, "An error has occurred.", str(err))
        return HTMLResponse(page.render())


@router.get("/collections/{collection_id}/items")
async def record_route(
    request: Request,
    collection_id: str,
    iri: str,
    user: User = Depends(current_active_user),
):
    return iri