-- Risk Model Tables for Regulatory Reporting
-- Run in Supabase SQL editor

-- 1) Risk Model Definitions (credit, market, operational, etc.)
CREATE TABLE IF NOT EXISTS risk_models (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    model_name text NOT NULL,
    model_type text NOT NULL CHECK (model_type IN ('credit', 'market', 'operational', 'liquidity', 'compliance', 'fraud')),
    description text,
    version text NOT NULL DEFAULT '1.0.0',
    regulator_references text[], -- Basel III, MiFID II, GDPR, etc.
    risk_weighting numeric, -- regulatory risk weight (0-1000 basis points)
    confidence_level numeric, -- confidence level for VaR (e.g., 0.95, 0.99)
    time_horizon_days integer, -- time horizon for risk measurement
    enabled boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_risk_models_type ON risk_models (model_type);
CREATE INDEX IF NOT EXISTS idx_risk_models_enabled ON risk_models (enabled);

-- 2) Risk Exposures (individual risk instances linked to entities)
CREATE TABLE IF NOT EXISTS risk_exposures (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    risk_model_id uuid REFERENCES risk_models(id),
    entity_type text NOT NULL CHECK (entity_type IN ('customer', 'counterparty', 'transaction', 'portfolio', 'loan', 'investment')),
    entity_id text NOT NULL, -- reference to customer/loan/etc ID
    exposure_amount numeric NOT NULL, -- risk amount in currency
    currency text NOT NULL DEFAULT 'EUR',
    risk_score numeric, -- calculated risk score (0-100)
    risk_category text CHECK (risk_category IN ('low', 'medium', 'high', 'critical')),
    pd numeric, -- probability of default
    lgd numeric, -- loss given default (0-1)
    ead numeric, -- exposure at default
    maturity_date date,
    sector text,
    geography text,
    status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'written_off', 'defaulted')),
    metadata jsonb -- additional risk factors
);

CREATE INDEX IF NOT EXISTS idx_risk_exposures_model ON risk_exposures (risk_model_id);
CREATE INDEX IF NOT EXISTS idx_risk_exposures_entity ON risk_exposures (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_exposures_category ON risk_exposures (risk_category);
CREATE INDEX IF NOT EXISTS idx_risk_exposures_status ON risk_exposures (status);

-- 3) Risk Scoring Rules (configurable weights and calculations)
CREATE TABLE IF NOT EXISTS risk_scoring_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    model_id uuid REFERENCES risk_models(id),
    factor_name text NOT NULL, -- e.g., 'credit_score', 'income_ratio', 'delinquency_flags'
    weight numeric NOT NULL CHECK (weight >= 0 AND weight <= 1), -- weight in scoring (0-1)
    min_value numeric, -- minimum expected value
    max_value numeric, -- maximum expected value
    score_function text, -- JS or SQL-like expression for scoring
    description text
);

CREATE INDEX IF NOT EXISTS idx_risk_scoring_rules_model ON risk_scoring_rules (model_id);

-- 4) Regulatory Reports (generated reports with audit trail)
CREATE TABLE IF NOT EXISTS regulatory_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    report_type text NOT NULL CHECK (report_type IN ('basel_iii', 'solvency_ii', 'mifid_ii', 'gdpr', 'ccar', 'stress_test')),
    reporting_period date NOT NULL,
    reporting_quarter text GENERATED ALWAYS AS (concat(extract(year FROM reporting_period)::text, '-Q', extract(quarter FROM reporting_period)::text)) STORED,
    report_data jsonb NOT NULL, -- full report JSON
    summary_stats jsonb, -- key statistics for quick view
    total_exposures numeric,
    total_risk_weighted numeric,
    capital_adequacy_ratio numeric,
    var_95 numeric, -- Value at Risk at 95% confidence
    var_99 numeric, -- Value at Risk at 99% confidence
    stress_test_results jsonb,
    submitted_at timestamptz, -- when submitted to regulator
    submitted_by text, -- user who submitted
    status text DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'submitted', 'rejected')),
    approval_notes text
);

CREATE INDEX IF NOT EXISTS idx_regulatory_reports_type ON regulatory_reports (report_type);
CREATE INDEX IF NOT EXISTS idx_regulatory_reports_period ON regulatory_reports (reporting_period);
CREATE INDEX IF NOT EXISTS idx_regulatory_reports_status ON regulatory_reports (status);

-- 5) Live Market Data (for market risk models)
CREATE TABLE IF NOT EXISTS market_data (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    symbol text NOT NULL, -- e.g., 'EURUSD', 'SPX', 'OIL'
    data_type text NOT NULL CHECK (data_type IN ('equity', 'fx', 'commodity', 'rate', 'credit', 'index')),
    price numeric,
    previous_close numeric,
    volume numeric,
    day_change numeric,
    day_change_percent numeric,
    volatility numeric, -- 30-day volatility
    source text, -- data provider
    fetched_at timestamptz DEFAULT now(),
    metadata jsonb
);

CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data (symbol, fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_type ON market_data (data_type);

-- 6) External Credit Ratings (live credit data)
CREATE TABLE IF NOT EXISTS credit_ratings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    entity_id text NOT NULL, -- company/institution ID
    entity_name text,
    agency text NOT NULL, -- Moody's, S&P, Fitch
    rating_current text NOT NULL, -- current rating (AAA, AA+, A, etc.)
    rating_previous text,
    outlook text CHECK (outlook IN ('positive', 'negative', 'stable', 'negative_watch')),
    date_issued date,
    expiry_date date,
    metadata jsonb
);

CREATE INDEX IF NOT EXISTS idx_credit_ratings_entity ON credit_ratings (entity_id);
CREATE INDEX IF NOT EXISTS idx_credit_ratings_agency ON credit_ratings (agency);

-- 7) Risk Model Runs (audit trail of model executions)
CREATE TABLE IF NOT EXISTS risk_model_runs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz NOT NULL DEFAULT now(),
    model_id uuid REFERENCES risk_models(id),
    run_type text CHECK (run_type IN ('ad_hoc', 'scheduled', 'regulatory')),
    run_by text, -- user or system that triggered
    input_parameters jsonb, -- parameters used for this run
    total_entities integer,
    total_exposures numeric,
    aggregate_risk_score numeric,
    execution_time_ms integer,
    success boolean DEFAULT true,
    error_message text,
    output_report_id uuid REFERENCES regulatory_reports(id)
);

CREATE INDEX IF NOT EXISTS idx_risk_model_runs_model ON risk_model_runs (model_id);
CREATE INDEX IF NOT EXISTS idx_risk_model_runs_created ON risk_model_runs (created_at DESC);

-- RLS Policies
ALTER TABLE risk_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read/write risk models" ON risk_models FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE risk_exposures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read/write risk exposures" ON risk_exposures FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE risk_scoring_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read/write risk scoring rules" ON risk_scoring_rules FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE regulatory_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read/write regulatory reports" ON regulatory_reports FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read market data" ON market_data FOR SELECT USING (true);
CREATE POLICY "Service insert market data" ON market_data FOR INSERT WITH CHECK (true);

ALTER TABLE credit_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read/write credit ratings" ON credit_ratings FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE risk_model_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin read risk model runs" ON risk_model_runs FOR SELECT USING (auth.role() = 'authenticated');