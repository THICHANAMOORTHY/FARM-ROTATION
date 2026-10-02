from fastapi import APIRouter, Depends

from app.db import SampleRepository, get_repository

router = APIRouter()


@router.get("/api/health")
def health(repo: SampleRepository = Depends(get_repository)) -> dict[str, str]:
    """Quick check that the API is up, and which storage it is using ("supabase" or "memory")."""
    return {"status": "ok", "database": repo.name}
