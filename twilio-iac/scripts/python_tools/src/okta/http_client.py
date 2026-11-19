# Small urllib wrapper for the okta scripts: returns error responses (4xx/5xx) instead of raising,
# so callers can read Okta's error body and headers (e.g. the DPoP nonce).

import json
from dataclasses import dataclass
from email.message import Message
from urllib import error as urllib_error, request

USER_AGENT = 'aselo-twilio-iac-okta-scripts'


@dataclass
class HttpResponse:
    status: int
    headers: Message
    body: bytes
    url: str

    def text(self) -> str:
        return self.body.decode('utf-8')

    def json(self):
        return json.loads(self.body)


def http_request(
    url: str,
    method: str = 'GET',
    data: bytes | None = None,
    headers: dict[str, str] | None = None,
    opener: request.OpenerDirector | None = None,
) -> HttpResponse:
    req = request.Request(url, data=data, method=method, headers={'User-Agent': USER_AGENT, **(headers or {})})
    try:
        with (opener.open(req) if opener else request.urlopen(req)) as response:
            return HttpResponse(response.status, response.headers, response.read(), response.geturl())
    except urllib_error.HTTPError as e:
        return HttpResponse(e.code, e.headers, e.read(), e.geturl())
