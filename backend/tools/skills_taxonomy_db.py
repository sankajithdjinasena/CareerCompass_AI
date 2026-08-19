"""
tools/skills_taxonomy_db.py

Loads the skills taxonomy into ChromaDB and provides:
- exact/case-insensitive role lookup (for dropdown selections)
- semantic similarity search (for free-text fallback)
"""

import json
import os
from pathlib import Path

import chromadb

TAXONOMY_PATH = Path(__file__).parent.parent / "data" / "skills_taxonomy.json"
COLLECTION_NAME = "skills_taxonomy"


def _load_taxonomy() -> list[dict]:
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def get_chroma_client() -> chromadb.PersistentClient:
    db_path = os.getenv("VECTOR_DB_PATH", "./data/vector_store")
    Path(db_path).mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=db_path)


def build_or_get_collection():
    """Create the taxonomy collection if it doesn't exist, or return the existing one."""
    client = get_chroma_client()
    taxonomy = _load_taxonomy()

    existing = [c.name for c in client.list_collections()]
    if COLLECTION_NAME in existing:
        collection = client.get_collection(COLLECTION_NAME)
        if collection.count() == len(taxonomy):
            return collection
        client.delete_collection(COLLECTION_NAME)

    collection = client.create_collection(COLLECTION_NAME)

    ids, documents, metadatas = [], [], []
    for i, entry in enumerate(taxonomy):
        skills_text = ", ".join(entry["required_skills"] + entry.get("nice_to_have_skills", []))
        doc_text = f"{entry['role']} ({entry['category']}): {skills_text}"
        ids.append(str(i))
        documents.append(doc_text)
        metadatas.append({"role": entry["role"]})

    collection.add(ids=ids, documents=documents, metadatas=metadatas)
    return collection


def get_exact_role(role_name: str) -> dict | None:
    """Case-insensitive exact match against the taxonomy (used for dropdown selections)."""
    taxonomy = _load_taxonomy()
    for entry in taxonomy:
        if entry["role"].strip().lower() == role_name.strip().lower():
            return entry
    return None


def get_all_role_names() -> list[str]:
    """Returns the list of roles for populating a dropdown."""
    return [entry["role"] for entry in _load_taxonomy()]


def find_closest_role(free_text_query: str) -> dict:
    """
    Semantic fallback: given free text (e.g. 'data scientist' or a messy phrase),
    find the closest matching role via vector similarity search.
    """
    collection = build_or_get_collection()
    results = collection.query(query_texts=[free_text_query], n_results=1)

    if not results["metadatas"] or not results["metadatas"][0]:
        raise ValueError(f"No matching role found for query: {free_text_query}")

    matched_role_name = results["metadatas"][0][0]["role"]
    matched_entry = get_exact_role(matched_role_name)
    if matched_entry is None:
        raise ValueError(f"Matched role '{matched_role_name}' not found in taxonomy.")
    return matched_entry


def resolve_target_role(role_input: str) -> dict:
    """
    Main entry point for role resolution:
    1. Try exact match first (fast path for dropdown selections)
    2. Fall back to semantic search for free-text input
    """
    exact = get_exact_role(role_input)
    if exact is not None:
        return exact
    return find_closest_role(role_input)


if __name__ == "__main__":
    import sys

    query = sys.argv[1] if len(sys.argv) > 1 else "backend dev"
    result = resolve_target_role(query)
    print(json.dumps(result, indent=2))
