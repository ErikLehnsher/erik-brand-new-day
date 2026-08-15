from dataclasses import dataclass


@dataclass(frozen=True)
class EmailMessage:
    to: str
    subject: str
    body: str


class EmailSender:
    async def send(self, message: EmailMessage) -> None:
        raise NotImplementedError


class ConsoleEmailSender(EmailSender):
    async def send(self, message: EmailMessage) -> None:
        print(f"[email] to={message.to} subject={message.subject}\n{message.body}")

