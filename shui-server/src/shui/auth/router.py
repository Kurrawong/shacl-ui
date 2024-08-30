import traceback

from fastapi import APIRouter, Depends, FastAPI, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_users import schemas
from fastapi_users.authentication import RedisStrategy
from fastapi_users.exceptions import InvalidPasswordException, UserAlreadyExists
from loguru import logger

from shui.auth.dependencies import get_user_manager
from shui.auth.manager import UserManager
from shui.html.flash import flash

from .backends import auth_backend
from .consts import USER_AUTH_COOKIE_NAME
from .core import current_user
from .forms import LoginForm, RegistrationForm
from .models import User
from .pages.login import LoginPage
from .pages.registration import RegistrationPage

router = APIRouter()


def register_auth_routes(app: FastAPI) -> None:
    # app.include_router(
    #     fastapi_users.get_auth_router(auth_backend), prefix="/auth", tags=["auth"]
    # )
    # app.include_router(
    #     fastapi_users.get_register_router(schemas.BaseUser, schemas.BaseUserCreate),
    #     prefix="/auth",
    #     tags=["auth"],
    # )
    # app.include_router(
    #     fastapi_users.get_reset_password_router(),
    #     prefix="/auth",
    #     tags=["auth"],
    # )
    # app.include_router(
    #     fastapi_users.get_verify_router(schemas.BaseUser),
    #     prefix="/auth",
    #     tags=["auth"],
    # )
    # app.include_router(
    #     fastapi_users.get_users_router(schemas.BaseUser, schemas.BaseUserUpdate),
    #     prefix="/users",
    #     tags=["users"],
    # )
    # app.include_router(
    #     fastapi_users.get_auth_router(jwt_backend),
    #     prefix="/auth/jwt",
    #     tags=["auth"],
    # )
    app.include_router(router, prefix="/auth/ui", tags=["auth-ui"])


@router.get("/registration")
async def registration_route(
    request: Request, next_url: str = "", user: User | None = Depends(current_user)
):
    if user is not None:
        flash(request, "You cannot register for a new account while loggeed in.")
        return RedirectResponse(
            request.url_for("home_route"), status.HTTP_303_SEE_OTHER
        )
    form = RegistrationForm(request)
    csrf_token = form.current_csrf_token
    return HTMLResponse(RegistrationPage(request, csrf_token, next_url).render())


@router.post("/registration")
async def registration_submit_route(
    request: Request,
    next_url: str = "",
    user_manager: UserManager = Depends(get_user_manager),
):
    form = await RegistrationForm.from_formdata(request)
    if await form.validate_on_submit():
        try:
            user = await user_manager.create(
                schemas.BaseUserCreate(
                    email=form.username.data,
                    password=form.password.data,
                    is_active=True,
                )
            )
            flash(
                request,
                f"Your account with username {user.email} has been created. Welcome.",
            )
            return RedirectResponse(
                request.url_for("home_route"), status.HTTP_303_SEE_OTHER
            )
        except UserAlreadyExists:
            flash(
                request, f"The username {form.username.data} already exists.", "danger"
            )
        except InvalidPasswordException:
            flash(request, "The password contains invalid characters.", "danger")
        except Exception as err:
            logger.error(traceback.print_exc())
            flash(request, f"Error: {err}", "danger")
    else:
        flash(request, f"Form error occurred: {form.errors}", "danger")
    csrf_token = form.current_csrf_token
    return HTMLResponse(RegistrationPage(request, csrf_token, next_url).render())


@router.get("/login", response_class=HTMLResponse)
async def login_route(
    request: Request, next_url: str = "", user: User | None = Depends(current_user)
):
    if user is not None and user.is_active:
        if not next_url:
            return RedirectResponse(
                request.url_for("home_route"), status.HTTP_303_SEE_OTHER
            )
        return RedirectResponse(next_url, status.HTTP_303_SEE_OTHER)
    if next_url:
        flash(request, f"You need to be logged in to access {next_url}", "warning")
    form = LoginForm(request)
    csrf_token = form.current_csrf_token
    return HTMLResponse(LoginPage(request, csrf_token, next_url).render())


@router.post("/login", response_class=HTMLResponse)
async def login_submit_route(
    request: Request,
    next_url: str = "",
    user_manager: UserManager = Depends(get_user_manager),
    strategy: RedisStrategy = Depends(auth_backend.get_strategy),
):
    form = await LoginForm.from_formdata(request)
    if await form.validate_on_submit():
        try:
            credentials = OAuth2PasswordRequestForm(
                username=form.username.data, password=form.password.data
            )
            user = await user_manager.authenticate(credentials)
            if user is None:
                flash(request, "Invalid username or password.", "danger")
            if user and user.is_active:
                response = await auth_backend.login(strategy, user)
                await user_manager.on_after_login(user, request, response)
                headers = response.headers
                if not next_url:
                    return RedirectResponse(
                        request.url_for("home_route"),
                        status.HTTP_303_SEE_OTHER,
                        headers=headers,
                    )
                return RedirectResponse(
                    next_url, status.HTTP_303_SEE_OTHER, headers=headers
                )
            if user and not user.is_active:
                flash(
                    request,
                    "Your account has not been activated yet. Please contact an administrator to activate your account.",
                    "warning",
                )
        except Exception as err:
            logger.error(traceback.print_exc())
            flash(request, f"Error: {err}", "danger")
    else:
        flash(request, f"Form error occurred: {form.errors}", "dangers")
    csrf_token = form.csrf_token.current_token
    return HTMLResponse(LoginPage(request, csrf_token, next_url).render())


@router.get("/logout")
async def logout_route(
    request: Request,
    user: User = Depends(current_user),
    strategy: RedisStrategy = Depends(auth_backend.get_strategy),
):
    if user:
        token = request.cookies.get(USER_AUTH_COOKIE_NAME)
        await auth_backend.logout(strategy, user, token)
    return RedirectResponse(request.url_for("login_route"), status.HTTP_303_SEE_OTHER)
