import React, { useState, useMemo } from 'react';
import { portfolioData } from '../data/portfolioData';
import './Projects.css';

export default function Projects({ onSelectProject }) {
  const { projects } = portfolioData;
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Unique categories
  const categories = useMemo(() => {
    const cats = ['All'];
    projects.forEach((p) => {
      if (!cats.includes(p.category)) {
        cats.push(p.category);
      }
    });
    return cats;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory =
        activeCategory === 'All' || project.category === activeCategory;
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [projects, activeCategory, searchQuery]);

  return (
    <section id="projects" className="section projects-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>💼</span>
            <span>Portofolio & Studi Kasus</span>
          </div>
          <h2 className="section-title">
            Karya Unggulan & <span className="gradient-text">Proyek Nyata</span>
          </h2>
          <p className="section-subtitle">
            Eksplorasi aplikasi web, platform SaaS, dan sistem skalabel yang dirancang dengan performa optimal dan standar industri.
          </p>
        </div>

        {/* Toolbar (Category Filter & Search) */}
        <div className="projects-toolbar">
          <div className="project-categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`category-pill ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                <span>{category === 'All' ? 'Semua Proyek' : category}</span>
              </button>
            ))}
          </div>

          <div className="project-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari proyek atau teknologi (misal: Next.js, API)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="project-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Projects Cards Grid */}
        <div className="projects-grid">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className="project-card glass-card glass-card-interactive"
              >
                {/* Project Image Container */}
                <div
                  className="project-image-box"
                  onClick={() => onSelectProject(project)}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-thumbnail"
                    loading="lazy"
                  />
                  <div className="project-image-overlay">
                    <span className="btn-preview-hint">Lihat Detail Kasus 🔍</span>
                  </div>
                  <div className="project-category-badge">{project.category}</div>
                </div>

                {/* Card Body */}
                <div className="project-body">
                  <h3
                    className="project-card-title"
                    onClick={() => onSelectProject(project)}
                  >
                    {project.title}
                  </h3>
                  <p className="project-card-desc">{project.tagline}</p>

                  {/* Tech Tags */}
                  <div className="project-card-tags">
                    {project.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 4 && (
                      <span className="tag tag-more">
                        +{project.tags.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="project-card-footer">
                  <button
                    type="button"
                    className="btn-details-link"
                    onClick={() => onSelectProject(project)}
                  >
                    <span>Detail Lengkap</span>
                    <span>→</span>
                  </button>

                  <div className="project-external-links">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-icon-link"
                        title="GitHub Repository"
                      >
                        🐙
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-icon-link"
                        title="Live Demo"
                      >
                        🚀
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-projects-found glass-card">
              <p>Tidak ada proyek yang sesuai dengan kriteria pencarian.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
