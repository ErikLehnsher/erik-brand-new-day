from typing import Literal

from pydantic import BaseModel, Field


class AgentChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=12000)
    engine: Literal["claude"] = "claude"


class AgentChatResponse(BaseModel):
    answer: str
    engine: str
    session: str
