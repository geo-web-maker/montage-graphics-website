from slowapi import Limiter
from slowapi.util import get_remote_address

# Keyed by client IP. Render sits behind a proxy, so make sure
# ProxyHeadersMiddleware / trusted forwarded headers are in play,
# otherwise every request will appear to come from the same IP.
limiter = Limiter(key_func=get_remote_address)
