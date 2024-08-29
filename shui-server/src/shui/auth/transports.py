from fastapi_users.authentication import BearerTransport, CookieTransport

from .consts import USER_AUTH_COOKIE_NAME

# TODO: make cookie name configurable
cookie_transport = CookieTransport(
    cookie_name=USER_AUTH_COOKIE_NAME,
    cookie_max_age=None,  # session cookie
    cookie_secure=True,
    cookie_httponly=True,
    cookie_samesite="lax",
)

# TODO: make token url configurable
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")
