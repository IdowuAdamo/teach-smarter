"""
Integration Tests for Parent Communication and HITL Approval Hub.

Verifies:
1. Draft Generation (status = PENDING).
2. Enforcement of Rule 8: Attempting to send without approval fails with 403 Forbidden.
3. Teacher Approval: Records content hash and status = APPROVED.
4. Safe Dispatch: Successfully dispatches via Sandbox simulation in Demo Mode.
5. Invalidation on Edit: Any modification (manual or 1-click tone adjuster) voids approval state.
"""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.core.database import init_tables


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_tables()


@pytest.mark.asyncio
async def test_communication_generation_and_approval_enforcement():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Seed Demo Classroom
        seed_resp = await client.post("/api/v1/demo/load")
        assert seed_resp.status_code == 200
        classroom_id = seed_resp.json()["details"]["classroom_id"]

        # 2. Generate Communication Drafts
        gen_resp = await client.post(f"/api/v1/classrooms/{classroom_id}/communications/generate")
        assert gen_resp.status_code == 200
        assert gen_resp.json()["status"] == "SUCCESS"

        # 3. List Drafts
        list_resp = await client.get(f"/api/v1/classrooms/{classroom_id}/communications")
        assert list_resp.status_code == 200
        drafts = list_resp.json()
        assert len(drafts) >= 1

        draft = drafts[0]
        draft_id = draft["id"]
        assert draft["status"] == "PENDING"
        assert draft["content_version"] == 1

        # 4. Security Check: Attempting to send an unapproved draft MUST return 403 Forbidden
        unauth_send_resp = await client.post(f"/api/v1/communications/{draft_id}/send")
        assert unauth_send_resp.status_code == 403
        assert "Teacher explicit approval is required" in unauth_send_resp.json()["detail"]

        # 5. Teacher Approves Draft
        approve_resp = await client.post(f"/api/v1/communications/{draft_id}/approve")
        assert approve_resp.status_code == 200
        approve_data = approve_resp.json()
        assert approve_data["approval_status"] == "APPROVED"
        assert approve_data["approved_content_hash"] is not None

        # 6. Test Invalidation on Edit: Teacher modifies text
        edit_resp = await client.patch(
            f"/api/v1/communications/{draft_id}",
            json={"body": "Teacher updated text for Marcus Vance review."},
        )
        assert edit_resp.status_code == 200
        edit_data = edit_resp.json()
        assert edit_data["approval_status"] == "VOIDED_REQUIRES_REAPPROVAL"
        assert edit_data["content_version"] == 2

        # 7. Attempting to send after edit MUST fail again!
        send_after_edit = await client.post(f"/api/v1/communications/{draft_id}/send")
        assert send_after_edit.status_code == 403

        # 8. Re-approve and successfully dispatch
        re_approve = await client.post(f"/api/v1/communications/{draft_id}/approve")
        assert re_approve.status_code == 200

        final_send = await client.post(f"/api/v1/communications/{draft_id}/send")
        assert final_send.status_code == 200
        send_data = final_send.json()
        assert send_data["status"] == "SUCCESS"
        assert send_data["delivery_mode"] == "SANDBOX_SIMULATION"

