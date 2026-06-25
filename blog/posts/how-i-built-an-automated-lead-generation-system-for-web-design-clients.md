---
layout: blog
title: "How I Built an Automated Lead Generation System for Web Design Clients"
description: "How I built an automated Luxival workflow to find newly registered businesses, filter website gaps, and deliver clean web design leads by email."
date: 2026-06-09
tags: ["blog"]
isPost: true
ogImage: "/blog/images/lead-generation/lead-generation-01.png"
permalink: "blog/how-i-built-an-automated-lead-generation-system-for-web-design-clients/index.html"
---

<span class="eyebrow">Automation Case Study</span>
<h1>How I Built an Automated Lead Generation System for Web Design Clients</h1>

<p>Finding new clients is one of the biggest challenges for web designers, developers, and digital service providers. Many businesses need a website, SEO support, online visibility, booking forms, or automation, but finding those businesses at the right time can be difficult.</p>

<p>I wanted to solve this problem in a practical way.</p>

<p>Instead of manually searching online every day for businesses that may need a website, I built an automated lead generation system that identifies newly registered companies, checks whether they already have a website, collects public contact information, and sends a clean report to my inbox.</p>

<p>This project became more than just a script. It became a real business workflow for Luxival.</p>

<figure style="margin:1.6rem 0 2rem 0;">
 <img src="/blog/images/lead generation/lead generation 01.png" alt="Luxival automated lead generation workflow displayed across business automation screens" loading="eager" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>Building practical automation for real outreach: from raw data to actionable business leads.</figcaption>
</figure>

## The Problem I Wanted to Solve

When a business is newly registered, it often needs many digital services:

- A professional website
- A domain name
- Business email setup
- SEO visibility
- Google Business Profile setup
- Contact or booking forms
- Website testing
- Digital marketing support
- Automation for customer enquiries
- Better online credibility

The challenge is simple: finding these businesses manually takes too much time.

Most days, that means searching registries, maps, websites, and social pages one by one. The process is repetitive, slow, and easy to postpone when client work gets busy.

So I asked myself:

**Can I build a system that automatically finds fresh business opportunities and sends them to me in a clean format?**

That question became this project.

## The Goal of the System

The goal was to create a practical automation workflow that can:

1. Find newly registered companies in Finland.
2. Check if each company already has a website.
3. Collect public contact details such as phone numbers and business data.
4. Check the company's online visibility.
5. Store the data safely.
6. Remove duplicate leads.
7. Export high quality leads into a CSV file.
8. Send the report to my email automatically.
9. Run reliably on a low cost self hosted Linux server.

The result is a repeatable workflow that helps identify companies that may need web design, SEO, automation, or visibility support.

<figure style="margin:1.25rem 0 1.9rem 0;">
 <img src="/blog/images/lead generation/lead generation 02.png" alt="Lead generation architecture showing sourcing, filtering, and scoring workflow" loading="lazy" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>Every step has one purpose: reduce manual effort and surface outreach opportunities faster.</figcaption>
</figure>

## The Technology Stack I Used

This system was built with simple, reliable tools:

- **Python** for automation logic
- **Debian Linux** as the server environment
- **Google Cloud VM** as the self hosted machine
- **SQLite** for storing lead data
- **Public company registry data** for newly registered companies
- **Google Maps enrichment** for website and phone checks
- **Sherlock** for public username and social footprint checks
- **Cron jobs** for scheduling
- **Email automation** for report delivery
- **CSV export** for easy follow up

The goal was never to make this complex. The goal was to make it useful and repeatable.

<figure style="margin:1.25rem 0 1.9rem 0;">
 <img src="/blog/images/lead generation/lead generation 03.png" alt="Practical automation stack for Linux, Python, SQLite, and reporting workflows" loading="lazy" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>Simple infrastructure can still produce a dependable lead engine when each tool has a clear role.</figcaption>
</figure>

## How the Lead Generation Workflow Works

### 1. Fetch Newly Registered Companies

The first step pulls recently registered companies from public data sources and extracts useful details like company name, business ID, registration date, municipality, address, and available industry information.

This gives the system a fresh pipeline of potential businesses to review.

### 2. Check Whether the Company Has a Website

After collecting the list, the workflow checks whether each business already has a visible website.

This is one of the most important filters. If a company has no website or weak visibility, it is often a strong lead for digital support.

### 3. Collect Public Contact Details

The workflow then enriches each lead with publicly available data:

- Phone number
- Public business email (where available)
- Address and municipality
- Source links for traceability

The system is designed around ethical lead generation using public business information only.

<figure style="margin:1.25rem 0 1.9rem 0;">
 <img src="/blog/images/lead generation/lead generation 04.png" alt="Lead enrichment process combining business records, contact discovery, and visibility signals" loading="lazy" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>Public data, transparent logic, and clear sourcing keep the workflow practical and professional.</figcaption>
</figure>

### 4. Check Social and Brand Visibility

I also use Sherlock to understand whether a brand name appears across public platforms. If a company has no website and very little social presence, that often signals a high value opportunity.

This helps shape service recommendations such as:

- Website setup
- Domain registration
- Social profile setup
- SEO basics
- Brand visibility improvements
- Google Business Profile support

### 5. Store Leads in SQLite

All leads are saved in a local SQLite database. This is critical for deduplication and lead history.

SQLite allows the workflow to:

- Store leads persistently
- Prevent duplicates across runs
- Track processed companies
- Keep clean export history

This turns a script into a lightweight lead system.

