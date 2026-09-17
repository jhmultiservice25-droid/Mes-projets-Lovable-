from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="e-Commune Python Services", version="0.2.0")

class Health(BaseModel):
    status: str
    service: str

class ProjectProgress(BaseModel):
    physical_progress: float = Field(ge=0, le=100)
    financial_progress: float = Field(ge=0, le=100)
    evidence_count: int = Field(ge=0)
    validated_evidence_count: int = Field(ge=0)

@app.get("/health", response_model=Health)
def health() -> Health:
    return Health(status="ok", service="python-services")

@app.get("/analytics/summary")
def analytics_summary():
    return {
        "demo": True,
        "citizens": 48726,
        "monthly_revenue_cdf": 186_400_000,
        "open_cases": 1348,
        "open_complaints": 92,
    }

@app.post("/analytics/project-risk")
def project_risk(project: ProjectProgress):
    gap = abs(project.physical_progress - project.financial_progress)
    evidence_ratio = (
        project.validated_evidence_count / project.evidence_count
        if project.evidence_count else 0
    )
    score = min(100, round(gap * 1.2 + (1 - evidence_ratio) * 45))
    if score >= 65:
        level = "HIGH"
    elif score >= 35:
        level = "MEDIUM"
    else:
        level = "LOW"
    return {
        "risk_score": score,
        "risk_level": level,
        "evidence_ratio": round(evidence_ratio, 2),
        "warning": "Indicateur analytique, pas une conclusion juridique ou d'audit.",
    }
