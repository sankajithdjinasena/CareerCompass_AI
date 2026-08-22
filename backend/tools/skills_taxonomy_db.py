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
from shared_store.groq_client import call_groq_with_retry


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



def _generate_autonomous_taxonomy(role_name: str) -> dict:
    """Uses LLM to dynamically generate a taxonomy for a brand new role."""
    print(f"Autonomous Taxonomy Generation triggered for: {role_name}")
    prompt = f"""
    You are an expert technical recruiter and career coach.
    A user is targeting the role: '{role_name}'.
    This role does not exist in our static database. 
    You must dynamically generate a comprehensive skills taxonomy for it.
    
    Output ONLY a valid JSON object (no markdown, no explanations) in this exact format:
    {{
      "role": "{role_name.title()}",
      "category": "Technology",
      "required_skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6"],
      "nice_to_have_skills": ["Skill A", "Skill B", "Skill C"]
    }}
    """
    try:
        response_text = call_groq_with_retry(prompt)
        import re
        json_match = re.search(r'\{.*?\}', response_text.replace('\n', ''), re.DOTALL)
        if json_match:
            data = json.loads(json_match.group(0))
        else:
            data = json.loads(response_text)
            
        # Guarantee minimum requirements
        if "required_skills" not in data:
            data["required_skills"] = []
        if "nice_to_have_skills" not in data:
            data["nice_to_have_skills"] = []
        if "role" not in data:
            data["role"] = role_name.title()
        if "category" not in data:
            data["category"] = "Technology"
            
        return data
    except Exception as e:
        print(f"Failed to generate autonomous taxonomy: {e}")
        # Fallback to a generic tech taxonomy
        return {
            "role": role_name.title(),
            "category": "Technology",
            "required_skills": ["Python", "SQL", "Git", "Problem Solving", "Cloud Computing"],
            "nice_to_have_skills": ["Docker", "Agile", "CI/CD"]
        }

def resolve_target_role(role_input: str) -> dict:
    """
    Main entry point for role resolution:
    1. Try exact match first (fast path for dropdown selections)
    2. Fall back to semantic search for free-text input
    3. If the semantic match distance is too high (poor match),
       trigger Autonomous Taxonomy Generation to create a new role profile on the fly!
    """
    exact = get_exact_role(role_input)
    if exact is not None:
        return exact
        
    # Attempt Semantic Fallback
    collection = build_or_get_collection()
    results = collection.query(query_texts=[role_input], n_results=1)
    
    if results["distances"] and results["distances"][0]:
        distance = results["distances"][0][0]
        # In default Chroma L2 metric, distances > 1.2 mean poor semantic similarity.
        if distance > 1.2:
            return _generate_autonomous_taxonomy(role_input)
            
        matched_role_name = results["metadatas"][0][0]["role"]
        matched_entry = get_exact_role(matched_role_name)
        if matched_entry:
            return matched_entry

    return _generate_autonomous_taxonomy(role_input)



if __name__ == "__main__":
    import sys

    query = sys.argv[1] if len(sys.argv) > 1 else "backend dev"
    result = resolve_target_role(query)
    print(json.dumps(result, indent=2))
