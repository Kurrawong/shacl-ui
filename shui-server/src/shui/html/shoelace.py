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

    def __init__(self, *args, disabled: bool = False, **kwargs):
        self.tagname = "sl-button"
        if disabled:
            super().__init__(*args, disabled="", **kwargs)
        else:
            super().__init__(*args, **kwargs)


class sl_button_group(html_tag):
    """
    Shoelace Button Group.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-button-group"
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
    Shoelace Icon.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-icon"
        super().__init__(*args, content=content, **kwargs)


class sl_icon_button(html_tag):
    """
    Shoelace Icon Button.
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


class sl_menu(html_tag):
    """
    Shoelace Menu.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-menu"
        super().__init__(*args, content=content, **kwargs)


class sl_menu_item(html_tag):
    """
    Shoelace Menu Item.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-menu-item"
        super().__init__(*args, content=content, **kwargs)


class sl_spinner(html_tag):
    """
    Shoelace Spinner.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-spinner"
        super().__init__(*args, content=content, **kwargs)


class sl_tooltip(html_tag):
    """
    Shoelace Tooltip.
    """

    def __init__(self, content: str = None, *args, **kwargs):
        self.tagname = "sl-tooltip"
        super().__init__(*args, content=content, **kwargs)