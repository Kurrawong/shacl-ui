from dominate import document
from dominate.tags import form, h1, input_, span
from fastapi import Request

from shui.html.colours import PageColours
from shui.html.pages.base import BasePage
from shui.html.shoelace import sl_button, sl_input


def RegistrationPage(request: Request, csrf_token: str, next_url: str) -> document:
    title = "Registration"
    with BasePage(request, title) as doc:
        main = doc.getElementById("main")
        with main:
            h1(
                title,
                cls=f"text-xl font-bold pb-4 text-[{PageColours.text_primary.value}]",
            )

            with form(
                action=request.url_for(
                    "registration_submit_route"
                ).include_query_params(next_url=next_url),
                method="post",
                cls="space-y-4",
            ):
                input_(
                    id="csrf_token", name="csrf_token", type="hidden", value=csrf_token
                )
                sl_input(label="Username", name="username", autocomplete="off")
                password_input = sl_input(
                    label="Password", type="password", name="password"
                )
                password_input["password-toggle"] = ""

                with sl_button(type="submit", variant="primary"):
                    span("Register")

    return doc
