from textwrap import dedent

from dominate.tags import div, html_tag, link, script
from fastapi import Request
from jinja2 import Template


def shui_form(
    request: Request,
    iri: str,
    graph_name: str,
    node_shape_iri: str,
    node_shape_data: str,
    data: str,
    submission_url: str,
    sparql_url: str,
) -> html_tag:
    with div(id="shui-form") as component:
        form = ShuiForm()
        form["focus-node"] = iri
        form["graph-name"] = graph_name
        form["node-shape"] = node_shape_iri
        form["node-shape-data"] = node_shape_data
        form["data"] = data
        form["submission-url"] = submission_url
        form["sparql-url"] = sparql_url
        # TODO: add csrf token

        import_url = request.url_for("static", path="shui.js")
        link(rel="stylesheet", href=request.url_for("static", path="shui.css"))
        script(src=import_url, type="module")
        s = script(type="module")
        s.add_raw_string(
            dedent(
                Template(
                    """
                    import { createApp, PrimeVue, Aura, Tooltip, ToastService, ShuiForm } from "{{ import_url }}"

                    const app = createApp({
                        components: {
                            ShuiForm,
                        }
                    })
                    app.config.compilerOptions.isCustomElement = (tag) => {
                        return tag.startsWith('sl-')
                    }
                    app.use(PrimeVue, {
                        unstyled: true,
                        pt: Aura,
                    })
                    app.directive('tooltip', Tooltip)
                    app.use(ToastService);
                    app.mount('#shui-form')
                    """
                ).render(import_url=import_url)
            )
        )

    return component


class ShuiForm(html_tag):
    def __init__(self, *args, **kwargs):
        self.tagname = "shui-form"
        super().__init__(*args, **kwargs)
