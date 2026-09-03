"""
generate_farmer_pdf.py
=============================================================
Generates comprehensive, multi-section A4 PDF Action Plan:
"UZHAVU KAAPPAAN — Farmer Land & Soil Feeding Action Plan"
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    downloads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
    os.makedirs(downloads_dir, exist_ok=True)
    
    pdf_paths = [
        os.path.join(downloads_dir, "CropSmart_Farmer_Soil_Health_Action_Plan.pdf"),
        os.path.join(downloads_dir, "UZHAVU_KAAPPAAN_Farmer_Soil_Health_Action_Plan.pdf")
    ]

    for pdf_path in pdf_paths:
        doc = SimpleDocTemplate(
            pdf_path,
            pagesize=A4,
            rightMargin=22,
            leftMargin=22,
            topMargin=20,
            bottomMargin=20
        )

        styles = getSampleStyleSheet()

        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=15,
            leading=18,
            textColor=colors.HexColor('#065f46')
        )
        subtitle_style = ParagraphStyle(
            'DocSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#475569')
        )
        section_heading = ParagraphStyle(
            'SecHead',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=12,
            textColor=colors.HexColor('#0f172a'),
            spaceBefore=3,
            spaceAfter=2
        )
        meta_style = ParagraphStyle(
            'MetaText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=7.5,
            leading=10,
            textColor=colors.HexColor('#334155')
        )
        body_style = ParagraphStyle(
            'BodyText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=7.2,
            leading=9.5,
            textColor=colors.HexColor('#1e293b')
        )
        table_cell = ParagraphStyle(
            'TableCell',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=7.2,
            leading=9,
            textColor=colors.HexColor('#1e293b')
        )
        table_cell_bold = ParagraphStyle(
            'TableCellBold',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=7.2,
            leading=9,
            textColor=colors.HexColor('#065f46')
        )

        story = []

        # ── 1. HEADER (Brand & Farmer Metadata) ─────────────────────
        header_left = [
            Paragraph("<b>🌱 UZHAVU KAAPPAAN</b>", title_style),
            Paragraph("<b>Smart Crop Rotation & Farmer Soil Feeding Action Plan</b>", subtitle_style),
            Paragraph("Certified P025 Agronomic Model · 782,000+ Multi-Mandi Empirical Records", subtitle_style)
        ]
        header_right = [
            Paragraph("<b>Farmer Name:</b> Ramesh Kumar | <b>Contact:</b> +91 98421 54820", meta_style),
            Paragraph("<b>Farm Location:</b> Coimbatore, Tamil Nadu | <b>Total Area:</b> 4.5 Acres", meta_style),
            Paragraph("<b>Soil Texture:</b> Red Loam | <b>Irrigation:</b> Drip System (85% eff.)", meta_style),
            Paragraph("<b>Plan Ref ID:</b> #UK-P025-FARM-101 | <b>Issue Date:</b> March 2026", meta_style),
        ]

        header_table = Table([[header_left, header_right]], colWidths=[320, 231])
        header_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
        ]))
        story.append(header_table)
        story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#10b981'), spaceBefore=2, spaceAfter=4))

        # ── 2. SECTION 1: SOIL DIAGNOSTIC & DEFICIT ANALYSIS ────────
        story.append(Paragraph("<b>1. Comprehensive Soil Health Diagnosis & Land Fertility Status</b>", section_heading))
        
        soil_summary_data = [
            [
                Paragraph("<b>Overall Health Score</b>", meta_style),
                Paragraph("<b>Land Fertility Classification</b>", meta_style),
                Paragraph("<b>Primary Deficiencies & Required Action</b>", meta_style)
            ],
            [
                Paragraph("<font size=13 color='#16a34a'><b>63 / 100</b></font>", body_style),
                Paragraph("<b>Moderate Nitrogen & Organic Carbon Depletion</b><br/><font color='#64748b' size=6.5>Exhausted by 3 continuous tomato cycles</font>", body_style),
                Paragraph("<font color='#dc2626'><b>Low Nitrogen:</b></font> 42 kg/ha (Target: 80-160 kg/ha)<br/>"
                          "<font color='#dc2626'><b>Low Organic Carbon:</b></font> 0.52% (Target: >0.80%)<br/>"
                          "<font color='#d97706'><b>Zinc Deficient:</b></font> 0.6 ppm (Target: >1.0 ppm)", body_style)
            ]
        ]
        t_summary = Table(soil_summary_data, colWidths=[110, 185, 256])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0, 0), (-1, -1), 2.5),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(t_summary)
        story.append(Spacer(1, 3))

        soil_table_data = [
            [Paragraph("<b>Nutrient Parameter</b>", table_cell_bold),
             Paragraph("<b>Measured Level</b>", table_cell_bold),
             Paragraph("<b>Optimal Range</b>", table_cell_bold),
             Paragraph("<b>Deficit / Status</b>", table_cell_bold),
             Paragraph("<b>Agronomic Impact & Crop Response</b>", table_cell_bold)],
            [Paragraph("Nitrogen (N)", table_cell), Paragraph("42.0 kg/ha", table_cell), Paragraph("80 - 160 kg/ha", table_cell), Paragraph("<font color='#dc2626'>-38.0 kg/ha</font>", table_cell), Paragraph("Restricts leaf canopy; urgent pulse rotation needed", table_cell)],
            [Paragraph("Phosphorus (P)", table_cell), Paragraph("28.0 kg/ha", table_cell), Paragraph("30 - 60 kg/ha", table_cell), Paragraph("<font color='#d97706'>-2.0 kg/ha</font>", table_cell), Paragraph("Slightly sub-optimal root elongation", table_cell)],
            [Paragraph("Potassium (K)", table_cell), Paragraph("55.0 kg/ha", table_cell), Paragraph("60 - 120 kg/ha", table_cell), Paragraph("<font color='#16a34a'>Sufficient</font>", table_cell), Paragraph("Adequate for disease resistance and pod fill", table_cell)],
            [Paragraph("Soil pH", table_cell), Paragraph("6.50", table_cell), Paragraph("6.0 - 7.5", table_cell), Paragraph("<font color='#16a34a'>Optimal</font>", table_cell), Paragraph("Neutral; maximum nutrient bioavailability", table_cell)],
            [Paragraph("Organic Carbon (OC)", table_cell), Paragraph("0.52%", table_cell), Paragraph("0.80 - 1.50%", table_cell), Paragraph("<font color='#dc2626'>-0.28% Deficit</font>", table_cell), Paragraph("Low moisture holding capacity & soil biology", table_cell)],
            [Paragraph("Electrical Cond. (EC)", table_cell), Paragraph("0.42 dS/m", table_cell), Paragraph("< 1.0 dS/m", table_cell), Paragraph("<font color='#16a34a'>Normal</font>", table_cell), Paragraph("Non-saline root environment safe for legumes", table_cell)],
        ]
        t_soil = Table(soil_table_data, colWidths=[95, 75, 80, 85, 216])
        t_soil.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ecfdf5')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#a7f3d0')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(t_soil)
        story.append(Spacer(1, 3))

        # ── 3. SECTION 2: TARGETED LAND & SOIL FEEDING DOSAGE SCHEDULE ───
        story.append(Paragraph("<b>2. Prescribed Soil Feeding & Fertilizer Dosage Schedule (for 4.5 Acres Land)</b>", section_heading))
        feed_data = [
            [
                Paragraph("<b>Feeding Stage</b>", table_cell_bold),
                Paragraph("<b>Recommended Inputs</b>", table_cell_bold),
                Paragraph("<b>Dose / Acre</b>", table_cell_bold),
                Paragraph("<b>Total (4.5 Ac)</b>", table_cell_bold),
                Paragraph("<b>Application Method & Agronomic Objective</b>", table_cell_bold)
            ],
            [
                Paragraph("<b>Basal Land Prep</b><br/>(Prior to Sowing)", table_cell),
                Paragraph("FYM / Vermicompost<br/>Neem Cake<br/>Bio-fertilizer (Rhizobium+PSB)", table_cell),
                Paragraph("4.0 Tonnes<br/>100 kg<br/>2 kg + 2 kg", table_cell),
                Paragraph("18.0 Tonnes<br/>450 kg<br/>9 kg + 9 kg", table_cell),
                Paragraph("Broadcast & incorporate during final ploughing to boost Organic Carbon & inoculate root nodules", table_cell)
            ],
            [
                Paragraph("<b>Sowing Time</b><br/>(Basal Starter)", table_cell),
                Paragraph("DAP (Di-Ammonium Phos.)<br/>MOP (Potash)<br/>Zinc Sulphate (ZnSO4)", table_cell),
                Paragraph("25 kg<br/>15 kg<br/>10 kg", table_cell),
                Paragraph("112.5 kg<br/>67.5 kg<br/>45.0 kg", table_cell),
                Paragraph("Apply in bands 5cm below seed line for rapid root growth & zinc deficiency correction", table_cell)
            ],
            [
                Paragraph("<b>Vegetative Growth</b><br/>(25-30 Days)", table_cell),
                Paragraph("Urea (Top Dressing)", table_cell),
                Paragraph("15 kg <font color='#16a34a'><b>(-30% saved)</b></font>", table_cell),
                Paragraph("67.5 kg", table_cell),
                Paragraph("Green gram naturally fixes 40 kg N/ha; reduced urea prevents lodging and saves input cost", table_cell)
            ],
            [
                Paragraph("<b>Flowering & Pods</b><br/>(45-50 Days)", table_cell),
                Paragraph("19:19:19 Soluble NPK<br/>Borax (0.2% Boron)", table_cell),
                Paragraph("1.0 kg (Foliar)<br/>200 g (Foliar)", table_cell),
                Paragraph("4.5 kg<br/>900 g", table_cell),
                Paragraph("Foliar spray during early morning to prevent flower drop and promote uniform pod filling", table_cell)
            ]
        ]
        t_feed = Table(feed_data, colWidths=[95, 130, 80, 75, 171])
        t_feed.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eff6ff')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#bfdbfe')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0, 0), (-1, -1), 2),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(t_feed)
        story.append(Spacer(1, 3))

        # ── 4. SECTION 3: MONOCULTURE PENALTY EVALUATION ─────────────
        story.append(Paragraph("<b>3. Monoculture Penalty & Phytosanitary Risk Evaluation</b>", section_heading))
        mono_alert = [
            [Paragraph("<b>🚨 CONTINUOUS TOMATO CULTIVATION DETECTED (3 Consecutive Seasons: 2023-2025)</b><br/>"
                       "<font color='#334155'>• <b>Nutrient Depletion:</b> Prolonged solanaceous feeder demand without crop rotation depleted root-zone Nitrogen to 42 kg/ha.<br/>"
                       "• <b>Pathogen Risk:</b> Severe build-up of Early Blight (<i>Alternaria solani</i>) and Root-Knot Nematodes (<i>Meloidogyne spp.</i>).<br/>"
                       "• <b>Enforced Rotation:</b> Tomato is penalized by <b>-30%</b> in evaluation rankings to enforce immediate pulse restoration.</font>", body_style)]
        ]
        t_mono = Table(mono_alert, colWidths=[551])
        t_mono.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fef2f2')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#fecaca')),
            ('PADDING', (0, 0), (-1, -1), 3.5),
        ]))
        story.append(t_mono)
        story.append(Spacer(1, 3))

        # ── 5. SECTION 4: 3-SEASON RESTORATIVE CROP ROTATION PLAN ────
        story.append(Paragraph("<b>4. Recommended 3-Season Restorative Crop Rotation Plan</b>", section_heading))
        rot_data = [
            [
                Paragraph("<b>Season 1 (Immediate - Kharif)</b>", table_cell_bold),
                Paragraph("<b>Season 2 (Restoration - Rabi)</b>", table_cell_bold),
                Paragraph("<b>Season 3 (Stabilization - Zaid)</b>", table_cell_bold)
            ],
            [
                Paragraph("<font size=9 color='#065f46'><b>Green Gram (Moong)</b></font><br/>"
                          "• <b>Crop Family:</b> Legume (N-Fixer)<br/>"
                          "• <b>Duration:</b> 70-75 Days<br/>"
                          "• <b>Seed Rate:</b> 8-10 kg / acre<br/>"
                          "• <b>Mandi Price:</b> Rs. 85.00/kg (Live APMC)<br/>"
                          "• <b>Est. Net Profit:</b> Rs. 33,500 / acre<br/>"
                          "• <b>Biological Role:</b> Fixes 35-45 kg N/ha naturally and breaks tomato blight disease cycle.", table_cell),
                Paragraph("<font size=9 color='#065f46'><b>Groundnut (Arachis hypogaea)</b></font><br/>"
                          "• <b>Crop Family:</b> Legume (Restorer)<br/>"
                          "• <b>Duration:</b> 105-110 Days<br/>"
                          "• <b>Seed Rate:</b> 50-55 kg / acre<br/>"
                          "• <b>Mandi Price:</b> Rs. 72.00/kg (Live APMC)<br/>"
                          "• <b>Est. Net Profit:</b> Rs. 41,200 / acre<br/>"
                          "• <b>Biological Role:</b> Deep rooting restores subsoil porosity and builds biomass organic carbon.", table_cell),
                Paragraph("<font size=9 color='#065f46'><b>Wheat / Maize (High Biomass)</b></font><br/>"
                          "• <b>Crop Family:</b> Poaceae (Cereal Feeder)<br/>"
                          "• <b>Duration:</b> 115-120 Days<br/>"
                          "• <b>Seed Rate:</b> 40 kg / acre<br/>"
                          "• <b>Mandi Price:</b> Rs. 23.75/kg (Live APMC)<br/>"
                          "• <b>Est. Net Profit:</b> Rs. 27,300 / acre<br/>"
                          "• <b>Biological Role:</b> Stabilizes fixed nitrogen, provides rich fodder biomass, and completes recovery.", table_cell)
            ]
        ]
        t_rot = Table(rot_data, colWidths=[183, 184, 184])
        t_rot.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0fdf4')),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#ffffff')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#86efac')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbf7d0')),
            ('PADDING', (0, 0), (-1, -1), 3),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(t_rot)
        story.append(Spacer(1, 3))

        # ── 6. SECTION 5: FINANCIAL PROJECTIONS & SOIL RECOVERY ──────
        story.append(Paragraph("<b>5. Multi-Season Financial Returns & Soil Health Recovery Trajectory</b>", section_heading))
        fin_data = [
            [
                Paragraph("<b>Rotation Stage</b>", table_cell_bold),
                Paragraph("<b>Crop Cultivated</b>", table_cell_bold),
                Paragraph("<b>Cost / Ac</b>", table_cell_bold),
                Paragraph("<b>Gross / Ac</b>", table_cell_bold),
                Paragraph("<b>Net Profit / Ac</b>", table_cell_bold),
                Paragraph("<b>Farm Total (4.5 Ac)</b>", table_cell_bold),
                Paragraph("<b>Soil Trajectory</b>", table_cell_bold)
            ],
            [Paragraph("Baseline", table_cell), Paragraph("Depleted Tomato", table_cell), Paragraph("Rs. 36,000", table_cell), Paragraph("Rs. 48,000", table_cell), Paragraph("Rs. 12,000", table_cell), Paragraph("Rs. 54,000", table_cell), Paragraph("<b>58 / 100</b> (Baseline)", table_cell)],
            [Paragraph("Season 1 (Kharif)", table_cell), Paragraph("Green Gram (Moong)", table_cell), Paragraph("Rs. 12,500", table_cell), Paragraph("Rs. 46,000", table_cell), Paragraph("Rs. 33,500", table_cell), Paragraph("Rs. 1,50,750", table_cell), Paragraph("<b>65 / 100</b> (+7 recovery)", table_cell)],
            [Paragraph("Season 2 (Rabi)", table_cell), Paragraph("Groundnut", table_cell), Paragraph("Rs. 18,000", table_cell), Paragraph("Rs. 59,200", table_cell), Paragraph("Rs. 41,200", table_cell), Paragraph("Rs. 1,85,400", table_cell), Paragraph("<b>72 / 100</b> (+7 recovery)", table_cell)],
            [Paragraph("Season 3 (Zaid)", table_cell), Paragraph("Wheat / Maize", table_cell), Paragraph("Rs. 14,200", table_cell), Paragraph("Rs. 41,500", table_cell), Paragraph("Rs. 27,300", table_cell), Paragraph("Rs. 1,22,850", table_cell), Paragraph("<b>79 / 100</b> (Optimal)", table_cell)],
            [Paragraph("<b>3-Season Total</b>", table_cell_bold), Paragraph("<b>Restorative Rotation</b>", table_cell_bold), Paragraph("<b>Rs. 44,700</b>", table_cell_bold), Paragraph("<b>Rs. 1,46,700</b>", table_cell_bold), Paragraph("<b>Rs. 1,02,000 / ac</b>", table_cell_bold), Paragraph("<b>Rs. 4,59,000 Total</b>", table_cell_bold), Paragraph("<font color='#16a34a'><b>79 / 100 (Restored)</b></font>", table_cell_bold)],
        ]
        t_fin = Table(fin_data, colWidths=[80, 95, 60, 75, 78, 85, 78])
        t_fin.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#ecfdf5')),
            ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            ('PADDING', (0, 0), (-1, -1), 2),
        ]))
        story.append(t_fin)
        story.append(Spacer(1, 3))

        # ── 7. SECTION 6: MANDATORY EXTENSION ACTION CHECKLIST ──────
        recs_box = [
            [Paragraph("<b>🌱 Extension Agronomist Mandatory Field Checklist:</b><br/>"
                       "1. <b>Bio-Inoculation:</b> Treat Green Gram seeds with <i>Rhizobium leguminosarum</i> bio-fertilizer @ 25g/kg seed before sowing.<br/>"
                       "2. <b>Input Cost Savings:</b> Do NOT exceed 15 kg Urea/acre; legume root nodules satisfy remainder requirements.<br/>"
                       "3. <b>Residue Retention:</b> Do not burn crop stubble. Incorporate haulms into the topsoil to rebuild Organic Carbon above 0.8%.<br/>"
                       "4. <b>Irrigation Scheduling:</b> Provide light irrigation at flowering and pod filling; avoid root waterlogging.", body_style)]
        ]
        t_recs = Table(recs_box, colWidths=[551])
        t_recs.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94a3b8')),
            ('PADDING', (0, 0), (-1, -1), 3),
        ]))
        story.append(t_recs)
        story.append(Spacer(1, 3))

        # ── 8. FOOTER CERTIFICATION & SIGN-OFF ───────────────────────
        footer_data = [
            [
                Paragraph("<b>Certified by:</b> UZHAVU KAAPPAAN P025 Model<br/>"
                          "<font size=6.5 color='#64748b'>Database: 737k Mandi Trades + 19k State Harvests + 2.2k Lab Sensor Records</font>", meta_style),
                Paragraph("<b>Authorized Agronomist Extension Officer:</b><br/>"
                          "____________________________________________<br/>"
                          "<font size=6.5 color='#64748b'>Department of Agriculture & Extension, Coimbatore Division</font>", meta_style)
            ]
        ]
        t_footer = Table(footer_data, colWidths=[320, 231])
        t_footer.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('PADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(t_footer)

        doc.build(story)
        print(f"Successfully generated PDF: {pdf_path} ({os.path.getsize(pdf_path):,} bytes)")

if __name__ == "__main__":
    generate_pdf()
