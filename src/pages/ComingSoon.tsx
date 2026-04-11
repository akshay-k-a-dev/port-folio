import { useEffect, useState } from "react";
import "../styles/coming-soon.css";

export default function ComingSoon() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="cs-container">
      {/* Funky background elements */}
      <div className="cs-bg-blur cs-blur-1"></div>
      <div className="cs-bg-blur cs-blur-2"></div>
      <div className="cs-bg-blur cs-blur-3"></div>

      {/* Main content */}
      <div className={`cs-content ${isLoaded ? "cs-loaded" : ""}`}>
        {/* Skewed box 1 */}
        <div className="cs-skew-box cs-box-1">
          <span className="cs-text-accent">portfolio</span>
        </div>

        {/* Main heading */}
        <h1 className="cs-heading">
          <span className="cs-word">coming</span>
          <span className="cs-word">soon.</span>
        </h1>

        {/* Skewed box 2 */}
        <div className="cs-skew-box cs-box-2">
          <span className="cs-text-accent">launching</span>
        </div>

        {/* Description */}
        <p className="cs-description">
          something wild is brewing. check back soon.
        </p>

        {/* Funky buttons/links */}
        <div className="cs-cta-group">
          <a
            href="https://github.com/akshay-k-a-dev"
            target="_blank"
            rel="noopener noreferrer"
            className="cs-link cs-link-primary"
          >
            github
          </a>
          <div className="cs-divider"></div>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="cs-link cs-link-secondary"
          >
            twitter
          </a>
        </div>

        {/* Floating badge */}
        <div className="cs-badge">
          <div className="cs-badge-inner">
            <span className="cs-pulse"></span>
            in progress
          </div>
        </div>
      </div>

      {/* Skewed decorative corners */}
      <div className="cs-corner cs-corner-tl"></div>
      <div className="cs-corner cs-corner-br"></div>
    </div>
  );
}
