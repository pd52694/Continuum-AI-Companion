from __future__ import annotations
from typing import Dict, Any, List, Optional
from collections import defaultdict, Counter
from datetime import datetime
import uuid

from models import Node, Edge


class KnowledgeGraph:
    def __init__(self, session_id: str):
        self.session_id = session_id

        # Core storage
        self.nodes: Dict[str, Node] = {}
        self.edges: List[Edge] = []

        # Indexes
        self.pages: Dict[str, str] = {}          # page_id -> node_id
        self.entities_by_label: Dict[str, str] = {}  # label -> node_id
        self.snippets: Dict[str, str] = {}       # snippet_id -> node_id

    # ---------- Node helpers ----------

    def _create_node(
        self,
        type: str,
        label: str,
        metadata: Optional[Dict[str, Any]] = None,
        timestamp: Optional[float] = None,
    ) -> str:
        node_id = str(uuid.uuid4())
        node = Node(
            id=node_id,
            type=type,
            label=label,
            timestamp=timestamp or datetime.now().timestamp(),
            metadata=metadata or {},
        )
        self.nodes[node_id] = node
        return node_id

    def add_page(self, url: str, title: str, timestamp: float) -> str:
        node_id = self._create_node(
            type="page",
            label=title or url,
            metadata={"url": url},
            timestamp=timestamp,
        )
        self.pages[url] = node_id
        return node_id

    def add_entity(self, label: str, entity_type: str) -> str:
        # Reuse existing entity node if label already seen
        key = label.strip().lower()
        if key in self.entities_by_label:
            return self.entities_by_label[key]

        node_id = self._create_node(
            type="entity",
            label=label,
            metadata={"entity_type": entity_type},
        )
        self.entities_by_label[key] = node_id
        return node_id

    def add_snippet(self, text: str, source_page_id: str) -> str:
        node_id = self._create_node(
            type="snippet",
            label=text[:120] + ("…" if len(text) > 120 else ""),
            metadata={"full_text": text, "source_page_id": source_page_id},
        )
        self.snippets[node_id] = node_id
        return node_id

    # ---------- Edges ----------

    def add_edge(self, from_node: str, to_node: str, edge_type: str) -> None:
        if from_node not in self.nodes or to_node not in self.nodes:
            return
        edge = Edge(source=from_node, target=to_node, type=edge_type)
        self.edges.append(edge)

    # ---------- Higher-level graph ops ----------

    def link_related_entities(self) -> None:
        """
        Simple heuristic: entities that co-occur on the same page
        get RELATED_TO edges between them.
        """
        # page_id -> [entity_ids]
        page_entities: Dict[str, List[str]] = defaultdict(list)

        for edge in self.edges:
            # page --MENTIONS--> entity
            if edge.type == "MENTIONS":
                src = self.nodes[edge.source]
                tgt = self.nodes[edge.target]
                if src.type == "page" and tgt.type == "entity":
                    page_entities[edge.source].append(edge.target)

        # For each page, fully connect its entities
        for _, entity_ids in page_entities.items():
            for i in range(len(entity_ids)):
                for j in range(i + 1, len(entity_ids)):
                    a = entity_ids[i]
                    b = entity_ids[j]
                    self.add_edge(a, b, "RELATED_TO")
                    self.add_edge(b, a, "RELATED_TO")

    # ---------- Export / summary ----------

    def export_for_visualization(self) -> Dict[str, Any]:
        """
        Return nodes + edges in a simple format for the frontend.
        """
        nodes = [n.model_dump() for n in self.nodes.values()]
        edges = [e.model_dump() for e in self.edges]

        stats = {
            "nodes": len(nodes),
            "edges": len(edges),
            "pages": sum(1 for n in self.nodes.values() if n.type == "page"),
            "entities": sum(1 for n in self.nodes.values() if n.type == "entity"),
        }

        return {"nodes": nodes, "edges": edges, "stats": stats}

    def get_main_topics(self, top_n: int = 5) -> List[Dict[str, Any]]:
        """
        Return top entities by degree (how connected they are).
        Used for relevance checking.
        """
        degree = Counter()

        for edge in self.edges:
            if self.nodes[edge.source].type == "entity":
                degree[edge.source] += 1
            if self.nodes[edge.target].type == "entity":
                degree[edge.target] += 1

        top_entities = []
        for node_id, count in degree.most_common(top_n):
            node = self.nodes[node_id]
            top_entities.append(
                {
                    "id": node.id,
                    "label": node.label,
                    "entity_type": node.metadata.get("entity_type"),
                    "degree": count,
                }
            )

        return top_entities

    def get_summary(self) -> Dict[str, Any]:
        """
        High-level summary used for prediction prompts.
        """
        pages = [n for n in self.nodes.values() if n.type == "page"]
        entities = [n for n in self.nodes.values() if n.type == "entity"]

        return {
            "page_count": len(pages),
            "entity_count": len(entities),
            "top_entities": self.get_main_topics(top_n=10),
        }

    # ---------- Search ----------

    def search(self, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        """
        Very simple text search over labels + snippet text.
        """
        q = query.lower()
        results: List[Dict[str, Any]] = []

        for node in self.nodes.values():
            haystack = node.label.lower()
            if q in haystack:
                results.append(
                    {
                        "id": node.id,
                        "type": node.type,
                        "label": node.label,
                        "metadata": node.metadata,
                    }
                )

        # Sort by type then label for stability
        results.sort(key=lambda r: (r["type"], r["label"]))
        return results[:max_results]
