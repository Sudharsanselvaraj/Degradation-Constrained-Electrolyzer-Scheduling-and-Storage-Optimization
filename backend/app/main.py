"""
Main FastAPI Application Entrypoint for the Green Hydrogen Digital Twin Research Platform.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.data_routes import router as data_router
from backend.app.api.experiment_routes import router as experiment_router
from backend.app.api.forecast_routes import router as forecast_router
from backend.app.api.health_routes import router as health_router
from backend.app.api.optimizer_routes import router as optimizer_router
from backend.app.api.scenario_routes import router as scenario_router
from backend.app.api.storage_routes import router as storage_router
from backend.app.api.twin_routes import router as twin_router

app = FastAPI(
    title="Forecast-Aware Green Hydrogen Digital Twin API",
    description="Research-Grade Simulation and Decision Platform for Renewable-Powered PEM Electrolyzer",
    version="1.0.0",
)

# Enable CORS for frontend dashboard communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Modular API Routers
app.include_router(data_router)
app.include_router(twin_router)
app.include_router(health_router)
app.include_router(forecast_router)
app.include_router(storage_router)
app.include_router(optimizer_router)
app.include_router(scenario_router)
app.include_router(experiment_router)


@app.get("/")
def root():
    return {
        "platform": "Forecast-Aware Green Hydrogen Digital Twin",
        "version": "1.0.0",
        "calibrated_testbed": "Forschungszentrum Jülich 100 kW PEM Electrolyzer",
        "docs_url": "/docs",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
