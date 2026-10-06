from fastapi import FastAPI
from api.routes.routes import marketApi

# The browser only talks to Next.js, which forwards /api/* here (next.config.js),
# so requests are same-origin and need no CORS setup
app = FastAPI()

app.include_router(marketApi)
