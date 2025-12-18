import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import "./HomePage.css";

interface Resource {
  id: number;
  title: string;
  description: string;
  tags?: Tag[];
  file?: string;
  owner?: string;
  owner_id?: number;
  average_rating?: number;
  rating_count?: number;
  user_rating?: number;
  views_count?: number;
  downloads_count?: number;
  created_at?: string;
}

interface Tag {
  id: number;
  name: string;
}

const HomePage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [authorSearch, setAuthorSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("-created_at");
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const auth = useContext(AuthContext);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get("/library/tags/");
        setTags(response.data);
      } catch (error) {
        console.error("Failed to fetch tags", error);
      }
    };
    fetchTags();
  }, []);

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (authorSearch) params.append("author", authorSearch);
        if (selectedTag) params.append("tags__name", selectedTag);
        if (sortBy) params.append("ordering", sortBy);

        const response = await api.get("/library/resources/", { params });
        setResources(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [searchTerm, authorSearch, selectedTag, sortBy]);

  useEffect(() => {
    const fetchSavedResources = async () => {
      if (auth?.isAuthenticated) {
        try {
          const response = await api.get("/library/resources/saved/");
          const saved = new Set<number>(
            response.data.map((r: Resource) => r.id)
          );
          setSavedIds(saved);
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchSavedResources();
  }, [auth?.isAuthenticated]);

  const handleSave = async (id: number) => {
    try {
      await api.post(`/library/resources/${id}/save/`);
      setSavedIds((prev) => new Set([...prev, id]));
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnsave = async (id: number) => {
    try {
      await api.post(`/library/resources/${id}/save/`);
      setSavedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Welcome to LibraryHub</h1>
      <p
        style={{
          color: "var(--gray-600)",
          marginBottom: "2rem",
          fontSize: "1.125rem",
        }}
      >
        Discover and explore educational resources shared by our community
      </p>

      <div className="filters-container">
        <div className="search-bar">
          <input
            type="text"
            className="input search-input"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <input
            type="text"
            className="input search-input"
            placeholder="Search by author..."
            value={authorSearch}
            onChange={(e) => setAuthorSearch(e.target.value)}
          />
        </div>
        <div className="filters-row">
          <select
            className="select filter-select"
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
          >
            <option value="">All Tags</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.name}>
                {tag.name}
              </option>
            ))}
          </select>
          <select
            className="select filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="-views_count">Most Viewed</option>
            <option value="-downloads_count">Most Downloaded</option>
            <option value="rating">Highest Rated</option>
            <option value="-rating">Lowest Rated</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading resources...</div>
      ) : resources.length === 0 ? (
        <div className="empty-state">
          <h3>No resources found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {resources.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="resource-card-content">
                <div className="resource-card-header">
                  <Link
                    to={`/resource/${resource.id}`}
                    className="resource-card-title-link"
                  >
                    <h2 className="resource-card-title">{resource.title}</h2>
                  </Link>
                  <p className="resource-card-description">
                    {resource.description}
                  </p>
                </div>

                {resource.owner && resource.owner_id && (
                  <div className="resource-card-author">
                    <span>By:</span>
                    <Link
                      to={`/user/${resource.owner_id}`}
                      className="resource-card-author-link"
                    >
                      {resource.owner}
                    </Link>
                  </div>
                )}

                {resource.average_rating !== undefined &&
                  resource.average_rating > 0 && (
                    <div className="resource-card-rating">
                      <span className="rating-stars">
                        {"★".repeat(Math.round(resource.average_rating))}
                        {"☆".repeat(5 - Math.round(resource.average_rating))}
                      </span>
                      <span className="rating-value">
                        {resource.average_rating.toFixed(1)}
                      </span>
                      {resource.rating_count !== undefined &&
                        resource.rating_count > 0 && (
                          <span className="rating-count">
                            ({resource.rating_count})
                          </span>
                        )}
                    </div>
                  )}

                {resource.tags && resource.tags.length > 0 && (
                  <div className="resource-card-tags">
                    {resource.tags.map((tag) => (
                      <span key={tag.id} className="resource-card-tag">
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="resource-card-footer">
                  <Link
                    to={`/resource/${resource.id}`}
                    className="resource-card-button resource-card-button-primary"
                  >
                    View Details
                  </Link>
                  {resource.file && (
                    <a
                      href={`http://localhost:8000/api/library/resources/${resource.id}/download/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={async () => {
                        try {
                          await api.post(
                            `/library/resources/${resource.id}/download/`
                          );
                        } catch (error) {
                          console.error(error);
                        }
                      }}
                      className="resource-card-button resource-card-button-secondary"
                    >
                      Download
                    </a>
                  )}
                  {auth?.isAuthenticated &&
                    (savedIds.has(resource.id) ? (
                      <button
                        onClick={() => handleUnsave(resource.id)}
                        className="resource-card-button resource-card-button-saved"
                      >
                        Saved
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSave(resource.id)}
                        className="resource-card-button resource-card-button-success"
                      >
                        Save
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
