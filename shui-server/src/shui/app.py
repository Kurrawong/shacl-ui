from contextlib import asynccontextmanager
from pathlib import Path
from typing import Awaitable, Callable

from fastapi import FastAPI, Request, Response, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.sessions import SessionMiddleware
from starlette_wtf import CSRFProtectMiddleware

from shui.auth.router import register_auth_routes
from shui.contrib.accept_header_parser import get_best_match
from shui.exceptions import Page500Error
from shui.html.pages.error import ErrorPage
from shui.nav import NavMiddleware
from shui.redis import redis
from shui.router import router
from shui.settings import settings

package_path = Path(__file__).parent


def register_staticfiles(app: FastAPI):
    app.mount(
        "/static", StaticFiles(directory=package_path / "html/static"), name="static"
    )


def register_error_handlers(app: FastAPI):
    @app.exception_handler(Page500Error)
    async def page_500_error_handler(request: Request, exc: Page500Error):
        title = f"Uh oh, the server failed to process your request. {exc.msg}"
        # TODO: handle nav_items
        page = await ErrorPage(request, title)
        return HTMLResponse(page.render(), status.HTTP_500_INTERNAL_SERVER_ERROR)


def register_routers(app: FastAPI):
    app.include_router(router)
    register_auth_routes(app)


def register_middlewares(app: FastAPI):
    app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)
    app.add_middleware(CSRFProtectMiddleware, csrf_secret=settings.secret_key)

    @app.middleware("auth_redirect")
    async def auth_middleware_handler(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ):
        response = await call_next(request)

        if response.status_code == 401:
            accept_header = request.headers.get("Accept")

            if "text/html" in accept_header or accept_header == "*/*":
                url = request.url_for("login_route").include_query_params(
                    next_url=request.url
                )
                return RedirectResponse(url, headers={"HX-Redirect": str(url)})

        return response

    @app.middleware("404_middleware")
    async def page_404_middleware(request: Request, call_next):
        response = await call_next(request)

        if response.status_code == 404:
            accept_header = request.headers.get("Accept")
            if get_best_match(accept_header, ["text/html"]) == "text/html":
                page = await ErrorPage(
                    request, "Error 404", f"Path {request.url.path} does not exist"
                )
                return HTMLResponse(page.render(), status.HTTP_404_NOT_FOUND)

        return response

    app.add_middleware(NavMiddleware)

    # @app.middleware("breadcrumbs_middleware")
    # async def breadcrumbs_middleware(request: Request, call_next):
    #     response = await call_next(request)
    #     print("Breadcrumb middleware")
    #     print(request.url)
    #     print(request.state.__dict__)
    #     print(request.path_params)
    #     print(request.query_params)
    #     return response


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start up health checks and other tasks.
    await redis.ping()
    yield


def create_app():
    app = FastAPI(lifespan=lifespan)
    register_staticfiles(app)
    register_middlewares(app)
    register_routers(app)
    return app


app = create_app()
