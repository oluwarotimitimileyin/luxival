export interface RemediationStep {
  step_number: number;
  action_title: string;
  technical_instructions: string;
  verification_method: string;
}

export interface Gap {
  category: string;
  status: 'CRITICAL' | 'WARN' | 'COMPLIANT';
  metric_name: string;
  clause_reference: string;
  description: string;
  recommended_remediation: string;
  remediation_steps: RemediationStep[];
}

export interface CompetitorGap {
  competitor_name: string;
  advantage_over_target: string;
  target_remediation_opportunity: string;
}

export interface SocialPostIdea {
  platform: string;
  angle: string;
  copy_template: string;
}

export interface AuditReport {
  target_url: string;
  overall_score: number;
  pass_status: 'PASSED' | 'PARTIALLY_PASSED' | 'FAILED';
  dashboard_metrics: {
    seo: number;
    performance: number;
    accessibility: number;
    security: number;
  };
  web_builder_agent_prompt: string;
  competitor_analysis: {
    market_position: string;
    competitor_gaps: CompetitorGap[];
  };
  identified_gaps: Gap[];
  marketing_growth: {
    social_post_ideas: SocialPostIdea[];
  };
}
