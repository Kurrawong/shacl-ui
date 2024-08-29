from typing import Awaitable, Callable

from fastapi import FastAPI, Request, Response, status
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from starlette_wtf import CSRFProtectMiddleware

from shui.auth.router import register_auth_routes
from shui.contrib.accept_header_parser import get_best_match
from shui.exceptions import Page500Error
from shui.html.pages.error import ErrorPage
from shui.router import router
from shui.settings import settings


def register_error_handlers(app: FastAPI):
    @app.exception_handler(Page500Error)
    async def page_500_error_handler(request: Request, exc: Page500Error):
        title = f"Uh oh, the server failed to process your request. {exc.msg}"
        page = await ErrorPage(request, title)
        return HTMLResponse(page.render(), status.HTTP_500_INTERNAL_SERVER_ERROR)


def register_routers(app: FastAPI):
    app.include_router(router)
    register_auth_routes(app)


def register_middlewares(app: FastAPI):
    app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)
    app.add_middleware(CSRFProtectMiddleware, csrf_secret=settings.secret_key)

    @app.middleware("http")
    async def http_middleware_handler(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ):
        response = await call_next(request)

        if response.status_code == 401:
            accept_header = request.headers.get("Accept")

            if "text/html" in accept_header:
                return RedirectResponse(
                    request.url_for("login_route").include_query_params(
                        next_url=request.url
                    )
                )

        if response.status_code == 404:
            accept_header = request.headers.get("Accept")
            if get_best_match(accept_header, ["text/html"]) == "text/html":
                page = await ErrorPage(
                    request, "Error 404", f"Path {request.url.path} does not exist"
                )
                return HTMLResponse(page.render(), status.HTTP_404_NOT_FOUND)

        return response


def create_app():
    app = FastAPI()
    register_middlewares(app)
    register_routers(app)
    return app


app = create_app()
