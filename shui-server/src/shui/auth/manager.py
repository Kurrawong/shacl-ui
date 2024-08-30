from typing import Any, Optional

from fastapi import Request
from fastapi_users import BaseUserManager, models
from loguru import logger

from shui.settings import settings

from .models import User


class UserManager(BaseUserManager):
    reset_password_token_secret = settings.secret_key
    verification_token_secret = settings.secret_key

    def parse_id(self, value: Any) -> models.ID:
        # TODO: anything to do here?
        return value

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        logger.debug(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        logger.debug(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        logger.debug(
            f"Verification requested for user {user.id}. Verification token: {token}"
        )
