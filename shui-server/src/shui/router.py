from fastapi import APIRouter, Depends, Request
from fastapi.responses import HTMLResponse

from shui.auth.core import current_active_user
from shui.auth.models import User
from shui.html.pages.index import IndexPage

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def home_route(request: Request, user: User = Depends(current_active_user)):
    page = await IndexPage(request, user)
    return HTMLResponse(page.render())
