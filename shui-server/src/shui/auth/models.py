from fastapi_users import schemas


class User(schemas.BaseUser[str]): ...


class UserCreate(schemas.BaseUserCreate): ...


class UserCreateDb(schemas.BaseUser[str]):
    hashed_password: str


class UserUpdate(schemas.BaseUserUpdate): ...
