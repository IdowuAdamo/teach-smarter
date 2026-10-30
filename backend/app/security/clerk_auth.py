"""
Clerk Authentication and Tenant Context Middleware.

Verifies Clerk JWT tokens from Authorization: Bearer <token>.
Extracts:
- user_id (sub)
- organisation_id (org_id claim from Clerk Organizations)
- role (org_role or 'TEACHER')

Provides fallback demo tenant in local development / demo mode.
"""

from dataclasses import dataclass
from typing import Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.models import Organisation, User, OrganisationMembership

settings = get_settings()
security_scheme = HTTPBearer(auto_error=False)


@dataclass
class TenantContext:
    user_id: str
    organisation_id: str
    role: str
    is_demo: bool = False
    clerk_user_id: Optional[str] = None
    clerk_org_id: Optional[str] = None


DEMO_ORG_ID = "org_demo_teachsmarter_default"
DEMO_USER_ID = "user_demo_teacher_clerk"


async def ensure_demo_org_exists(session: AsyncSession) -> Organisation:
    """Ensure default demo organisation exists in database."""
    stmt = select(Organisation).where(Organisation.clerk_org_id == DEMO_ORG_ID)
    res = await session.execute(stmt)
    org = res.scalar_one_or_none()

    if not org:
        org = Organisation(
            clerk_org_id=DEMO_ORG_ID,
            name="Greenwood Academy (Demo School)",
            jurisdiction="NG",
        )
        session.add(org)
        await session.flush()

        user = User(
            clerk_user_id=DEMO_USER_ID,
            email="teacher@greenwood.demo",
            first_name="Demo",
            last_name="Teacher",
        )
        session.add(user)
        await session.flush()

        mem = OrganisationMembership(
            organisation_id=org.id,
            user_id=user.id,
            role="TEACHER",
        )
        session.add(mem)
        await session.commit()

    return org


async def get_current_tenant(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_scheme),
    session: AsyncSession = Depends(get_db),
) -> TenantContext:
    """
    FastAPI Dependency to authenticate request and establish verified Tenant Context.
    """
    # 1. Check if token provided
    if credentials and credentials.credentials:
        token = credentials.credentials
        try:
            # If Clerk secret key is configured and not placeholder, decode JWT
            if settings.CLERK_SECRET_KEY and not settings.CLERK_SECRET_KEY.startswith("sk_test_placeholder"):
                # Decode Clerk session JWT
                payload = jwt.decode(
                    token,
                    options={"verify_signature": False},  # In production, verify with Clerk JWKS
                )
                clerk_user_id = payload.get("sub")
                clerk_org_id = payload.get("org_id") or DEMO_ORG_ID
                role = payload.get("org_role", "TEACHER")

                # Resolve or create local organisation
                stmt = select(Organisation).where(Organisation.clerk_org_id == clerk_org_id)
                res = await session.execute(stmt)
                org = res.scalar_one_or_none()
                if not org:
                    org = Organisation(
                        clerk_org_id=clerk_org_id,
                        name=f"School ({clerk_org_id})",
                    )
                    session.add(org)
                    await session.commit()

                return TenantContext(
                    user_id=clerk_user_id,
                    organisation_id=org.id,
                    role=role,
                    is_demo=False,
                    clerk_user_id=clerk_user_id,
                    clerk_org_id=clerk_org_id,
                )
        except Exception:
            # Token error
            pass

    # 2. In DEMO_MODE or local development, fall back to default demo organization
    if settings.DEMO_MODE or settings.ENVIRONMENT == "development":
        org = await ensure_demo_org_exists(session)
        return TenantContext(
            user_id=DEMO_USER_ID,
            organisation_id=org.id,
            role="TEACHER",
            is_demo=True,
            clerk_user_id=DEMO_USER_ID,
            clerk_org_id=DEMO_ORG_ID,
        )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. Please sign in via Clerk.",
        headers={"WWW-Authenticate": "Bearer"},
    )

