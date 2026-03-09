=== POST 3: vendor-quote-comparison-template ===
TITLE: Free Vendor Quote Comparison Template (Excel & Google Sheets)
DESCRIPTION: Download our free vendor quote comparison template for Excel and Google Sheets. Includes weighted scoring, TCO calculations, and step-by-step instructions.
READING_TIME: 9 min read
DATE: 2026-03-09
CATEGORY: Tools & Templates

# Free Vendor Quote Comparison Template (Excel & Google Sheets)

You need a **vendor quote comparison template**. You've got quotes from three, four, maybe six suppliers, and you need a structured way to stack them up side by side. You've probably already tried creating one from scratch — and discovered it takes longer to build the spreadsheet than to actually evaluate the quotes.

This guide gives you a complete **quote comparison spreadsheet** design with every column, formula, and scoring mechanism you need. We'll walk through the structure in enough detail that you can build it yourself in Excel or Google Sheets in about 20 minutes. No download wall, no email gate — just the information.

## What a Good Comparison Template Actually Includes

Most quote comparison templates you'll find online are too simple. They give you a column per vendor and a row for price, and that's about it. A template that actually helps you make better decisions needs five sections:

1. **Quote metadata** — who, when, what
2. **Line item comparison** — normalized pricing
3. **Total cost of ownership** — the full picture
4. **Non-price evaluation** — weighted scoring
5. **Summary and recommendation** — the decision view

Let's build each one.

## Section 1: Quote Metadata

This section lives at the top of your spreadsheet. It captures the context you'll need when you come back to this comparison in six months wondering why you chose Vendor B.

### Columns and rows

| Field | Vendor A | Vendor B | Vendor C |
|---|---|---|---|
| Company name | | | |
| Contact name | | | |
| Contact email | | | |
| Quote number | | | |
| Quote date | | | |
| Valid until | | | |
| Payment terms | | | |
| Delivery timeline | | | |
| Warranty period | | | |

**Tip:** Highlight the "Valid until" row with conditional formatting. If the date has passed, turn the cell red. Stale quotes are a common source of problems — you think you're getting a price that no longer exists.

**Formula for Google Sheets:**
Select the "Valid until" cells and apply a custom conditional format rule: `=B5 < TODAY()` with red fill.

## Section 2: Line Item Comparison

This is the core of your template. Every item or service you're purchasing gets its own row, with each vendor's pricing in their column.

### Structure

| Line Item | Unit | Qty | Vendor A Unit Price | Vendor A Total | Vendor B Unit Price | Vendor B Total | Vendor C Unit Price | Vendor C Total |
|---|---|---|---|---|---|---|---|---|
| Item 1 | ea | 100 | | | | | | |
| Item 2 | hr | 40 | | | | | | |
| Item 3 | sqft | 500 | | | | | | |
| **Subtotal** | | | | **=SUM()** | | **=SUM()** | | **=SUM()** |

### Key principles

**Normalize units first.** The "Unit" column is your standard. If Vendor A quotes per case and a case contains 24 units, convert their price to per-unit before entering it. The whole point of this section is apples-to-apples comparison.

**Use a fixed quantity column.** Don't use each vendor's quoted quantity — use YOUR required quantity. This prevents a vendor from looking cheaper just because they quoted a different amount.

**Add a "Notes" column on the far right.** For each line item, note any vendor-specific caveats: "Vendor B price assumes minimum 500 units," "Vendor C item is refurbished, not new."

### Formulas

Each "Total" cell is simply: `= Qty * Unit Price`

The subtotal is: `=SUM(Total column range)`

For a variance column (helpful for quick scanning), add a column that shows each vendor's deviation from the lowest price:

```
= (Vendor Total - MIN(All Vendor Totals for this line)) / MIN(All Vendor Totals for this line)
```

Format this as a percentage. It instantly shows you where each vendor is above the cheapest option — and by how much.

## Section 3: Total Cost of Ownership

Below your line item subtotal, add rows for every cost that's NOT in the base quote but IS part of your actual spend. This is where the **RFQ comparison matrix** gets honest.

### Additional cost rows

| Cost Category | Vendor A | Vendor B | Vendor C |
|---|---|---|---|
| Line item subtotal (from above) | | | |
| Shipping / delivery | | | |
| Installation / setup | | | |
| Training | | | |
| Annual maintenance (Year 1) | | | |
| Consumables (Year 1) | | | |
| Insurance / compliance costs | | | |
| Environmental / disposal fees | | | |
| Early-pay discount (-) | | | |
| Small order surcharge (+) | | | |
| **Total Cost of Ownership** | **=SUM()** | **=SUM()** | **=SUM()** |

**Pro tip:** For any cell where you're estimating (the vendor didn't provide this cost), format the cell with an italic font or different background color. This tells anyone reviewing the comparison which numbers are hard quotes and which are estimates.

### The discount formula

If a vendor offers a 2% discount for payment within 10 days and you plan to take it:

```
= -(Line Item Subtotal * 0.02)
```

Enter this as a negative number so it reduces the TCO.

## Section 4: Non-Price Evaluation (Weighted Scoring)

Price is important, but it's not everything. This section lets you score vendors on qualitative factors using a **supplier evaluation scorecard** approach.

### Setting up the scoring matrix

First, define your criteria and weights. The weights should add up to 100%.

