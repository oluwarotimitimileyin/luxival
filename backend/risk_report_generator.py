"""
Regulatory Report PDF Generator for Risk Models.
Generates Basel III, MiFID II, GDPR compliance reports in PDF format.
"""

import io
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from jinja2 import Template
from weasyprint import HTML as WeasyprintHTML


REGULATORY_REPORT_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 15mm; size: A4; }
  body { font-family: Helvetica, Arial, sans-serif; background: #fff; color: #111; }
  .cover { text-align: center; padding: 60px 0 40px; border-bottom: 3px solid #C9A96A; margin-bottom: 30px; }
  .brand { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #C9A96A; margin-bottom: 8px; }
  h1 { font-size: 28px; font-weight: 300; margin: 0 0 8px; }
  .report-id { font-size: 12px; color: #666; }
  .score-box { display: inline-block; background: #C9A96A; color: #fff; padding: 10px 24px; border-radius: 3px; font-size: 28px; font-weight: 700; margin: 20px 0; }
  .page-break { page-break-before: always; }
  .section { margin: 24px 0; }
  .section-title { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #C9A96A; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px; }
  .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
  .metric-card { background: #f9f9f9; border: 1px solid #eee; padding: 14px 16px; border-radius: 4px; text-align: center; }
  .metric-value { font-size: 22px; font-weight: 700; color: #111; }
  .metric-label { font-size: 10px; color: #666; margin-top: 4px; }
  .risk-bar { height: 20px; background: #eee; border-radius: 3px; overflow: hidden; margin: 8px 0; }
  .risk-fill { height: 100%; background: linear-gradient(90deg, #4CAF73 0%, #E6A817 50%, #E05555 100%); }
  .table { width: 100%; border-collapse: collapse; font-size: 11px; }
  .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
  .table th { background: #f5f5f5; font-weight: 600; }
  .footer { text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 16px; margin-top: 40px; }
  .badge-low { background: #4CAF73; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 10px; }
  .badge-medium { background: #E6A817; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 10px; }
  .badge-high { background: #E05555; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 10px; }
  .badge-critical { background: #9c27b0; color: #fff; padding: 2px 8px; border-radius: 3px; font-size: 10px; }
</style>
</head>
<body>

<div class="cover">
  <div class="brand">Luxival Risk • Helsinki</div>
  <h1>{{ report_type|upper }} Regulatory Report</h1>
  <div class="report-id">Report ID: {{ report_id }} | Period: {{ reporting_period }}</div>
  <div style="font-size:12px;color:#555;margin-top:8px;">Generated: {{ generated_at }}</div>
</div>

<div class="section">
  <div class="section-title">Executive Summary</div>
  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-value">€{{ "{:,.0f}".format(total_exposures) }}</div>
      <div class="metric-label">Total Exposures</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">{{ capital_adequacy_ratio|round(2) }}%</div>
      <div class="metric-label">Capital Adequacy Ratio</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">€{{ "{:,.0f}".format(total_capital) }}</div>
      <div class="metric-label">Capital Requirement</div>
    </div>
  </div>
</div>

<div class="section">
  <div class="section-title">Risk Distribution by Category</div>
  <table class="table">
    <thead>
      <tr>
        <th>Category</th>
        <th>Exposure Amount</th>
        <th>Percentage</th>
        <th>Risk Score</th>
      </tr>
    </thead>
    <tbody>
      {% for cat in ['low', 'medium', 'high', 'critical'] %}
      <tr>
        <td><span class="badge-{{ cat }}">{{ cat|title }}</span></td>
        <td>€{{ "{:,.0f}".format(risk_breakdown[cat]) }}</td>
        <td>{{ "{:.1f}".format((risk_breakdown[cat] / total_exposures * 100) if total_exposures > 0 else 0) }}%</td>
        <td>{{ "Below 30" if cat == 'low' else ("30-60" if cat == 'medium' else ("60-80" if cat == 'high' else "Above 80")) }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>

{% if var_metrics %}
<div class="section">
  <div class="section-title">Value at Risk</div>
  <div class="metric-grid">
    <div class="metric-card">
      <div class="metric-value">{{ var_metrics.var_95|round(2) }}%</div>
      <div class="metric-label">VaR (95% Confidence)</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">{{ var_metrics.var_99|round(2) }}%</div>
      <div class="metric-label">VaR (99% Confidence)</div>
    </div>
    <div class="metric-card">
      <div class="metric-value">{{ var_metrics.es_975|round(2) }}%</div>
      <div class="metric-label">Expected Shortfall (97.5%)</div>
    </div>
  </div>
</div>
{% endif %}

{% if exposures_table %}
<div class="section page-break">
  <div class="section-title">Exposure Details</div>
  <table class="table">
    <thead>
      <tr>
        <th>Entity ID</th>
        <th>Type</th>
        <th>Exposure (€)</th>
        <th>Rating</th>
        <th>PD</th>
        <th>LGD</th>
        <th>Expected Loss</th>
        <th>Category</th>
      </tr>
    </thead>
    <tbody>
      {% for e in exposures_table %}
      <tr>
        <td>{{ e.entity_id[:12] }}...</td>
        <td>{{ e.entity_type }}</td>
        <td>{{ "{:,.0f}".format(e.exposure) }}</td>
        <td>{{ e.rating or 'NR' }}</td>
        <td>{{ "{:.2%}".format(e.pd) }}</td>
        <td>{{ "{:.2%}".format(e.lgd) }}</td>
        <td>{{ "{:,.0f}".format(e.expected_loss) }}</td>
        <td><span class="badge-{{ e.category }}">{{ e.category }}</span></td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>
{% endif %}

{% if market_data %}
<div class="section page-break">
  <div class="section-title">Market Data</div>
  <table class="table">
    <thead>
      <tr>
        <th>Symbol</th>
        <th>Price</th>
        <th>Change</th>
        <th>Volume</th>
        <th>Volatility</th>
      </tr>
    </thead>
    <tbody>
      {% for m in market_data %}
      <tr>
        <td>{{ m.symbol }}</td>
        <td>{{ m.price or 'N/A' }}</td>
        <td style="color: {{ 'green' if m.day_change and m.day_change > 0 else 'red' }};">{{ m.day_change or 'N/A' }}</td>
        <td>{{ m.volume or 'N/A' }}</td>
        <td>{{ m.volatility or 'N/A' }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>
{% endif %}

{% if compliance_checks %}
<div class="section page-break">
  <div class="section-title">Regulatory Compliance</div>
  {% for check in compliance_checks %}
  <div class="check" style="margin-bottom: 12px;">
    <span class="badge-{{ 'passed' if check.status else 'failed' }}">●</span>
    <span>{{ check.name }}: {% if check.status %}PASS{% else %}FAIL{% endif %}</span>
    {% if check.notes %}<div style="font-size:10px;color:#666;margin-left:20px;">{{ check.notes }}</div>{% endif %}
  </div>
  {% endfor %}
</div>
{% endif %}

<div class="section page-break">
  <div class="section-title">Regulatory References</div>
  <ul style="font-size:11px;color:#555;">
    {% for ref in regulatory_refs %}
    <li>{{ ref }}</li>
    {% endfor %}
  </ul>
  <p style="font-size:10px;color:#999;margin-top:20px;">
    This report was generated using Basel III standardized methodology.
    VaR calculated using historical simulation method.
    Risk weights derived from external credit ratings.
  </p>
</div>

<div class="footer">
  Luxival Risk Management • luxival.com • Helsinki, Finland<br>
  Confidential - For Internal Use Only
</div>

</body>
</html>
"""


def generate_risk_report(
    report_type: str,
    report_id: str,
    reporting_period: str,
    total_exposures: float,
    capital_adequacy_ratio: float,
    total_capital: float,
    risk_breakdown: Dict[str, float],
    var_metrics: Optional[Dict[str, float]] = None,
    exposures_table: Optional[List[Dict]] = None,
    market_data: Optional[List[Dict]] = None,
    compliance_checks: Optional[List[Dict]] = None,
    regulatory_refs: Optional[List[str]] = None
) -> bytes:
    """Generate a regulatory risk report PDF."""
    html = Template(REGULATORY_REPORT_TEMPLATE).render(
        report_type=report_type,
        report_id=report_id,
        reporting_period=reporting_period,
        total_exposures=total_exposures,
        capital_adequacy_ratio=capital_adequacy_ratio,
        total_capital=total_capital,
        risk_breakdown=risk_breakdown,
        var_metrics=var_metrics,
        exposures_table=exposures_table or [],
        market_data=market_data or [],
        compliance_checks=compliance_checks or [],
        regulatory_refs=regulatory_refs or ["Basel III", "CRD IV", "CRR II"]
    )
    buf = io.BytesIO()
    WeasyprintHTML(string=html).write_pdf(buf)
    return buf.getvalue()


if __name__ == "__main__":
    # Demo generation
    report = generate_risk_report(
        report_type="basel_iii",
        report_id="RM-2026-Q2-001",
        reporting_period="2026-Q2",
        total_exposures=2500000,
        capital_adequacy_ratio=18.5,
        total_capital=462500,
        risk_breakdown={"low": 1500000, "medium": 750000, "high": 200000, "critical": 50000},
        var_metrics={"var_95": 2.5, "var_99": 4.2, "es_975": 5.1},
        exposures_table=[
            {"entity_id": "CUST001", "entity_type": "customer", "exposure": 50000, "rating": "BBB", "pd": 0.007, "lgd": 0.45, "expected_loss": 3150, "category": "low"}
        ],
        market_data=[
            {"symbol": "SPX", "price": 5500.50, "day_change": 25.30, "volume": 2500000000, "volatility": 0.18}
        ],
        compliance_checks=[
            {"name": "Capital Adequacy", "status": True, "notes": "CAR above minimum requirement"},
            {"name": "Risk Disclosure", "status": True, "notes": "All risk factors reported"}
        ]
    )
    print(f"Generated risk report PDF: {len(report)} bytes")