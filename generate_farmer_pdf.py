"""
generate_farmer_pdf.py
=============================================================
Generates high-resolution, downloadable A4 PDF:
"CropSmart_Farmer_Soil_Health_Action_Plan.pdf"
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

def generate_pdf():
    downloads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
    os.makedirs(downloads_dir, exist_ok=True)
    pdf_path = os.path.join(downloads_dir, "CropSmart_Farmer_Soil_Health_Action_Plan.pdf")

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#065f46')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#475569')
    )
    section_heading = ParagraphStyle(
        'SecHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=8,
        spaceAfter=4
    )
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#334155')
    )
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b')
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#1e293b')
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#065f46')
    )
    badge_green = ParagraphStyle(
        'BadgeGreen',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#16a34a')
    )

    story = []

    # 1. Header Table (Brand on left, Metadata on right)
    header_left = [
        Paragraph("<b>🌱 CropSmart</b>", title_style),
        Paragraph("Smart Crop Rotation & Soil Restorer Action Plan", subtitle_style),
        Paragraph("Certified P025 Agronomic Model · 782,000+ Records Analyzed", subtitle_style)
    ]
    header_right = [
        Paragraph("<b>Farmer:</b> Ramesh Kumar", meta_style),
        Paragraph("<b>Farm:</b> Coimbatore Farm (4.5 Acres)", meta_style),
        Paragraph("<b>Irrigation:</b> Drip Irrigation", meta_style),
        Paragraph("<b>Farm ID:</b> #P025-FARM-101", meta_style),
    ]

    header_table = Table([[header_left, header_right]], colWidths=[310, 210])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10b981'), spaceBefore=6, spaceAfter=10))

    # 2. Section 1: Soil Health Diagnostic & Deficiencies
    story.append(Paragraph("<b>1. Soil Health Diagnosis & Nutrient Status</b>", section_heading))
    
    soil_summary_data = [
        [
            Paragraph("<b>Overall Health Score</b>", meta_style),
            Paragraph("<b>Status Assessment</b>", meta_style),
            Paragraph("<b>Identified Critical Deficiencies</b>", meta_style)
        ],
        [
            Paragraph("<font size=16 color='#16a34a'><b>63 / 100</b></font>", body_style),
            Paragraph("<b>Moderate Depletion</b><br/><font color='#64748b' size=7.5>Requires restorative legume rotation</font>", body_style),
            Paragraph("<font color='#dc2626'><b>⚠ Low Nitrogen</b></font> (42 kg/ha vs 80 target)<br/><font color='#dc2626'><b>⚠ Low Organic Carbon</b></font> (0.52% vs 0.8% target)", body_style)
        ]
    ]
    t_summary = Table(soil_summary_data, colWidths=[120, 160, 240])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 8))

    # Soil lab test breakdown table
    soil_table_data = [
        [Paragraph("<b>Parameter</b>", table_cell_bold),
         Paragraph("<b>Measured Value</b>", table_cell_bold),
         Paragraph("<b>Optimal Range</b>", table_cell_bold),
         Paragraph("<b>Status & Impact</b>", table_cell_bold)],
        [Paragraph("Nitrogen (N)", table_cell), Paragraph("42.0 kg/ha", table_cell), Paragraph("80 - 160 kg/ha", table_cell), Paragraph("<font color='#dc2626'>Deficient - Continuous tomato harvest depleted soil N</font>", table_cell)],
        [Paragraph("Phosphorus (P)", table_cell), Paragraph("28.0 kg/ha", table_cell), Paragraph("30 - 60 kg/ha", table_cell), Paragraph("<font color='#d97706'>Sub-optimal - Root development restricted</font>", table_cell)],
        [Paragraph("Potassium (K)", table_cell), Paragraph("55.0 kg/ha", table_cell), Paragraph("60 - 120 kg/ha", table_cell), Paragraph("Adequate - Good fruit quality potential", table_cell)],
        [Paragraph("Soil pH", table_cell), Paragraph("6.50", table_cell), Paragraph("6.0 - 7.5", table_cell), Paragraph("<font color='#16a34a'>Optimal - Ideal nutrient solubility</font>", table_cell)],
        [Paragraph("Organic Carbon", table_cell), Paragraph("0.52%", table_cell), Paragraph("0.80 - 1.50%", table_cell), Paragraph("<font color='#dc2626'>Deficient - Low microbial biomass & water retention</font>", table_cell)],
    ]
    t_soil = Table(soil_table_data, colWidths=[110, 80, 95, 235])
    t_soil.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ecfdf5')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#a7f3d0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_soil)
    story.append(Spacer(1, 10))

    # 3. Section 2: Continuous Cultivation Warning
    story.append(Paragraph("<b>2. Monoculture Warning & Risk Assessment</b>", section_heading))
    mono_alert = [
        [Paragraph("<b>🚨 CONTINUOUS CULTIVATION PENALTY DETECTED (Tomato × 3 Consecutive Seasons)</b><br/>"
                   "<font color='#334155'>Tomato monoculture has depleted solanaceous micronutrients and caused early-blight pathogen spore buildup in soil. "
                   "A strict rotation restriction has been applied: <b>Tomato is penalized by -30%</b> for the upcoming season to force biological recovery.</font>", body_style)]
    ]
    t_mono = Table(mono_alert, colWidths=[520])
    t_mono.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fef2f2')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#fecaca')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_mono)
    story.append(Spacer(1, 10))

    # 4. Section 3: Recommended 3-Season Crop Rotation Sequence
    story.append(Paragraph("<b>3. Recommended 3-Season Restorative Crop Rotation</b>", section_heading))
    rot_data = [
        [
            Paragraph("<b>Season 1 (Immediate)</b>", table_cell_bold),
            Paragraph("<b>Season 2 (Restoration)</b>", table_cell_bold),
            Paragraph("<b>Season 3 (Stabilization)</b>", table_cell_bold)
        ],
        [
            Paragraph("<font size=11 color='#065f46'><b>Green Gram (Moong)</b></font><br/>"
                      "• <b>Family:</b> Legume (N-Fixer)<br/>"
                      "• <b>Duration:</b> 75 Days<br/>"
                      "• <b>Market Price:</b> ₹85/kg (Mandi)<br/>"
                      "• <b>Expected Profit:</b> ₹33,500/acre<br/>"
                      "• <b>Role:</b> Fixes 35-45 kg N/ha into soil nodules", table_cell),
            Paragraph("<font size=11 color='#065f46'><b>Groundnut</b></font><br/>"
                      "• <b>Family:</b> Legume (Restorer)<br/>"
                      "• <b>Duration:</b> 105 Days<br/>"
                      "• <b>Market Price:</b> ₹72/kg (Mandi)<br/>"
                      "• <b>Expected Profit:</b> ₹41,200/acre<br/>"
                      "• <b>Role:</b> Deep root aeration & organic matter", table_cell),
            Paragraph("<font size=11 color='#065f46'><b>Wheat / Maize</b></font><br/>"
                      "• <b>Family:</b> Cereal<br/>"
                      "• <b>Duration:</b> 115 Days<br/>"
                      "• <b>Market Price:</b> ₹23.75/kg (Mandi)<br/>"
                      "• <b>Expected Profit:</b> ₹27,300/acre<br/>"
                      "• <b>Role:</b> High biomass feeder utilizing fixed N", table_cell)
        ]
    ]
    t_rot = Table(rot_data, colWidths=[173, 173, 174])
    t_rot.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0fdf4')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#ffffff')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#86efac')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbf7d0')),
        ('PADDING', (0, 0), (-1, -1), 7),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_rot)
    story.append(Spacer(1, 10))

    # 5. Section 4: Projected Financial Returns & Soil Recovery Curve
    story.append(Paragraph("<b>4. Projected Financial Returns & Soil Health Recovery Trajectory</b>", section_heading))
    fin_data = [
        [
            Paragraph("<b>Stage</b>", table_cell_bold),
            Paragraph("<b>Crop Cultivated</b>", table_cell_bold),
            Paragraph("<b>Projected Net Profit / Acre</b>", table_cell_bold),
            Paragraph("<b>Farm Total (4.5 Ac)</b>", table_cell_bold),
            Paragraph("<b>Soil Health Score Trajectory</b>", table_cell_bold)
        ],
        [Paragraph("Current Baseline", table_cell), Paragraph("Depleted Tomato Soil", table_cell), Paragraph("—", table_cell), Paragraph("—", table_cell), Paragraph("<b>58 / 100</b> (Baseline)", table_cell)],
        [Paragraph("Season 1", table_cell), Paragraph("Green Gram (Moong)", table_cell), Paragraph("₹33,500", table_cell), Paragraph("₹1,50,750", table_cell), Paragraph("<b>65 / 100</b> (+7 recovery)", table_cell)],
        [Paragraph("Season 2", table_cell), Paragraph("Groundnut", table_cell), Paragraph("₹41,200", table_cell), Paragraph("₹1,85,400", table_cell), Paragraph("<b>72 / 100</b> (+7 recovery)", table_cell)],
        [Paragraph("Season 3", table_cell), Paragraph("Wheat / Maize", table_cell), Paragraph("₹27,300", table_cell), Paragraph("₹1,22,850", table_cell), Paragraph("<b>79 / 100</b> (Fully Restored)", table_cell)],
        [Paragraph("<b>3-Season Total</b>", table_cell_bold), Paragraph("<b>Optimized Rotation</b>", table_cell_bold), Paragraph("<b>₹1,02,000 / acre</b>", table_cell_bold), Paragraph("<b>₹4,59,000</b>", table_cell_bold), Paragraph("<font color='#16a34a'><b>79 / 100 (Optimal)</b></font>", table_cell_bold)],
    ]
    t_fin = Table(fin_data, colWidths=[90, 110, 105, 95, 120])
    t_fin.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#ecfdf5')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t_fin)
    story.append(Spacer(1, 10))

    # 6. Agronomic Action Recommendations Box
    recs_box = [
        [Paragraph("<b>🌱 Key Farmer Action Items:</b><br/>"
                   "1. <b>Inoculate Rhizobium:</b> Coat Green Gram seeds with Rhizobium bio-fertilizer to maximize atmospheric N-fixation.<br/>"
                   "2. <b>Reduce Chemical Urea by 30%:</b> Legume root nodules naturally enrich 40 kg N/ha, saving input fertilizer cost.<br/>"
                   "3. <b>Mulch Crop Residues:</b> Retain crop residues after harvest to restore organic carbon above the 0.8% threshold.", body_style)]
    ]
    t_recs = Table(recs_box, colWidths=[520])
    t_recs.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94a3b8')),
        ('PADDING', (0, 0), (-1, -1), 7),
    ]))
    story.append(t_recs)
    story.append(Spacer(1, 12))

    # 7. Verification Footer
    footer_data = [
        [
            Paragraph("<b>Certified by:</b> CropSmart P025 Automated Agronomic Engine<br/>"
                      "<font size=7 color='#64748b'>Database: 737k Mandi Trades + 19k State Harvests + 2.2k Lab Sensor Records</font>", meta_style),
            Paragraph("<b>Authorized Extension Officer:</b><br/>"
                      "____________________________________<br/>"
                      "<font size=7 color='#64748b'>Agronomy Advisory Division, Coimbatore</font>", meta_style)
        ]
    ]
    t_footer = Table(footer_data, colWidths=[310, 210])
    t_footer.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_footer)

    doc.build(story)
    print(f"Successfully generated PDF: {pdf_path} ({os.path.getsize(pdf_path):,} bytes)")

if __name__ == "__main__":
    generate_pdf()
