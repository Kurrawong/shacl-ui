from fastapi_users import FastAPIUsers

from .backends import auth_backend, jwt_backend
from .dependencies import get_user_manager
from .models import User

fastapi_users = FastAPIUsers[User, str](get_user_manager, [auth_backend, jwt_backend])

current_active_user = fastapi_users.current_user(active=True)
current_user = fastapi_users.current_user(True)
