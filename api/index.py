from fastapi import FastAPI
from api.routes.routes import marketApi
from api.routes.migrosApi import migrosApi
from api.routes.sokApi import sokApi
from api.routes.getirApi import getirApi
from api.routes.a101Api import a101Api
from api.routes.carefourApi import carefourApi
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(marketApi)
app.include_router(migrosApi)
app.include_router(sokApi)
app.include_router(getirApi)
app.include_router(a101Api)
app.include_router(carefourApi)
