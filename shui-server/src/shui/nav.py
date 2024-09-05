from typing import Optional

from pydantic import BaseModel

type NavItems = list[NavGroup | NavItem]


class NavItem(BaseModel):
    label: str
    href: str
    icon: Optional[str] = None


class NavGroup(BaseModel):
    label: str
    items: list[NavItem]
    icon: Optional[str] = None