| Criteria | Weight | Vendor A Score (1-5) | Vendor A Weighted | Vendor B Score (1-5) | Vendor B Weighted | Vendor C Score (1-5) | Vendor C Weighted |
|---|---|---|---|---|---|---|---|
| Price / TCO | 35% | | | | | | |
| Quality / specifications | 20% | | | | | | |
| Delivery timeline | 15% | | | | | | |
| Warranty / support | 10% | | | | | | |
| Payment terms | 10% | | | | | | |
| Vendor reputation / references | 10% | | | | | | |
| **Total Weighted Score** | **100%** | | **=SUM()** | | **=SUM()** | | **=SUM()** |

### The scoring formula

Each "Weighted" cell: `= Weight * Score`

So if Price has a 35% weight and Vendor A scores 4 out of 5: `= 0.35 * 4 = 1.4`

The total weighted score is the sum of all weighted cells for that vendor. Maximum possible score is 5.0.

### How to score price objectively

For the price/TCO criterion, don't just guess. Use this formula to convert TCO into a 1-5 score:

- Lowest TCO = 5
- Highest TCO = 1
- Others = proportional

```
= 5 - (4 * (This Vendor TCO - Lowest TCO) / (Highest TCO - Lowest TCO))
```

This normalizes price into the same 1-5 scale as your qualitative criteria so the weighting works properly.

### Customizing weights by purchase type

The weights above are a starting point. Adjust them based on what you're buying:

**For commodity purchases** (office supplies, standard parts): Price 50%, Delivery 20%, Quality 15%, Terms 15%

**For critical equipment**: Quality 35%, Warranty 25%, Price 20%, Delivery 10%, Reputation 10%

**For professional services**: Quality 30%, Reputation 25%, Price 20%, Terms 15%, Timeline 10%

## Section 5: Summary and Recommendation

At the top of your spreadsheet (or on a separate "Summary" tab), create a dashboard view.

| Metric | Vendor A | Vendor B | Vendor C |
|---|---|---|---|
| Quoted price | | | |
| Total cost of ownership | | | |
| TCO rank | | | |
| Weighted score | | | |
| Score rank | | | |
| Quote valid until | | | |
| **Recommendation** | | | |

Use conditional formatting to highlight:
- The lowest TCO in green
- The highest weighted score in green
- Any expired quotes in red

The "Recommendation" row is where you write your decision rationale in plain language: "Vendor B recommended. 8% higher than lowest TCO but scores significantly better on warranty and has proven track record on similar projects."

## How to Customize This Template for Your Industry

### Construction and trades

Add rows for: mobilization/demobilization, permits, bonding, insurance certificates, retainage percentage, change order rates, punch list terms.

Replace "delivery timeline" with "project schedule" and add columns for start date and completion date.

### Manufacturing and production

Add rows for: tooling costs, setup/changeover fees, sample/prototype costs, MOQ, lead time by quantity tier, packaging specifications.

Add a section for quality metrics: defect rate guarantees, inspection terms, rejection handling.

### IT and software

Add rows for: implementation/migration costs, per-user licensing vs. flat rate, annual price escalation caps, SLA terms, data portability, exit/transition costs.

Replace "warranty" with "support tier" and detail response times.

### Professional services

Replace line items with: hourly rates by role, estimated hours by phase, not-to-exceed amounts, expense policies, travel costs, milestone payment schedule.

## The Limitations of Spreadsheet Comparison

This template will serve you well for straightforward comparisons with a manageable number of vendors and line items. But be honest about where it breaks down:

**Data entry is manual and error-prone.** You're re-typing numbers from PDFs and emails into cells. One transposition error (typing $1,250 instead of $1,520) can skew your entire comparison.

**It doesn't scale.** Comparing 3 vendors across 15 line items is manageable. Comparing 8 vendors across 50 line items with different units, exclusions, and terms becomes a spreadsheet nightmare.

**It's a snapshot, not a system.** Each comparison exists in isolation. You can't easily look back at what you paid last time, track pricing trends, or build institutional knowledge about your suppliers.

**Collaboration is clunky.** If multiple people need to contribute scores or review the comparison, version control becomes a problem — even with Google Sheets.

**It doesn't catch what you don't think to look for.** A spreadsheet only compares what you put into it. If one vendor has a hidden fee category that you didn't add as a row, you'll miss it.

## When to Upgrade to an Automated Tool

The spreadsheet template is the right choice when:
- You compare quotes a few times a year
- You're dealing with 3-5 vendors and under 20 line items
- You have one person managing the process
- The purchases are relatively straightforward

It's time to consider a dedicated tool when:
- You're comparing quotes monthly or more frequently
- Multiple team members are involved in evaluation
- You want to track pricing history across purchases
- The quotes you receive are complex (50+ line items, multiple formats, detailed terms)
- You need an audit trail for your purchasing decisions

Tools like [Quotal](https://quotal.app) automate the painful parts — extracting data from quote documents, normalizing line items, and building the comparison matrix — while still letting you apply your own judgment and weighting to the final decision. It's the difference between building a spreadsheet every time and having a system that learns from every comparison you run.

## Getting Started

You don't need a fancy template to start comparing quotes better. You need a consistent structure and the discipline to use it every time.

Start with the five sections outlined above. Build them in a spreadsheet. Use it for your next purchase. After two or three comparisons, you'll know exactly which sections matter most for your business and which you can simplify.

The template isn't the goal — the decision it supports is.

---

**Related reading:**
- [How to Compare Supplier Quotes: The Complete Guide](/blog/how-to-compare-supplier-quotes)
- [7 Hidden Fees Lurking in Your Vendor Quotes](/blog/hidden-fees-vendor-quotes)
- [How to Use Pricing History to Negotiate Better Supplier Deals](/blog/pricing-history-supplier-negotiation)

=== END POST 3 ===
