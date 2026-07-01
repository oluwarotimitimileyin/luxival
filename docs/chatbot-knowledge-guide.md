# Chatbot Knowledge Base Guide

This document describes how the Luxival chatbot responds to customer inquiries and captures leads with conversation history.

## Service Categories the Bot Handles

### 1. Digital Services
**Trigger keywords:** website, web design, SEO, automation, lead generation, development

**Example responses:**
- "We design premium websites from €499 with SEO optimization. What type of site do you need?"
- "Read more: /blog/web-design-mistakes-conversion for common issues businesses face."
- "Before booking, consider: what's your brand vision, timeline, and budget range?"

**Lead capture:** When customer shows intent (provides website URL, mentions budget, or says "I want to hire")

### 2. Tourism & Transport
**Trigger keywords:** airport, transfer, Helsinki, tourism, travel, hotel, Lapland, northern lights

**Example responses:**
- "Helsinki Airport Transfer is €225 fixed. We track your flight for no-wait pickup."
- "Private rides from €90/hour. Multi-day tourism planning also available."
- "Read more: /blog/helsinki-airport-transfer-guide or /blog/finland-winter-trip-guide for seasonal tips."

**Lead capture:** When customer provides flight details, dates, or passenger info

### 3. QA & Audit
**Trigger keywords:** QA, audit, testing, Playwright, Selenium, ISTQB, quality

**Example responses:**
- "Website QA audits from €499 with actionable PDF reports. ISTQB-certified."
- "We test functionality, performance, accessibility. What issues are you noticing?"
- "Read more: /blog/website-audit-what-it-is-why-you-need-it"

**Lead capture:** When customer provides website URL or mentions "audit needed"

### 4. AI Agents
**Trigger keywords:** AI agent, automation, workflow, agentic

**Example responses:**
- "AI agent infrastructure from €800. What process do you want to automate?"
- "Read more: /blog/agentic-workflow-beginners-guide for examples of workflows we've built."

**Lead capture:** When customer describes automation needs or mentions tools/stack

## Conversation History in Lead Notifications

The `api/lead-notification.js` already supports conversation transcripts. When a lead is submitted via chat:

1. The `submitLead()` function in `js/chat-widget.js` includes `messages` array
2. `api/lead-notification.js` stores it as `body.conversation`
3. Email renders the transcript in both text and HTML formats

**Email format includes:**
```
--- Conversation Transcript ---
User: [customer's message]
Assistant: [bot's reply]
...
```

## Quick Chip Questions (Pre-configured)

The chat widget shows context-aware chips based on the current page:

**Tourism pages:** Airport transfer, Private rides, Tourism planning
**QA pages:** Website audit, Test automation, Performance test
**Services pages:** Website + SEO, AI agents, UGC content
**Portfolio pages:** Web projects, QA audit
**About pages:** Website + SEO, Airport transfer, QA audit
**Homepage/default:** Website + SEO, Airport transfer, QA audit

## Pre-booking Advisory Questions

Each service category has specific preparation questions:

| Service | Preparation Questions |
|---------|----------------------|
| Digital/Website | Brand vision, style/colors, content ready, timeline, budget |
| Tourism/Transfer | Flight/train number, pickup time, passengers, luggage, destination |
| QA/Audit | Website URL, key pages, known issues, report format |
| AI Agents | Process to automate, current tools, data sources, users, outcome goals |
| Sewing Patterns | Body measurements, garment type, fabric, fit preferences |

## Blog Recommendations by Topic

When users ask about specific topics, relevant blog posts are recommended:

- **Web design:** /blog/web-design-mistakes-conversion
- **SEO:** /blog/seo-for-finnish-businesses
- **AI:** /blog/agentic-workflow-beginners-guide
- **QA:** /blog/software-testing-qa-business-questions
- **Airport transfer:** /blog/helsinki-airport-transfer-guide
- **Northern lights:** /blog/private-northern-lights-tour-finland
- **Helsinki tours:** /blog/helsinki-private-city-tour-worth-it

## Lead Block Format

When lead is captured, the system returns:
```json
{
  "reply": "Your message here",
  "lead": {
    "service": "web-design|airport-transfer|qa-audit|etc",
    "intent": "book|inquire",
    "name": "optional",
    "email": "optional",
    "phone": "optional",
    "message": "summary"
  }
}
```

The chat widget then prompts for name/email if not provided, and sends the full conversation to `/api/lead-notification` with the lead details.

## Multi-language Support

The chatbot supports 10 languages, detected via `window.luxivalI18n.getLang()`. The lead form and all messages are translated. Conversation history is sent in the original language.