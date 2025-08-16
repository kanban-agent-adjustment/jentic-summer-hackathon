#!/usr/bin/env python3
"""
FastMCP Server for Agentic Kanban Backend
Provides tools for agents to create and retrieve kanban cards
"""

import asyncio
import json
import logging
import os
from typing import Any, Dict, List, Optional, Sequence, Tuple
from datetime import datetime, timezone
import uuid
import aiohttp

from fastmcp import FastMCP

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("agentic-kanban")

# FastMCP server instance
mcp = FastMCP("agentic-kanban")

# Backend API configuration
BACKEND_BASE_URL = os.getenv("KANBAN_BACKEND_BASE_URL", "http://localhost:8000")
API_TIMEOUT = 30  # seconds

_VALID_STATUSES: Tuple[str, ...] = ("research", "in-progress", "done", "blocked", "planned")


def _now_utc_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_iso_or_epoch(v: Any) -> Optional[datetime]:
    """Parse an ISO8601 string or epoch seconds/millis into an aware UTC datetime."""
    if v is None:
        return None
    try:
        if isinstance(v, (int, float)):
            # seconds or ms heuristic
            ts = float(v)
            if ts > 10_000_000_000:  # > ~year 2286 in seconds; treat as ms
                ts /= 1000.0
            return datetime.fromtimestamp(ts, tz=timezone.utc)
        if isinstance(v, str):
            # Try ISO8601
            # Handle Z suffix
            s = v.replace("Z", "+00:00") if v.endswith("Z") else v
            dt = datetime.fromisoformat(s)
            return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
    except Exception:
        return None
    return None


async def _json_or_text(resp: aiohttp.ClientResponse) -> Dict[str, Any]:
    """Return JSON dict if possible; otherwise wrap text in a standard error dict."""
    try:
        return await resp.json(content_type=None)
    except Exception:
        text = await resp.text()
        return {"success": False, "message": text}