<figure style="margin:1.25rem 0 1.9rem 0;">
 <img src="/blog/images/lead generation/lead generation 05.png" alt="SQLite backed lead storage and deduplication workflow for automation reports" loading="lazy" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>Persistence matters: storage and deduplication are what turn recurring automation into an operational system.</figcaption>
</figure>

### 6. Export a Clean CSV Report

After filtering and deduplication, the best leads are exported into CSV with fields such as business name, municipality, address, phone number, website status, source information, and notes.

That makes follow up easy in spreadsheets or CRM tools.

### 7. Send the Report by Email

The final step sends the CSV report directly to my inbox. With cron scheduling, the workflow runs in the background while I focus on delivery and client communication.

Typical schedules include once every morning, once every evening, or twice per weekday depending on outreach cadence.

<figure style="margin:1.25rem 0 1.9rem 0;">
 <img src="/blog/images/lead generation/lead generation 06.png" alt="Automated reporting workflow delivering structured lead files and alerts" loading="lazy" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>When reporting is automated, lead research becomes a background system instead of a daily bottleneck.</figcaption>
</figure>

## What the Output Looks Like

A typical export includes newly registered companies that may not yet have a website.

```text
business_name, municipality, address, phone
Example Company Oy, Helsinki, Example Street 1, +358...
New Local Service Oy, Espoo, Example Road 5, +358...
Digital Start Oy, Tampere, Example Avenue 10, N/A
```

The strongest leads are usually businesses that are newly registered, have no visible website, include a public phone number, and show limited online presence.

<figure style="margin:1.25rem 0 1.9rem 0;">
 <img src="/blog/images/lead generation/lead generation 07.png" alt="Structured output example showing qualified leads prepared for outreach follow up" loading="lazy" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>The output is only useful when it is clean enough to act on immediately.</figcaption>
</figure>

## Why This Project Matters

This project matters because it solves a real business bottleneck.

Small teams often spend hours doing manual lead research. Automation makes the process faster, more consistent, and easier to repeat.

With this workflow, I can:

- Save time
- Find fresher leads
- Reduce repetitive manual research
- Focus on outreach and conversations
- Build a repeatable sales process
- Use public data in a structured, ethical way

For Luxival, this is exactly the type of practical digital system I want to build for small businesses.

<figure style="margin:1.25rem 0 1.9rem 0;">
 <img src="/blog/images/lead generation/lead generation 08.png" alt="Business growth system connecting qualified leads, outreach, and digital services delivery" loading="lazy" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>Good automation does not replace relationships. It creates space for better client conversations.</figcaption>
</figure>

## What I Learned

### 1. Automation Should Solve a Real Problem

Interesting technology is not enough. The system must solve a clear business problem.

In this case: **How can I find better web design leads with less manual work?**

### 2. Simple Tools Become Powerful Together

Python, SQLite, Linux, CSV, cron, and email are all straightforward tools. Connected properly, they create a high value workflow.

### 3. Clean Data Is More Valuable Than More Data

A shorter list of qualified leads is better than a long, noisy dataset. Filtering, cleaning, and deduplication create real value.

### 4. Ethical Lead Generation Matters

This system uses public business information only. It does not rely on private sources or intrusive scraping. The goal is professional outreach, not spam.

### 5. A Small Server Can Become a Business Asset

With the right scripts, a modest Linux VM can run collection, enrichment, storage, scoring, and reporting as a dependable operations tool.

## How This Connects to Luxival

Luxival helps small businesses improve digital presence and operations. This project aligns directly with that mission through:

- Website design and development
- SEO improvement
- Website testing and QA workflows
- Lead generation systems
- AI assisted and automation workflows
- Business process optimization

Many businesses need more than a website. They need a connected system that helps them attract customers and manage operations efficiently.

<figure style="margin:1.25rem 0 1.9rem 0;">
 <img src="/blog/images/lead generation/lead generation 09.png" alt="Luxival digital operations concept linking websites, automation, and business systems" loading="lazy" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>For small businesses, digital presence works best when websites, workflows, and follow up systems support each other.</figcaption>
</figure>

## Future Improvements

Next iterations I want to add:

### Lead Scoring

Automatic ranking based on website gap, visibility strength, industry relevance, and contact quality.

### AI Drafted Outreach

Personalized first draft outreach messages using industry, location, and visibility context.

### Web Dashboard

A simple dashboard to filter leads by city or industry and track follow up status.

### CRM Integration

A lead status flow such as New, Contacted, Interested, Follow up Needed, Converted, or Not Relevant.

### Expansion Beyond Finland

The same workflow can extend to other Nordic markets using local public registry data sources.

<figure style="margin:1.25rem 0 1.9rem 0;">
 <img src="/blog/images/lead generation/lead generation 10.png" alt="Future roadmap for Luxival automation systems including scoring, CRM, and regional expansion" loading="lazy" decoding="async" style="width:100%;height:auto;border radius:14px;display:block;" />
 <figcaption>Next phase: scoring, personalization, and CRM connected execution for faster conversion cycles.</figcaption>
</figure>

## Final Thoughts

This project was a major step in turning technical learning into a real business tool.

I did not just build a script. I built a workflow that supports sales, outreach, research, and digital operations.

For Luxival, this is the direction forward: practical web design, quality assurance, AI automation, and business systems that help small businesses work smarter.

A website is important. A smart digital workflow can create even more value.

<p style="margin top:2rem"><a href="/contact" class="btn">Discuss a Lead Generation Workflow for Your Business</a></p>
