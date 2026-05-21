export interface BrandingMatrix {
  detected_hero_bg: string;
  canvas_text_color: string;
  status_highlight_hex: string;
}

export interface ExecutiveMetrics {
  target_url: string;
  calculated_health_score: number;
  system_verdict: 'PASS' | 'FAIL' | 'WARNING';
}

export interface GridCardData {
  section_title: string;
  visual_status: 'PASS' | 'FAIL' | 'WARNING';
  critique: string;
}

export interface AsymmetricalGridCards {
  web_app_testing: GridCardData;
  api_backend_testing: GridCardData;
}

export interface Blocker {
  origin_layer: 'UI' | 'API' | 'Performance';
  issue_name: string;
  ui_severity_token: string;
  dev_remediation: string;
}

export interface AuditReport {
  branding_matrix: BrandingMatrix;
  executive_metrics: ExecutiveMetrics;
  asymmetrical_grid_cards: AsymmetricalGridCards;
  blocker_registry: Blocker[];
  personalized_upsell_triggers: string[];
}
