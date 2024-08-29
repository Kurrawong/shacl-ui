from starlette_wtf import StarletteForm
from wtforms import (
    PasswordField,
    StringField,
    validators,
)


class Form(StarletteForm):
    @property
    def current_csrf_token(self):
        return self.csrf_token.current_token


class LoginForm(Form):
    username = StringField("username", [validators.InputRequired(), validators.Email()])
    password = PasswordField("password", [validators.InputRequired()])


class RegistrationForm(LoginForm): ...
