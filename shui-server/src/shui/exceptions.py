class PageBaseError(Exception):
    def __init__(self, msg: str, *args: object) -> None:
        super().__init__(*args)
        self.msg = msg


class Page500Error(PageBaseError):
    """
    This is raised when an exception occurs on the server and is not specifically handled.
    """
