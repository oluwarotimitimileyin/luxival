import { AuditReport } from './types';

export const auditData: AuditReport = {
  branding_matrix: {
    detected_hero_bg: "#f4b5b7",
    canvas_text_color: "#111111",
    status_highlight_hex: "#f59e0b"
  },
  executive_metrics: {
    target_url: "https://premium-client-portal.io",
    calculated_health_score: 72,
    system_verdict: "WARNING"
  },
  asymmetrical_grid_cards: {
    web_app_testing: {
      section_title: "Website & Web App Testing",
      visual_status: "WARNING",
      critique: "DOM responsiveness is generally stable, but fluid archway containers clip text on mobile viewports (< 768px). Missing ARIA labels on primary navigation."
    },
    api_backend_testing: {
      section_title: "API & Backend Testing",
      visual_status: "PASS",
      critique: "Endpoints are responding within acceptable thresholds (avg 112ms). Payload compression is active. No network idle timeouts detected."
    },
    performance_testing: {
      section_title: "Performance Analysis",
      visual_status: "FAIL",
      critique: "High-fidelity hero images are unoptimized (4.2MB payload), causing a 3.4s LCP delay. Render-blocking scripts detected in the document head."
    }
  },
  blocker_registry: [
    {
      origin_layer: "UI",
      issue_name: "Text Clipping in Archway Container",
      ui_severity_token: "#f59e0b",
      dev_remediation: "Update the `.arch-container` CSS to use `overflow-wrap: break-word` and adjust padding for mobile breakpoints using `@media (max-width: 768px)`."
    },
    {
      origin_layer: "Performance",
      issue_name: "Unoptimized Hero Assets",
      ui_severity_token: "#ef4444",
      dev_remediation: "Implement WebP/AVIF compression for hero images and use the `<picture>` element with `srcset` for responsive loading. Add `fetchpriority=\"high\"` to the LCP image."
    }
  ],
  personalized_upsell_triggers: [
    "Given the responsive clipping issues detected on mobile viewports, our Mobile App QA tier can ensure your fluid layouts translate perfectly to native web-views.",
    "To prevent unoptimized assets from degrading your premium aesthetic in the future, implement our automated CI/CD Pipeline tracking to catch performance regressions before deployment."
  ]
};
