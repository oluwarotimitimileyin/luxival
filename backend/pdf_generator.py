"""
PDF report generator for Luxival Audit Platform.
Produces branded dark-themed HTML → PDF via WeasyPrint.
"""
from jinja2 import Template
from weasyprint import HTML as WeasyprintHTML
import io
from typing import List, Dict, Any, Optional
from models import CheckResult, FlowResult


FREE_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 20mm; size: A4; }
  body { font-family: Helvetica, Arial, sans-serif; background: #fff; color: #111; }
  .cover { text-align: center; padding: 60px 0 40px; border-bottom: 3px solid #C9A96A; margin-bottom: 30px; }
  .brand { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #C9A96A; margin-bottom: 8px; }
  h1 { font-size: 28px; font-weight: 300; margin: 0 0 8px; }
  .url { font-size: 13px; color: #555; }
  .score-box { display: inline-block; background: #C9A96A; color: #fff; padding: 10px 24px; border-radius: 3px; font-size: 32px; font-weight: 700; margin: 20px 0; }
  .section { margin: 24px 0; }
  .section-title { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #C9A96A; border-bottom: 1px solid #eee; padding-bottom: 6px; margin-bottom: 12px; }
  .check { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; font-size: 12px; }
  .badge { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
  .pass { background: #4CAF73; }
  .fail { background: #E05555; }
  .warn { background: #E6A817; }
  .check-label { font-weight: 600; }
  .check-detail { color: #666; }
  .footer { text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 16px; margin-top: 40px; }
</style>
</head>
<body>
<div class="cover">
  <div class="brand">Luxival Digital • Helsinki</div>
  <h1>Free Website Audit</h1>
  <div class="url">{{ url }}</div>
  <div class="score-box">{{ score }}/{{ max_score }}</div>
  <div style="font-size:12px;color:#555;">{{ created_at }}</div>
</div>

<div class="section">
  <div class="section-title">SEO &amp; Technical Checks</div>
  {% for c in checks %}
  <div class="check">
    <div class="badge {{ c.status }}"></div>
    <div>
      <div class="check-label">{{ c.label }}</div>
      <div class="check-detail">{{ c.detail }}</div>
    </div>
  </div>
  {% endfor %}
</div>

<div class="section" style="background:#FFF8EC;padding:16px;border-radius:4px;border-left:4px solid #C9A96A;">
  <div class="section-title">Upgrade to Premium</div>
  <p style="font-size:12px;color:#555;">Unlock 7 deep-scan flows (Performance, Mobile, Accessibility, Security, Social, Schema, SEO Deep Dive) plus a prioritised action plan PDF for just €9.90.</p>
  <p style="font-size:12px;font-weight:600;color:#C9A96A;">Visit luxival.com/audit to upgrade.</p>
</div>

<div class="footer">Luxival Digital — luxival.com — Helsinki, Finland</div>
</body>
</html>
"""

PREMIUM_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @page { margin: 20mm; size: A4; }
  body { font-family: Helvetica, Arial, sans-serif; background: #fff; color: #111; }
  .page-break { page-break-before: always; }
  .cover { text-align: center; padding: 80px 0 60px; }
  .brand { font-size: 11px; letter-spacing: 4px; text-transform: uppercase; color: #C9A96A; margin-bottom: 12px; }
  h1 { font-size: 32px; font-weight: 300; margin: 0 0 8px; }
  .url { font-size: 14px; color: #555; margin-bottom: 24px; }
  .score-big { font-size: 64px; font-weight: 700; color: #C9A96A; line-height: 1; }
  .score-label { font-size: 13px; color: #888; }
  .flow-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 32px 0; }
  .flow-card { background: #f9f9f9; border: 1px solid #eee; padding: 14px 16px; border-radius: 4px; }
  .flow-name { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
  .flow-score { font-size: 22px; font-weight: 700; color: #C9A96A; }
  h2 { font-size: 20px; font-weight: 300; margin-bottom: 4px; }
  .sub { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #C9A96A; margin-bottom: 20px; }
  .check { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 12px; }
  .badge { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; }
  .pass { background: #4CAF73; }
  .fail { background: #E05555; }
  .warn { background: #E6A817; }
  .info { background: #5B9BD5; }
  .check-label { font-weight: 600; }
  .check-detail { color: #666; }
  .priority-item { padding: 10px 14px; border-left: 3px solid #E05555; background: #FFF5F5; margin-bottom: 8px; border-radius: 0 4px 4px 0; font-size: 12px; }
  .priority-flow { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #888; }
  .footer { text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 12px; margin-top: 32px; }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="brand">Luxival Digital • Helsinki</div>
  <h1>Premium Website Audit</h1>
  <div class="url">{{ url }}</div>
  <div class="score-big">{{ overall_score }}/{{ max_score }}</div>
  <div class="score-label">Overall Score</div>
  <div style="font-size:12px;color:#888;margin-top:8px;">{{ created_at }}</div>
  <div class="flow-grid" style="margin-top:32px;">
    {% for f in flows %}
    <div class="flow-card">
      <div class="flow-name">{{ f.flow_name }}</div>
      <div class="flow-score">{{ f.score }}/{{ f.max_score }}</div>
    </div>
    {% endfor %}
  </div>
</div>

<!-- FLOW PAGES -->
{% for f in flows %}
<div class="page-break">
  <div class="sub">Flow {{ loop.index }} of {{ flows|length }}</div>
  <h2>{{ f.flow_name }}</h2>
  <p style="font-size:12px;color:#888;margin-bottom:20px;">Score: {{ f.score }}/{{ f.max_score }}</p>
  {% for c in f.checks %}
  <div class="check">
    <div class="badge {{ c.status }}"></div>
    <div>
      <div class="check-label">{{ c.label }}</div>
      <div class="check-detail">{{ c.detail }}</div>
    </div>
  </div>
  {% endfor %}
</div>
{% endfor %}

<!-- PRIORITY ACTION PLAN -->
<div class="page-break">
  <div class="sub">Your Action Plan</div>
  <h2>Priority Fixes</h2>
  <p style="font-size:12px;color:#888;margin-bottom:20px;">All failing checks ranked by impact.</p>
  {% set failures = [] %}
  {% for f in flows %}{% for c in f.checks %}{% if c.status == 'fail' %}{% set _ = failures.append({'flow': f.flow_name, 'label': c.label, 'detail': c.detail}) %}{% endif %}{% endfor %}{% endfor %}
  {% for item in failures %}
  <div class="priority-item">
    <div class="priority-flow">{{ item.flow }}</div>
    <strong>{{ item.label }}</strong><br>{{ item.detail }}
  </div>
  {% endfor %}
  {% if not failures %}<p style="color:#4CAF73;font-weight:600;">🎉 No critical failures found!</p>{% endif %}
</div>

<div class="footer">Luxival Digital — luxival.com — Helsinki, Finland</div>
</body>
</html>
"""


def generate_free_pdf(url: str, score: int, max_score: int,
                      checks: list, created_at: str) -> bytes:
    html = Template(FREE_TEMPLATE).render(
        url=url, score=score, max_score=max_score,
        checks=checks, created_at=created_at
    )
    buf = io.BytesIO()
    WeasyprintHTML(string=html).write_pdf(buf)
    return buf.getvalue()


def generate_premium_pdf(url: str, overall_score: int, max_score: int,
                         flows: List[FlowResult], created_at: str) -> bytes:
    html = Template(PREMIUM_TEMPLATE).render(
        url=url, overall_score=overall_score, max_score=max_score,
        flows=flows, created_at=created_at
    )
    buf = io.BytesIO()
    WeasyprintHTML(string=html).write_pdf(buf)
    return buf.getvalue()
