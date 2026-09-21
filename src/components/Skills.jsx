import React from 'react';
import { portfolioData } from '../data/portfolioData';
import './Skills.css';

export default function Skills() {
  const { skills } = portfolioData;

  return (
    <section id="skills" className="section pop-skills-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-badge">
            <span>Keahlian & Kemampuan</span>
          </div>
          <h2 className="section-title">
            Skill & Bidang <span className="section-title-cream">Kreatif</span>
          </h2>
          <p className="section-subtitle">
            Kombinasi kemampuan editing video, desain visual, branding media sosial, dan adaptasi software otodidak yang saya kuasai.
          </p>
        </div>

        {/* Skills Cards Grid */}
        <div className="pop-skills-grid">
          {skills.map((skill, index) => (
            <div key={index} className="pop-skill-card pop-card">
              <div className="skill-card-top">
                <div className="skill-number-box">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <span className="skill-cat-pill">{skill.category}</span>
              </div>

              <h4 className="pop-skill-name">{skill.name}</h4>
              <p className="pop-skill-desc">{skill.desc}</p>

              {/* Tools Tags */}
              {skill.tools && (
                <div className="skill-tools-wrap">
                  {skill.tools.map((tool) => (
                    <span key={tool} className="tag">
                      {tool}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
