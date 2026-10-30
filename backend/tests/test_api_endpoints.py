"""
Integration Tests for TeachSmarter FastAPI Endpoints.

Tests:
1. /health
2. /api/v1/demo/load
3. /api/v1/classrooms
4. /api/v1/classrooms/{id}/analytics
5. /api/v1/assessments/{id}/item-analysis (Verifying Q7 miskey flag)
6. /api/v1/imports/inspect with synthetic CSV
"""

import io
from pathlib import Path
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.core.database import init_tables


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    await init_tables()



@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["demo_mode"] is True


@pytest.mark.asyncio
async def test_demo_load_and_analytics_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # 1. Load Demo Classroom
        load_resp = await client.post("/api/v1/demo/load")
        assert load_resp.status_code == 200
        load_data = load_resp.json()
        assert "Grade 8 Math Demo Classroom successfully loaded" in load_data["message"]
        classroom_id = load_data["details"]["classroom_id"]
        unit3_id = load_data["details"]["unit3_assessment_id"]

        # 2. List Classrooms
        c_list_resp = await client.get("/api/v1/classrooms")
        assert c_list_resp.status_code == 200
        c_list = c_list_resp.json()
        assert len(c_list) >= 1
        assert any(c["id"] == classroom_id for c in c_list)

        # 3. Classroom Analytics
        analytics_resp = await client.get(f"/api/v1/classrooms/{classroom_id}/analytics")
        assert analytics_resp.status_code == 200
        analytics = analytics_resp.json()
        assert analytics["total_students"] == 25
        assert "latest_assessment" in analytics
        assert analytics["latest_assessment"]["assessment_id"] == unit3_id

        # Check trajectory distribution
        t_counts = analytics["trajectory_counts"]
        assert t_counts["BREAKTHROUGH"] >= 1  # Sarah Jenkins
        assert t_counts["DECLINING"] >= 1     # Marcus Vance

        # 4. Item Psychometrics on Unit 3
        item_resp = await client.get(f"/api/v1/assessments/{unit3_id}/item-analysis")
        assert item_resp.status_code == 200
        items_data = item_resp.json()
        assert items_data["items_count"] == 15

        # Verify Q7 is flagged as an anomaly!
        q7 = next(it for it in items_data["items"] if it["item_number"] == 7)
        assert q7["anomaly_flag"] is not None
        assert "MISKEY" in q7["anomaly_flag"] or "CRITICAL" in q7["anomaly_flag"]
        assert q7["discrimination_d"] < 0.0


@pytest.mark.asyncio
async def test_spreadsheet_inspection():
    csv_path = Path(__file__).resolve().parent.parent.parent / "data" / "synthetic" / "grade8_math_unit3_gradebook.csv"
    assert csv_path.exists(), "CSV gradebook should be generated on disk"

    with open(csv_path, "rb") as f:
        file_bytes = f.read()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        files = {"file": ("gradebook.csv", file_bytes, "text/csv")}
        resp = await client.post("/api/v1/imports/inspect", files=files)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_rows"] == 25
        assert data["detected_items_count"] == 15

        # Check that student_number was mapped
        mappings = {m["detected_column"]: m["suggested_target"] for m in data["column_mappings"]}
        assert mappings["Student ID"] == "student_number"
        assert mappings["First Name"] == "first_name"
        assert mappings["Last Name"] == "last_name"
        assert mappings["Q1"] == "item_response"
        assert mappings["Q7"] == "item_response"