async def make_api_request(
    method: str,
    endpoint: str,
    data: Optional[Dict] = None,
    params: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Make a request to the backend API with robust error handling."""
    url = f"{BACKEND_BASE_URL}{endpoint}"
    timeout = aiohttp.ClientTimeout(total=API_TIMEOUT)

    try:
        async with aiohttp.ClientSession(timeout=timeout) as session:
            m = method.upper()
            if m == "GET":
                async with session.get(url, params=params) as response:
                    payload = await _json_or_text(response)
            elif m == "POST":
                async with session.post(url, json=data, params=params) as response:
                    payload = await _json_or_text(response)
            elif m == "PUT":
                async with session.put(url, json=data, params=params) as response:
                    payload = await _json_or_text(response)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            if response.status >= 400:
                raise RuntimeError(
                    f"{m} {url} -> HTTP {response.status}: {payload.get('message', 'Unknown error')}"
                )
            return payload

    except asyncio.TimeoutError:
        raise RuntimeError(f"API request to {url} timed out after {API_TIMEOUT} seconds")
    except aiohttp.ClientError as e:
        raise RuntimeError(f"API request to {url} failed: {e}")
    except Exception as e:
        raise RuntimeError(f"Unexpected error during API request to {url}: {e}")


@mcp.tool()
async def create_kanban_cards(cards: List[Dict[str, Any]]) -> str:
    """
    Create one or more kanban cards with title, description, status, and other metadata.
    """
    try:
        if not cards:
            return "No cards provided to create"

        api_cards: List[Dict[str, Any]] = []
        now_iso = _now_utc_iso()

        for idx, card_data in enumerate(cards, start=1):
            status = card_data.get("status", "planned")
            if status not in _VALID_STATUSES:
                status = "planned"

            completed_at = card_data.get("completedAt") or card_data.get("completed_at")
            if completed_at:
                dt = _parse_iso_or_epoch(completed_at)
                completed_at = dt.isoformat() if dt else None

            api_cards.append({
                "id": str(uuid.uuid4()),
                "title": card_data.get("title", "Untitled"),
                "description": card_data.get("description", ""),
                "status": status,
                "order": card_data.get("order", idx),
                "tags": card_data.get("tags", []) or [],
                "createdAt": now_iso,
                "updatedAt": now_iso,
                "completedAt": completed_at
            })

        response = await make_api_request("POST", "/api/cards", {"cards": api_cards})

        if response.get("success"):
            lines = [f"Successfully created {len(api_cards)} kanban cards via backend API:\n"]
            for card in api_cards:
                lines.append(f"**{card['title']}** (ID: {card['id']})")
                lines.append(f"Status: {card['status']}")
                lines.append(f"Order: {card['order']}")
                lines.append(f"Tags: {', '.join(card['tags']) if card['tags'] else 'None'}")
                lines.append(f"Description: {card['description']}\n")
            return "\n".join(lines)
        return f"Failed to create cards via API: {response.get('message', 'Unknown error')}"

    except Exception as e:
        logger.exception("Failed to create kanban cards")
        return f"Error: Failed to create kanban cards: {e}"


@mcp.tool()
async def get_all_kanban_cards(
    include_completed: bool = True,
    status_filter: str = "all",
    sort_by: str = "order"
) -> str:
    """
    Retrieve all kanban cards currently in the system.
    """
    try:
        response = await make_api_request("GET", "/api/cards")

        if not response.get("success"):
            return f"Failed to retrieve cards from API: {response.get('message', 'Unknown error')}"

        all_cards: List[Dict[str, Any]] = response.get("data", []) or []
        filtered = list(all_cards)

        if not include_completed:
            filtered = [c for c in filtered if c.get("status") != "done"]

        if status_filter != "all":
            filtered = [c for c in filtered if c.get("status") == status_filter]

        def _key(card: Dict[str, Any]):
            if sort_by == "order":
                return card.get("order", 0)
            if sort_by in ("createdAt", "updatedAt"):
                dt = _parse_iso_or_epoch(card.get(sort_by))
                # sort stable with None last
                return (0, dt) if dt else (1, datetime.min.replace(tzinfo=timezone.utc))
            if sort_by == "title":
                return (card.get("title") or "").lower()
            return card.get("order", 0)

        filtered.sort(key=_key)

        if not filtered:
            return "No kanban cards found matching the criteria."

        lines = [f"Found {len(filtered)} kanban cards from backend API:\n"]
        for i, card in enumerate(filtered, 1):
            lines.append(f"{i}. **{card.get('title','(untitled)')}** (ID: {card.get('id','?')})")
            lines.append(f"   Status: {card.get('status','?')}")
            lines.append(f"   Order: {card.get('order','?')}")
            tags = card.get("tags") or []
            lines.append(f"   Tags: {', '.join(tags) if tags else 'None'}")
            lines.append(f"   Created: {card.get('createdAt','?')}")
            lines.append(f"   Description: {card.get('description','')}\n")
        return "\n".join(lines)

    except Exception as e:
        logger.exception("Failed to retrieve kanban cards")
        return f"Error: Failed to retrieve kanban cards: {e}"


@mcp.tool()
async def search_kanban_cards(
    query: str,
    status_filter: str = "all",
    tag_filter: Optional[List[str]] = None
) -> str:
    """
    Search for kanban cards by title, description, or tags.
    """
    try:
        if not query:
            return "No search query provided"

        response = await make_api_request("GET", "/api/cards")
        if not response.get("success"):
            return f"Failed to retrieve cards from API: {response.get('message', 'Unknown error')}"

        all_cards: List[Dict[str, Any]] = response.get("data", []) or []
        q = query.lower()
        tag_filter = tag_filter or []

        def _matches(card: Dict[str, Any]) -> bool:
            title = (card.get("title") or "").lower()
            desc = (card.get("description") or "").lower()
            tags = [t.lower() for t in (card.get("tags") or [])]
            if q in title or q in desc or any(q in t for t in tags):
                if status_filter == "all" or card.get("status") == status_filter:
                    if not tag_filter or any(t in (card.get("tags") or []) for t in tag_filter):
                        return True
            return False

        matches = [c for c in all_cards if _matches(c)]

        if not matches:
            return f"No kanban cards found matching the search query '{query}'."

        lines = [f"Found {len(matches)} kanban cards matching '{query}':\n"]
        for i, card in enumerate(matches, 1):
            lines.append(f"{i}. **{card.get('title','(untitled)')}** (ID: {card.get('id','?')})")
            lines.append(f"   Status: {card.get('status','?')}")
            lines.append(f"   Order: {card.get('order','?')}")
            tags = card.get("tags") or []
            lines.append(f"   Tags: {', '.join(tags) if tags else 'None'}")
            lines.append(f"   Description: {card.get('description','')}\n")
        return "\n".join(lines)

    except Exception as e:
        logger.exception("Failed to search kanban cards")
        return f"Error: Failed to search kanban cards: {e}"


@mcp.tool()
async def update_kanban_card(
    card_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    status: Optional[str] = None,
    order: Optional[int] = None,
    tags: Optional[List[str]] = None,
    completed_at: Optional[str] = None
) -> str:
    """
    Update an existing kanban card's properties.
    """
    try:
        if not card_id:
            return "No card ID provided"

        update_data: Dict[str, Any] = {}

        if title is not None:
            update_data["title"] = title
        if description is not None:
            update_data["description"] = description
        if status is not None:
            update_data["status"] = status if status in _VALID_STATUSES else "planned"
        if order is not None:
            update_data["order"] = order
        if tags is not None:
            update_data["tags"] = tags
        if completed_at is not None:
            dt = _parse_iso_or_epoch(completed_at)
            update_data["completedAt"] = dt.isoformat() if dt else None

        if not update_data:
            return "No update fields provided"

        response = await make_api_request("PUT", f"/api/cards/{card_id}", update_data)

        if response.get("success"):
            updated_card = response.get("data", {}) or {}
            lines = ["Successfully updated kanban card via backend API:\n"]
            lines.append(f"**{updated_card.get('title', 'Unknown')}** (ID: {card_id})")
            lines.append(f"Status: {updated_card.get('status', 'Unknown')}")
            lines.append(f"Order: {updated_card.get('order', 'Unknown')}")
            tags = updated_card.get("tags") or []
            lines.append(f"Tags: {', '.join(tags) if tags else 'None'}")
            lines.append(f"Description: {updated_card.get('description', 'Unknown')}")
            lines.append(f"Updated: {updated_card.get('updatedAt', 'Unknown')}")
            return "\n".join(lines)

        return f"Failed to update card via API: {response.get('message', 'Unknown error')}"

    except Exception as e:
        logger.exception("Failed to update kanban card")
        return f"Error: Failed to update kanban card: {e}"


@mcp.tool()
async def get_kanban_schema() -> str:
    """
    Get information about the current kanban card schema.
    """
    try:
        response = await make_api_request("GET", "/api/schema")

        if not response.get("success"):
            return f"Failed to get schema info: {response.get('message', 'Unknown error')}"

        schema_info = response.get("data", {}) or {}

        lines = ["**Kanban Card Schema Information:**\n"]
        lines.append(f"**Title:** {schema_info.get('title', 'Unknown')}")
        lines.append(f"**Description:** {schema_info.get('description', 'Unknown')}\n")

        lines.append("**Card Properties:**")
        for prop in schema_info.get('card_properties', []) or []:
            lines.append(f"- {prop}")

        lines.append("\n**Required Fields:**")
        for field in schema_info.get('required_fields', []) or []:
            lines.append(f"- {field}")

        lines.append("\n**Status Values:**")
        for status in schema_info.get('status_values', []) or []:
            lines.append(f"- {status}")

        lines.append(f"\n**Schema File:** {schema_info.get('schema_file', 'Unknown')}")

        lm = _parse_iso_or_epoch(schema_info.get('last_modified'))
        if lm:
            lines.append(f"**Last Modified:** {lm.isoformat()}")

        return "\n".join(lines)

    except Exception as e:
        logger.exception("Failed to get kanban schema")
        return f"Error: Failed to get kanban schema: {e}"


@mcp.tool()
async def get_kanban_stats() -> str:
    """
    Get statistics about the current kanban board.
    """
    try:
        response = await make_api_request("GET", "/api/cards")
        if not response.get("success"):
            return f"Failed to retrieve cards from API: {response.get('message', 'Unknown error')}"

        all_cards: List[Dict[str, Any]] = response.get("data", []) or []
        if not all_cards:
            return "No cards found on the kanban board."

        total_cards = len(all_cards)
        status_counts: Dict[str, int] = {}
        tag_counts: Dict[str, int] = {}

        for card in all_cards:
            status = card.get("status", "unknown")
            status_counts[status] = status_counts.get(status, 0) + 1
            for tag in card.get("tags", []) or []:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1

        # Sort by createdAt DESC and take top 5
        def _created_key(c: Dict[str, Any]):
            dt = _parse_iso_or_epoch(c.get("createdAt"))
            return dt or datetime.min.replace(tzinfo=timezone.utc)

        recent_cards = sorted(all_cards, key=_created_key, reverse=True)[:5]

        lines = ["**Kanban Board Statistics:**\n"]
        lines.append(f"**Total Cards:** {total_cards}\n")

        lines.append("**Status Distribution:**")
        for status, count in sorted(status_counts.items()):
            percentage = (count / total_cards) * 100
            lines.append(f"- {status}: {count} ({percentage:.1f}%)")

        if tag_counts:
            lines.append("\n**Top Tags:**")
            for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
                lines.append(f"- {tag}: {count} cards")

        lines.append("\n**Recent Cards:**")
        for i, card in enumerate(recent_cards, 1):
            lines.append(f"{i}. {card.get('title','(untitled)')} ({card.get('status','?')})")

        return "\n".join(lines)

    except Exception as e:
        logger.exception("Failed to get kanban stats")
        return f"Error: Failed to get kanban stats: {e}"


if __name__ == "__main__":
    logger.info("Starting Agentic Kanban FastMCP Server...")
    logger.info(f"Backend API URL: {BACKEND_BASE_URL}")
    # fastmcp.run() is typically blocking; no need to wrap in asyncio.run
    mcp.run()

