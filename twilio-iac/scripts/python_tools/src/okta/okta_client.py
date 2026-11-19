# Minimal, read-only Okta Management API client for the okta scripts.
# Auth: OAuth 2.0 API Services app with private_key_jwt + DPoP (no API tokens).
#
# Environment variables:
#   OKTA_ORG_URL            default https://techmatters.okta.com
#   OKTA_CLIENT_ID          client id of a read-only API Services app (not a secret)
#   OKTA_PRIVATE_KEY_PATH   path to its private key, PEM or JWK (.json). Kept outside any repo.
#   OKTA_KEY_ID             optional "kid"; a JWK's own kid is used otherwise
#
# The private key and access tokens are never printed or written to disk.

import base64
import hashlib
import json
import os
import re
import time
import uuid
from urllib import parse

from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, padding, rsa
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature

from .http_client import http_request

READ_SCOPES = ['okta.apps.read', 'okta.groups.read', 'okta.policies.read']

ORG_URL = os.environ.get('OKTA_ORG_URL', 'https://techmatters.okta.com').rstrip('/')


def require_env(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise Exception(
            f'Missing environment variable {name} (see twilio-iac/scripts/python_tools/src/okta/README.md)')
    return value


def base64url(data: bytes | str) -> str:
    if isinstance(data, str):
        data = data.encode('utf-8')
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('ascii')


def _base64url_to_int(value: str) -> int:
    return int.from_bytes(base64.urlsafe_b64decode(value + '=' * (-len(value) % 4)), 'big')


def _encode_jwt(header: dict, payload: dict) -> str:
    return f'{base64url(json.dumps(header, separators=(",", ":")))}.{base64url(json.dumps(payload, separators=(",", ":")))}'


def _load_private_key():
    with open(require_env('OKTA_PRIVATE_KEY_PATH'), encoding='utf-8') as key_file:
        raw = key_file.read()
    if raw.strip().startswith('{'):
        jwk = json.loads(raw)
        if jwk.get('kty') != 'RSA':
            raise Exception('OKTA_PRIVATE_KEY_PATH must be an RSA key (the client assertion is RS256)')
        public_numbers = rsa.RSAPublicNumbers(_base64url_to_int(jwk['e']), _base64url_to_int(jwk['n']))
        key = rsa.RSAPrivateNumbers(
            p=_base64url_to_int(jwk['p']),
            q=_base64url_to_int(jwk['q']),
            d=_base64url_to_int(jwk['d']),
            dmp1=_base64url_to_int(jwk['dp']),
            dmq1=_base64url_to_int(jwk['dq']),
            iqmp=_base64url_to_int(jwk['qi']),
            public_numbers=public_numbers,
        ).private_key()
        return key, os.environ.get('OKTA_KEY_ID') or jwk.get('kid')
    return serialization.load_pem_private_key(raw.encode('utf-8'), password=None), os.environ.get('OKTA_KEY_ID')


def _build_client_assertion() -> str:
    client_id = require_env('OKTA_CLIENT_ID')
    now = int(time.time())
    key, kid = _load_private_key()
    header = {'alg': 'RS256', 'typ': 'JWT', **({'kid': kid} if kid else {})}
    payload = {
        'iss': client_id,
        'sub': client_id,
        'aud': f'{ORG_URL}/oauth2/v1/token',
        'iat': now,
        'exp': now + 300,
        'jti': str(uuid.uuid4()),
    }
    unsigned = _encode_jwt(header, payload)
    signature = key.sign(unsigned.encode('ascii'), padding.PKCS1v15(), hashes.SHA256())
    return f'{unsigned}.{base64url(signature)}'


# DPoP: a throwaway key pair per run, kept only in memory
_dpop_key = ec.generate_private_key(ec.SECP256R1())
_dpop_public_numbers = _dpop_key.public_key().public_numbers()
_dpop_public_jwk = {
    'kty': 'EC',
    'crv': 'P-256',
    'x': base64url(_dpop_public_numbers.x.to_bytes(32, 'big')),
    'y': base64url(_dpop_public_numbers.y.to_bytes(32, 'big')),
}


def _build_dpop_proof(method: str, url: str, nonce: str | None = None, access_token: str | None = None) -> str:
    parts = parse.urlsplit(url)
    header = {'typ': 'dpop+jwt', 'alg': 'ES256', 'jwk': _dpop_public_jwk}
    payload = {
        'htm': method,
        'htu': f'{parts.scheme}://{parts.netloc}{parts.path}',
        'iat': int(time.time()),
        'jti': str(uuid.uuid4()),
    }
    if nonce:
        payload['nonce'] = nonce
    if access_token:
        payload['ath'] = base64url(hashlib.sha256(access_token.encode('ascii')).digest())
    unsigned = _encode_jwt(header, payload)
    # JWS wants the raw r || s signature, not the DER encoding cryptography returns
    r, s = decode_dss_signature(_dpop_key.sign(unsigned.encode('ascii'), ec.ECDSA(hashes.SHA256())))
    return f'{unsigned}.{base64url(r.to_bytes(32, "big") + s.to_bytes(32, "big"))}'


_cached_token: str | None = None
_cached_token_expires_at = 0.0


def _request_token(nonce: str | None = None):
    token_url = f'{ORG_URL}/oauth2/v1/token'
    body = parse.urlencode({
        'grant_type': 'client_credentials',
        'scope': ' '.join(READ_SCOPES),
        'client_assertion_type': 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        'client_assertion': _build_client_assertion(),
    }).encode('ascii')
    return http_request(token_url, method='POST', data=body, headers={
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'DPoP': _build_dpop_proof('POST', token_url, nonce=nonce),
    })


def _get_access_token() -> str:
    global _cached_token, _cached_token_expires_at
    if _cached_token and time.time() < _cached_token_expires_at - 60:
        return _cached_token

    response = _request_token()
    body = json.loads(response.body or b'{}')
    if response.status != 200 and body.get('error') == 'use_dpop_nonce':
        response = _request_token(response.headers.get('dpop-nonce'))
        body = json.loads(response.body or b'{}')
    if response.status != 200:
        raise Exception(
            f'Okta token request failed ({response.status}): {body.get("error")} - {body.get("error_description")}')

    _cached_token = body['access_token']
    _cached_token_expires_at = time.time() + body['expires_in']
    return _cached_token


def _get_next_link(link_headers: list[str]) -> str | None:
    # Okta sends one Link header per relation (self, next)
    for link in ','.join(link_headers).split(','):
        if 'rel="next"' in link:
            return re.search(r'<([^>]+)>', link).group(1)
    return None


def okta_get(path: str, accept: str = 'application/json'):
    '''
    GET an Okta API path, following pagination and waiting out rate limits.
    Returns a list for list endpoints, the parsed object otherwise, or text when accept is not JSON.
    '''
    url = path if path.startswith('http') else f'{ORG_URL}{path}'
    results = None

    while url:
        access_token = _get_access_token()
        response = http_request(url, headers={
            'Authorization': f'DPoP {access_token}',
            'DPoP': _build_dpop_proof('GET', url, access_token=access_token),
            'Accept': accept,
        })

        if response.status == 429:
            wait_seconds = max(int(response.headers.get('x-rate-limit-reset', '0')) - time.time(), 1)
            print(f'⏳ Okta rate limit, waiting {int(wait_seconds) + 1}s...')
            time.sleep(wait_seconds)
            continue
        if response.status != 200:
            raise Exception(f'GET {url} failed ({response.status}): {response.text()}')
        if accept != 'application/json':
            return response.text()

        data = response.json()
        if not isinstance(data, list):
            return data
        results = (results or []) + data
        url = _get_next_link(response.headers.get_all('link') or [])

    return results or []


def find_app_by_label(label: str):
    '''Active SAML app with exactly this label, or None.'''
    apps = okta_get(f'/api/v1/apps?q={parse.quote(label)}&limit=200')
    matches = [app for app in apps if app['label'] == label and app['status'] == 'ACTIVE']
    if len(matches) > 1:
        raise Exception(f'More than one active Okta app labelled "{label}"')
    return matches[0] if matches else None
