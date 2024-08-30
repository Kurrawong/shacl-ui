from dominate.tags import html_tag


class sl_alert(html_tag):
    """
    Shoelace Alert
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-alert"
        super().__init__(*args, content=content, **kwargs)


class sl_button(html_tag):
    """
    Shoelace Button.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-button"
        super().__init__(*args, content=content, **kwargs)


class sl_card(html_tag):
    """
    Shoelace Card.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-card"
        super().__init__(*args, content=content, **kwargs)


class sl_copy_button(html_tag):
    """
    Shoelace Copy Button.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-copy-button"
        super().__init__(*args, content=content, **kwargs)


class sl_details(html_tag):
    """
    Shoelace Details.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-details"
        super().__init__(*args, content=content, **kwargs)


class sl_icon(html_tag):
    """
    Shoelace Input.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-icon"
        super().__init__(*args, content=content, **kwargs)


class sl_icon_button(html_tag):
    """
    Shoelace Input.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-icon-button"
        super().__init__(*args, content=content, **kwargs)


class sl_input(html_tag):
    """
    Shoelace Input.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-input"
        super().__init__(*args, content=content, **kwargs)


class sl_tooltip(html_tag):
    """
    Shoelace Tooltip.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-tooltip"
        super().__init__(*args, content=content, **kwargs)
