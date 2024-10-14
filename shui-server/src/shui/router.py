import traceback
from textwrap import dedent
from uuid import uuid4

from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import HTMLResponse, JSONResponse
from loguru import logger
from rdflib import RDF, Namespace

from shui.auth.core import current_active_user
from shui.auth.models import User
from shui.collection import CollectionService, get_collection_service
from shui.content_type import ContentTypeService, get_content_type_service
from shui.html.flash import flash
from shui.html.pages.collections import CollectionsListPage
from shui.html.pages.error import ErrorPage
from shui.html.pages.index import IndexPage
from shui.html.pages.record import RecordPage, li_change_events
from shui.namespaces import CRUD, EVENT
from shui.record import RecordService, get_record_service
from shui.shacl import ShaclService, get_shacl_service

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def home_route(
    request: Request,
    user: User = Depends(current_active_user),
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
            q,
            collection_id,
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
    content_type_service: ContentTypeService = Depends(get_content_type_service),
    record_service: RecordService = Depends(get_record_service),
    shacl_service: ShaclService = Depends(get_shacl_service),
):
    content_type = await content_type_service.get_one_by_id(collection_id)
    graph_name = content_type.value(CRUD.graph)
    record_data = await record_service.get_one_by_iri(iri, graph_name)
    node_shape_iri = content_type.value(CRUD.nodeShape)
    node_shape_graph = await shacl_service.get_nodeshape_graph_closure(node_shape_iri)
    node_shape_data = node_shape_graph.serialize(format="ntriples")
    submission_url = str(
        request.url_for(
            "record_submit_route", collection_id=collection_id
        ).include_query_params(iri=iri)
    )
    change_events = await record_service.get_change_events(
        iri, 1, 10, [str(EVENT.accepted)]
    )
    page = await RecordPage(
        request,
        user,
        collection_id,
        iri,
        graph_name,
        node_shape_iri,
        node_shape_data,
        record_data,
        submission_url,
        change_events,
    )
    return HTMLResponse(page.render())


@router.post("/collections/{collection_id}/items")
async def record_submit_route(
    request: Request,
    collection_id: str,
    iri: str,
    user: User = Depends(current_active_user),
    record_service: RecordService = Depends(get_record_service),
):
    try:
        body = await request.body()
        patch_log = body.decode("utf-8")
        await record_service.create_change_event(user.id, iri, patch_log)
        flash(request, "Changes saved.")
        return JSONResponse(
            {
                "redirect": str(
                    request.url_for(
                        "record_route", collection_id=collection_id
                    ).include_query_params(iri=iri)
                )
            },
            status_code=status.HTTP_200_OK,
        )
    except Exception as err:
        return JSONResponse(
            {"detail": f"Failed to save changes. {err}"},
            status_code=status.HTTP_400_BAD_REQUEST,
        )


@router.get("/collections/{collection_id}/new")
async def record_new_route(
    request: Request,
    collection_id: str,
    user: User = Depends(current_active_user),
    content_type_service: ContentTypeService = Depends(get_content_type_service),
):
    content_type = await content_type_service.get_one_by_id(collection_id)
    graph_name = content_type.value(CRUD.graph)
    namespace = Namespace(content_type.value(CRUD.namespace))
    iri = namespace[str(uuid4())]
    target_class = content_type.value(CRUD.targetClass)
    record_data = f"<{iri}> a <{target_class}> {graph_name} ."
    node_shape = content_type.value(CRUD.nodeShape)
    submission_url = str(
        request.url_for(
            "record_new_submit_route", collection_id=collection_id
        ).include_query_params(iri=iri)
    )
    page = await RecordPage(
        request,
        user,
        collection_id,
        iri,
        graph_name,
        node_shape,
        record_data,
        submission_url,
        [],
    )
    return HTMLResponse(page.render())


@router.post("/collections/{collection_id}/new")
async def record_new_submit_route(
    request: Request,
    collection_id: str,
    iri: str,
    user: User = Depends(current_active_user),
    content_type_service: ContentTypeService = Depends(get_content_type_service),
    record_service: RecordService = Depends(get_record_service),
):
    try:
        body = await request.body()
        patch_log = body.decode("utf-8")
        content_type = await content_type_service.get_one_by_id(collection_id)
        graph_name = content_type.value(CRUD.graph)
        target_class = content_type.value(CRUD.targetClass)
        patch_log_containing_class_statement = dedent(f"""\
            TX .
            A <{iri}> <{RDF.type}> <{target_class}> <{graph_name}> .
            TC .
        """)
        await record_service.create_change_event(
            user.id, iri, patch_log_containing_class_statement + patch_log
        )
        flash(request, "Changes saved.")
        return JSONResponse(
            {
                "redirect": str(
                    request.url_for(
                        "record_route", collection_id=collection_id
                    ).include_query_params(iri=iri)
                )
            },
            status_code=status.HTTP_200_OK,
        )
    except Exception as err:
        return JSONResponse(
            {"detail": f"Failed to save changes. {err}"},
            status_code=status.HTTP_400_BAD_REQUEST,
        )


@router.get("/collections/{collection_id}/items/change-events")
async def record_change_events_route(
    request: Request,
    collection_id: str,
    iri: str,
    page: int = 1,
    per_page: int = 10,
    action_status: list[str] = (str(EVENT.accepted),),
    record_service: RecordService = Depends(get_record_service),
):
    change_events = await record_service.get_change_events(
        iri,
        page,
        per_page,
        action_status,
    )
    print(len(change_events))
    component = li_change_events(request, collection_id, iri, change_events, page + 1)
    return HTMLResponse(component.render())
