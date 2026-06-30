package fu.se.smms.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCellEvent;
import com.lowagie.text.Rectangle;
import fu.se.smms.dto.RevenueDashboardDTO;
import fu.se.smms.dto.RevenueDashboardDTO.MonthlyRevenueItem;
import fu.se.smms.dto.RevenueDashboardDTO.TherapistUtilizationItem;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

@Service
public class ReportExportService {

    private static final Logger log = LoggerFactory.getLogger(ReportExportService.class);
    private final Locale VN_LOCALE = new Locale("vi", "VN");

    private BaseFont regular;
    private BaseFont bold;
    private BaseFont italic;

    private BaseFont base(String resource, BaseFont fallback) {
        try (InputStream is = new ClassPathResource(resource).getInputStream()) {
            byte[] bytes = is.readAllBytes();
            return BaseFont.createFont(resource, BaseFont.IDENTITY_H, BaseFont.EMBEDDED,
                    BaseFont.CACHED, bytes, null);
        } catch (Exception e) {
            log.warn("[ReportPDF] Cannot load font {}: {}", resource, e.getMessage());
            return fallback;
        }
    }

    private synchronized void ensureFonts() throws Exception {
        if (regular == null) {
            BaseFont helv = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            regular = base("fonts/arial.ttf", helv);
            bold = base("fonts/arialbd.ttf", regular);
            italic = base("fonts/timesi.ttf", regular);
        }
    }

    private String formatVnCurrency(BigDecimal val) {
        if (val == null) return "0 ₫";
        NumberFormat nf = NumberFormat.getCurrencyInstance(VN_LOCALE);
        return nf.format(val);
    }

    /**
     * Generate PDF Report of Revenue & Operations
     */
    public byte[] generateRevenueReportPdf(RevenueDashboardDTO data) {
        try {
            ensureFonts();
        } catch (Exception e) {
            log.error("[ReportPDF] Font init failed: {}", e.getMessage());
            return null;
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 44, 44);
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            // Colors
            Color brandGreen = new Color(45, 90, 39);
            Color textGrey = new Color(55, 71, 79);
            Color lightBackground = new Color(245, 245, 240);

            // Fonts
            Font fTitle = new Font(bold, 18, Font.NORMAL, brandGreen);
            Font fSubtitle = new Font(regular, 10, Font.NORMAL, textGrey);
            Font fSectionHeader = new Font(bold, 12, Font.NORMAL, brandGreen);
            Font fBodyBold = new Font(bold, 9, Font.NORMAL, textGrey);
            Font fBody = new Font(regular, 9, Font.NORMAL, textGrey);
            Font fHeaderCell = new Font(bold, 9, Font.NORMAL, Color.WHITE);

            // Header Section
            Paragraph title = new Paragraph("NGŨ SƠN RESORT & SPA", fTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            String periodStr = "NĂM " + data.getYear();
            if (data.getMonth() != null) {
                periodStr = "THÁNG " + String.format("%02d", data.getMonth()) + "/" + data.getYear();
            }
            Paragraph sub = new Paragraph("BÁO CÁO DOANH THU & HIỆU SUẤT VẬN HÀNH - " + periodStr, fSubtitle);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(15f);
            doc.add(sub);

            // 1. KPI SUMMARY TABLE (Cards style)
            PdfPTable kpiTable = new PdfPTable(3);
            kpiTable.setWidthPercentage(100);
            kpiTable.setSpacingAfter(15f);

            addKpiCell(kpiTable, "TỔNG DOANH THU", formatVnCurrency(data.getGrandTotalRevenue()), fBody, fTitle, lightBackground);
            addKpiCell(kpiTable, "CÔNG SUẤT PHÒNG", (data.getOccupancyRatePercent() != null ? data.getOccupancyRatePercent() : 0.0) + "%", fBody, fTitle, lightBackground);
            addKpiCell(kpiTable, "LƯỢT CHECK-OUT", String.valueOf(data.getTotalBookingsCheckedOut() != null ? data.getTotalBookingsCheckedOut() : 0), fBody, fTitle, lightBackground);
            doc.add(kpiTable);

            // 2. DEPARTMENT REVENUE BREAKDOWN
            Paragraph sec1Title = new Paragraph("I. DOANH THU THEO BỘ PHẬN", fSectionHeader);
            sec1Title.setSpacingAfter(5f);
            doc.add(sec1Title);

            PdfPTable revTable = new PdfPTable(new float[]{3f, 2f, 2f});
            revTable.setWidthPercentage(100);
            revTable.setSpacingAfter(15f);

            // Headers
            addHeaderCell(revTable, "Bộ Phận / Dịch Vụ", brandGreen, fHeaderCell);
            addHeaderCell(revTable, "Doanh Thu", brandGreen, fHeaderCell);
            addHeaderCell(revTable, "Tỷ Lệ", brandGreen, fHeaderCell);

            BigDecimal grandTotal = data.getGrandTotalRevenue() != null ? data.getGrandTotalRevenue() : BigDecimal.ZERO;
            double divisor = grandTotal.compareTo(BigDecimal.ZERO) > 0 ? grandTotal.doubleValue() : 1.0;

            addRevenueRow(revTable, "Phòng & Gói Nghỉ Dưỡng", data.getTotalRoomRevenue(), divisor, fBody, false);
            addRevenueRow(revTable, "Dịch Vụ Spa Trị Liệu", data.getTotalSpaRevenue(), divisor, fBody, false);
            addRevenueRow(revTable, "Thực Phẩm & Bếp Resort", data.getTotalFoodRevenue(), divisor, fBody, false);
            addRevenueRow(revTable, "Thuế & Phí Khác", data.getTotalTaxRevenue(), divisor, fBody, false);
            addRevenueRow(revTable, "TỔNG CỘNG", data.getGrandTotalRevenue(), divisor, fBodyBold, true);

            doc.add(revTable);

            // 3. MONTHLY TRENDS (Only for full year view)
            if (data.getMonth() == null && data.getMonthlyBreakdown() != null && !data.getMonthlyBreakdown().isEmpty()) {
                Paragraph sec2Title = new Paragraph("II. DIỄN BIẾN DOANH THU CÁC THÁNG", fSectionHeader);
                sec2Title.setSpacingAfter(5f);
                doc.add(sec2Title);

                PdfPTable monthlyTable = new PdfPTable(new float[]{2f, 2f, 2f, 2f, 2.5f});
                monthlyTable.setWidthPercentage(100);
                monthlyTable.setSpacingAfter(15f);

                addHeaderCell(monthlyTable, "Tháng", brandGreen, fHeaderCell);
                addHeaderCell(monthlyTable, "Gói Nghỉ Dưỡng", brandGreen, fHeaderCell);
                addHeaderCell(monthlyTable, "Dịch Vụ Spa", brandGreen, fHeaderCell);
                addHeaderCell(monthlyTable, "Ẩm Thực", brandGreen, fHeaderCell);
                addHeaderCell(monthlyTable, "Tổng Doanh Thu", brandGreen, fHeaderCell);

                for (MonthlyRevenueItem item : data.getMonthlyBreakdown()) {
                    monthlyTable.addCell(newCell(item.getLabel(), fBody, Element.ALIGN_CENTER, false));
                    monthlyTable.addCell(newCell(formatVnCurrency(item.getRoomRevenue()), fBody, Element.ALIGN_RIGHT, false));
                    monthlyTable.addCell(newCell(formatVnCurrency(item.getSpaRevenue()), fBody, Element.ALIGN_RIGHT, false));
                    monthlyTable.addCell(newCell(formatVnCurrency(item.getFoodRevenue()), fBody, Element.ALIGN_RIGHT, false));
                    monthlyTable.addCell(newCell(formatVnCurrency(item.getTotalRevenue()), fBodyBold, Element.ALIGN_RIGHT, false));
                }
                doc.add(monthlyTable);
            }

            // 4. THERAPIST UTILIZATION
            if (data.getTherapistUtilization() != null && !data.getTherapistUtilization().isEmpty()) {
                Paragraph sec3Title = new Paragraph(data.getMonth() == null ? "III. HIỆU SUẤT TRỊ LIỆU VIÊN SPA" : "II. HIỆU SUẤT TRỊ LIỆU VIÊN SPA", fSectionHeader);
                sec3Title.setSpacingAfter(5f);
                doc.add(sec3Title);

                PdfPTable therapyTable = new PdfPTable(new float[]{3f, 2f, 2.5f, 2.5f, 2f});
                therapyTable.setWidthPercentage(100);
                therapyTable.setSpacingAfter(10f);

                addHeaderCell(therapyTable, "Trị Liệu Viên", brandGreen, fHeaderCell);
                addHeaderCell(therapyTable, "Số Ca Hoàn Thành", brandGreen, fHeaderCell);
                addHeaderCell(therapyTable, "Phút Làm Việc Thực Tế", brandGreen, fHeaderCell);
                addHeaderCell(therapyTable, "Phút Đăng Ký Trực", brandGreen, fHeaderCell);
                addHeaderCell(therapyTable, "Hiệu Suất", brandGreen, fHeaderCell);

                for (TherapistUtilizationItem tu : data.getTherapistUtilization()) {
                    therapyTable.addCell(newCell(tu.getTherapistName(), fBody, Element.ALIGN_LEFT, false));
                    therapyTable.addCell(newCell(String.valueOf(tu.getTotalSessionsCompleted()), fBody, Element.ALIGN_CENTER, false));
                    therapyTable.addCell(newCell(tu.getTotalMinutesWorked() + " phút", fBody, Element.ALIGN_CENTER, false));
                    therapyTable.addCell(newCell(tu.getScheduledMinutes() + " phút", fBody, Element.ALIGN_CENTER, false));
                    therapyTable.addCell(newCell((tu.getUtilizationPercent() != null ? tu.getUtilizationPercent() : 0.0) + "%", fBodyBold, Element.ALIGN_CENTER, false));
                }
                doc.add(therapyTable);
            }

            // Signature + stamp area
            doc.add(new Paragraph(" "));
            PdfPTable sign = new PdfPTable(2);
            sign.setWidthPercentage(100);
            sign.setSpacingBefore(30f);

            // Left signature block (Người lập báo cáo)
            PdfPCell left = new PdfPCell();
            left.setBorder(0);
            left.setHorizontalAlignment(Element.ALIGN_CENTER);
            left.setPaddingTop(6f);
            
            Paragraph pLeftTitle = new Paragraph("Người lập báo cáo\n(Ký, ghi rõ họ tên)", new Font(regular, 10, Font.NORMAL, textGrey));
            pLeftTitle.setAlignment(Element.ALIGN_CENTER);
            left.addElement(pLeftTitle);
            
            Paragraph pLeftSpace = new Paragraph("\n\n\n\n\n", new Font(regular, 10, Font.NORMAL, textGrey));
            left.addElement(pLeftSpace);

            // Right signature block (Đại diện Ban Giám Đốc)
            PdfPCell right = new PdfPCell();
            right.setBorder(0);
            right.setHorizontalAlignment(Element.ALIGN_CENTER);
            right.setPaddingTop(6f);
            
            Paragraph pRightTitle = new Paragraph("Đại diện Ban Giám Đốc\n(Ký tên và đóng dấu)", new Font(regular, 10, Font.NORMAL, textGrey));
            pRightTitle.setAlignment(Element.ALIGN_CENTER);
            right.addElement(pRightTitle);

            Paragraph pSpacer = new Paragraph("\n\n\n\n\n", new Font(regular, 10, Font.NORMAL, textGrey));
            pSpacer.setAlignment(Element.ALIGN_CENTER);
            right.addElement(pSpacer);

            Paragraph pRightName = new Paragraph("Phạm Anh Tuấn", new Font(bold, 10, Font.NORMAL, textGrey));
            pRightName.setAlignment(Element.ALIGN_CENTER);
            right.addElement(pRightName);

            // Register cell event to draw signature and stamp relative to cell coordinates
            right.setCellEvent(new StampAndSignatureEvent(this));

            sign.addCell(left);
            sign.addCell(right);
            doc.add(sign);

            doc.close();
        } catch (Exception ex) {
            log.error("[ReportPDF] Write PDF error: ", ex);
            return null;
        }

        return out.toByteArray();
    }

    private void addKpiCell(PdfPTable table, String labelText, String valueText, Font fLabel, Font fVal, Color bg) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setPadding(8f);
        cell.setBorderColor(Color.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);

        Paragraph p1 = new Paragraph(labelText, fLabel);
        p1.setAlignment(Element.ALIGN_CENTER);
        cell.addElement(p1);

        Paragraph p2 = new Paragraph(valueText, fVal);
        p2.setAlignment(Element.ALIGN_CENTER);
        p2.setSpacingBefore(4f);
        cell.addElement(p2);

        table.addCell(cell);
    }

    private void addHeaderCell(PdfPTable table, String text, Color bg, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setPadding(6f);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorderColor(Color.LIGHT_GRAY);
        table.addCell(cell);
    }

    private void addRevenueRow(PdfPTable table, String dept, BigDecimal revenue, double divisor, Font font, boolean isTotal) {
        BigDecimal val = revenue != null ? revenue : BigDecimal.ZERO;
        double pct = divisor > 0 ? (val.doubleValue() / divisor) * 100.0 : 0.0;

        PdfPCell cellDept = newCell(dept, font, Element.ALIGN_LEFT, isTotal);
        PdfPCell cellVal = newCell(formatVnCurrency(val), font, Element.ALIGN_RIGHT, isTotal);
        PdfPCell cellPct = newCell(String.format("%.2f%%", pct), font, Element.ALIGN_CENTER, isTotal);

        if (isTotal) {
            Color darkBg = new Color(230, 235, 230);
            cellDept.setBackgroundColor(darkBg);
            cellVal.setBackgroundColor(darkBg);
            cellPct.setBackgroundColor(darkBg);
        }

        table.addCell(cellDept);
        table.addCell(cellVal);
        table.addCell(cellPct);
    }

    private PdfPCell newCell(String text, Font font, int alignment, boolean isBold) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5f);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setBorderColor(Color.LIGHT_GRAY);
        return cell;
    }

    /**
     * Generate Excel Report of Revenue & Operations
     */
    public byte[] generateRevenueReportExcel(RevenueDashboardDTO data) {
        Workbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            Sheet sheet = workbook.createSheet("Báo cáo vận hành");

            // Fonts & Colors setup
            java.awt.Color awtGreen = new java.awt.Color(45, 90, 39);
            byte[] greenBytes = {(byte)awtGreen.getRed(), (byte)awtGreen.getGreen(), (byte)awtGreen.getBlue()};

            org.apache.poi.xssf.usermodel.XSSFCellStyle headerStyle = (org.apache.poi.xssf.usermodel.XSSFCellStyle) workbook.createCellStyle();
            headerStyle.setFillForegroundColor(new org.apache.poi.xssf.usermodel.XSSFColor(greenBytes, null));
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 10);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);

            org.apache.poi.ss.usermodel.Font fontTitle = workbook.createFont();
            fontTitle.setBold(true);
            fontTitle.setFontHeightInPoints((short) 14);
            fontTitle.setColor(IndexedColors.DARK_GREEN.getIndex());

            CellStyle titleStyle = workbook.createCellStyle();
            titleStyle.setFont(fontTitle);

            CellStyle kpiLabelStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font fontKpiLabel = workbook.createFont();
            fontKpiLabel.setBold(true);
            kpiLabelStyle.setFont(fontKpiLabel);

            CellStyle textStyle = workbook.createCellStyle();
            textStyle.setBorderBottom(BorderStyle.THIN);
            textStyle.setBorderTop(BorderStyle.THIN);
            textStyle.setBorderRight(BorderStyle.THIN);
            textStyle.setBorderLeft(BorderStyle.THIN);

            CellStyle numberStyle = workbook.createCellStyle();
            DataFormat format = workbook.createDataFormat();
            numberStyle.setDataFormat(format.getFormat("#,##0\" đ\""));
            numberStyle.setBorderBottom(BorderStyle.THIN);
            numberStyle.setBorderTop(BorderStyle.THIN);
            numberStyle.setBorderRight(BorderStyle.THIN);
            numberStyle.setBorderLeft(BorderStyle.THIN);

            CellStyle boldNumberStyle = workbook.createCellStyle();
            boldNumberStyle.cloneStyleFrom(numberStyle);
            org.apache.poi.ss.usermodel.Font boldFont = workbook.createFont();
            boldFont.setBold(true);
            boldNumberStyle.setFont(boldFont);

            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.setAlignment(HorizontalAlignment.CENTER);
            centerStyle.setBorderBottom(BorderStyle.THIN);
            centerStyle.setBorderTop(BorderStyle.THIN);
            centerStyle.setBorderRight(BorderStyle.THIN);
            centerStyle.setBorderLeft(BorderStyle.THIN);

            CellStyle percentStyle = workbook.createCellStyle();
            percentStyle.setDataFormat(format.getFormat("0.00\"%\""));
            percentStyle.setBorderBottom(BorderStyle.THIN);
            percentStyle.setBorderTop(BorderStyle.THIN);
            percentStyle.setBorderRight(BorderStyle.THIN);
            percentStyle.setBorderLeft(BorderStyle.THIN);
            percentStyle.setAlignment(HorizontalAlignment.CENTER);

            // Row trackers
            int rowNum = 0;

            // Row 0: Company name
            Row r0 = sheet.createRow(rowNum++);
            r0.createCell(0).setCellValue("NGŨ SƠN RESORT & SPA");
            r0.getCell(0).setCellStyle(titleStyle);

            // Row 1: Title
            Row r1 = sheet.createRow(rowNum++);
            String period = "Năm " + data.getYear();
            if (data.getMonth() != null) {
                period = "Tháng " + String.format("%02d", data.getMonth()) + "/" + data.getYear();
            }
            r1.createCell(0).setCellValue("BÁO CÁO DOANH THU & HIỆU SUẤT VẬN HÀNH (" + period + ")");
            org.apache.poi.ss.usermodel.Font fontSub = workbook.createFont();
            fontSub.setItalic(true);
            fontSub.setFontHeightInPoints((short) 10);
            CellStyle subStyle = workbook.createCellStyle();
            subStyle.setFont(fontSub);
            r1.getCell(0).setCellStyle(subStyle);

            rowNum++; // Space

            // KPIs Summary
            Row rKpi1 = sheet.createRow(rowNum++);
            rKpi1.createCell(0).setCellValue("Tổng Doanh Thu:");
            rKpi1.getCell(0).setCellStyle(kpiLabelStyle);
            Cell totalRevCell = rKpi1.createCell(1);
            totalRevCell.setCellValue(data.getGrandTotalRevenue() != null ? data.getGrandTotalRevenue().doubleValue() : 0.0);
            totalRevCell.setCellStyle(numberStyle);

            Row rKpi2 = sheet.createRow(rowNum++);
            rKpi2.createCell(0).setCellValue("Công Suất Phòng:");
            rKpi2.getCell(0).setCellStyle(kpiLabelStyle);
            Cell occCell = rKpi2.createCell(1);
            occCell.setCellValue(data.getOccupancyRatePercent() != null ? data.getOccupancyRatePercent() / 100.0 : 0.0);
            occCell.setCellStyle(percentStyle);

            Row rKpi3 = sheet.createRow(rowNum++);
            rKpi3.createCell(0).setCellValue("Tổng Lượt Checkout:");
            rKpi3.getCell(0).setCellStyle(kpiLabelStyle);
            Cell checkoutsCell = rKpi3.createCell(1);
            checkoutsCell.setCellValue(data.getTotalBookingsCheckedOut() != null ? data.getTotalBookingsCheckedOut() : 0);
            checkoutsCell.setCellStyle(centerStyle);

            rowNum += 2; // Space

            // SECTION 1: REVENUE BREAKDOWN
            Row rSec1 = sheet.createRow(rowNum++);
            rSec1.createCell(0).setCellValue("I. CHI TIẾT DOANH THU BỘ PHẬN");
            rSec1.getCell(0).setCellStyle(kpiLabelStyle);

            Row rHeaders1 = sheet.createRow(rowNum++);
            rHeaders1.createCell(0).setCellValue("Bộ Phận / Dịch Vụ");
            rHeaders1.createCell(1).setCellValue("Doanh Thu");
            rHeaders1.createCell(2).setCellValue("Tỷ Lệ");
            for (int i = 0; i < 3; i++) {
                rHeaders1.getCell(i).setCellStyle(headerStyle);
            }

            BigDecimal total = data.getGrandTotalRevenue() != null ? data.getGrandTotalRevenue() : BigDecimal.ZERO;
            double div = total.compareTo(BigDecimal.ZERO) > 0 ? total.doubleValue() : 1.0;

            addExcelRevRow(sheet, rowNum++, "Phòng & Gói Nghỉ Dưỡng", data.getTotalRoomRevenue(), div, textStyle, numberStyle, percentStyle);
            addExcelRevRow(sheet, rowNum++, "Dịch Vụ Spa Trị Liệu", data.getTotalSpaRevenue(), div, textStyle, numberStyle, percentStyle);
            addExcelRevRow(sheet, rowNum++, "Thực Phẩm & Bếp Resort", data.getTotalFoodRevenue(), div, textStyle, numberStyle, percentStyle);
            addExcelRevRow(sheet, rowNum++, "Thuế & Phí Khác", data.getTotalTaxRevenue(), div, textStyle, numberStyle, percentStyle);
            addExcelRevRow(sheet, rowNum++, "TỔNG CỘNG", data.getGrandTotalRevenue(), div, boldNumberStyle, boldNumberStyle, percentStyle);

            rowNum += 2; // Space

            // SECTION 2: MONTHLY TRENDS (Only if monthly breakdown exists)
            if (data.getMonth() == null && data.getMonthlyBreakdown() != null && !data.getMonthlyBreakdown().isEmpty()) {
                Row rSec2 = sheet.createRow(rowNum++);
                rSec2.createCell(0).setCellValue("II. BIỂU DOANH THU THEO CÁC THÁNG");
                rSec2.getCell(0).setCellStyle(kpiLabelStyle);

                Row rHeaders2 = sheet.createRow(rowNum++);
                rHeaders2.createCell(0).setCellValue("Tháng");
                rHeaders2.createCell(1).setCellValue("Gói Villa");
                rHeaders2.createCell(2).setCellValue("Dịch Vụ Spa");
                rHeaders2.createCell(3).setCellValue("Ẩm Thực");
                rHeaders2.createCell(4).setCellValue("Tổng Doanh Thu");
                for (int i = 0; i < 5; i++) {
                    rHeaders2.getCell(i).setCellStyle(headerStyle);
                }

                for (MonthlyRevenueItem m : data.getMonthlyBreakdown()) {
                    Row rItem = sheet.createRow(rowNum++);
                    
                    Cell c0 = rItem.createCell(0);
                    c0.setCellValue(m.getLabel());
                    c0.setCellStyle(centerStyle);

                    Cell c1 = rItem.createCell(1);
                    c1.setCellValue(m.getRoomRevenue() != null ? m.getRoomRevenue().doubleValue() : 0.0);
                    c1.setCellStyle(numberStyle);

                    Cell c2 = rItem.createCell(2);
                    c2.setCellValue(m.getSpaRevenue() != null ? m.getSpaRevenue().doubleValue() : 0.0);
                    c2.setCellStyle(numberStyle);

                    Cell c3 = rItem.createCell(3);
                    c3.setCellValue(m.getFoodRevenue() != null ? m.getFoodRevenue().doubleValue() : 0.0);
                    c3.setCellStyle(numberStyle);

                    Cell c4 = rItem.createCell(4);
                    c4.setCellValue(m.getTotalRevenue() != null ? m.getTotalRevenue().doubleValue() : 0.0);
                    c4.setCellStyle(boldNumberStyle);
                }

                rowNum += 2; // Space
            }

            // SECTION 3: THERAPIST UTILIZATION
            if (data.getTherapistUtilization() != null && !data.getTherapistUtilization().isEmpty()) {
                Row rSec3 = sheet.createRow(rowNum++);
                String sectionIndex = (data.getMonth() == null) ? "III" : "II";
                rSec3.createCell(0).setCellValue(sectionIndex + ". HIỆU SUẤT TRỊ LIỆU VIÊN SPA");
                rSec3.getCell(0).setCellStyle(kpiLabelStyle);

                Row rHeaders3 = sheet.createRow(rowNum++);
                rHeaders3.createCell(0).setCellValue("Trị Liệu Viên");
                rHeaders3.createCell(1).setCellValue("Số Ca Hoàn Thành");
                rHeaders3.createCell(2).setCellValue("Phút Thực Tế");
                rHeaders3.createCell(3).setCellValue("Phút Trực Đăng Ký");
                rHeaders3.createCell(4).setCellValue("Hiệu Suất");
                for (int i = 0; i < 5; i++) {
                    rHeaders3.getCell(i).setCellStyle(headerStyle);
                }

                for (TherapistUtilizationItem tu : data.getTherapistUtilization()) {
                    Row rItem = sheet.createRow(rowNum++);

                    Cell c0 = rItem.createCell(0);
                    c0.setCellValue(tu.getTherapistName());
                    c0.setCellStyle(textStyle);

                    Cell c1 = rItem.createCell(1);
                    c1.setCellValue(tu.getTotalSessionsCompleted() != null ? tu.getTotalSessionsCompleted() : 0);
                    c1.setCellStyle(centerStyle);

                    Cell c2 = rItem.createCell(2);
                    c2.setCellValue((tu.getTotalMinutesWorked() != null ? tu.getTotalMinutesWorked() : 0) + " phút");
                    c2.setCellStyle(centerStyle);

                    Cell c3 = rItem.createCell(3);
                    c3.setCellValue((tu.getScheduledMinutes() != null ? tu.getScheduledMinutes() : 0) + " phút");
                    c3.setCellStyle(centerStyle);

                    Cell c4 = rItem.createCell(4);
                    c4.setCellValue(tu.getUtilizationPercent() != null ? tu.getUtilizationPercent() / 100.0 : 0.0);
                    c4.setCellStyle(percentStyle);
                }
            }

            // Adjust width of all columns
            for (int i = 0; i < 6; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            workbook.close();
        } catch (Exception ex) {
            log.error("[ReportExcel] Generate Excel Error: ", ex);
            return null;
        }

        return out.toByteArray();
    }

    private void addExcelRevRow(Sheet sheet, int rIdx, String deptName, BigDecimal revenue, double totalDiv,
                                CellStyle fontStyle, CellStyle valStyle, CellStyle percentStyle) {
        Row row = sheet.createRow(rIdx);
        Cell c0 = row.createCell(0);
        c0.setCellValue(deptName);
        c0.setCellStyle(fontStyle);

        Cell c1 = row.createCell(1);
        BigDecimal val = revenue != null ? revenue : BigDecimal.ZERO;
        c1.setCellValue(val.doubleValue());
        c1.setCellStyle(valStyle);

        Cell c2 = row.createCell(2);
        c2.setCellValue(val.doubleValue() / totalDiv);
        c2.setCellStyle(percentStyle);
    }

    private void drawStamp(PdfContentByte cb, float cx, float cy) {
        Color stampRed = new Color(196, 30, 30);
        float outer = 52f;
        float inner = 44f;
        cb.saveState();
        cb.setColorStroke(stampRed);
        cb.setColorFill(stampRed);

        // double ring
        cb.setLineWidth(2.4f);
        cb.circle(cx, cy, outer);
        cb.stroke();
        cb.setLineWidth(1.0f);
        cb.circle(cx, cy, inner);
        cb.stroke();

        // curved text - top arc (company name) and bottom arc (status)
        drawCircularText(cb, "NGU SON RESORT & SPA", cx, cy, (outer + inner) / 2f, 150f, 120f, 8.5f, true);
        drawCircularText(cb, "BAN GIAM DOC - DIRECTOR", cx, cy, (outer + inner) / 2f, 215f, 110f, 7.0f, false);

        // center 5-point star
        drawStar(cb, cx, cy, 16f, 6.4f);

        cb.restoreState();
    }

    private void drawCircularText(PdfContentByte cb, String text, float cx, float cy,
                                  float radius, float startAngleDeg, float arcSpanDeg,
                                  float fontSize, boolean topArc) {
        int n = text.length();
        if (n == 0) return;
        double start = Math.toRadians(startAngleDeg);
        double span = Math.toRadians(arcSpanDeg);
        double step = n > 1 ? span / (n - 1) : 0;
        for (int i = 0; i < n; i++) {
            String ch = String.valueOf(text.charAt(i));
            double angle = topArc ? start - i * step : start + i * step;
            float x = (float) (cx + radius * Math.cos(angle));
            float y = (float) (cy + radius * Math.sin(angle));
            double rot = topArc ? angle - Math.PI / 2 : angle + Math.PI / 2;
            float cos = (float) Math.cos(rot);
            float sin = (float) Math.sin(rot);
            cb.beginText();
            cb.setFontAndSize(regular, fontSize);
            cb.setTextMatrix(cos, sin, -sin, cos, x, y);
            cb.showText(ch);
            cb.endText();
        }
    }

    private void drawStar(PdfContentByte cb, float cx, float cy, float outer, float inner) {
        int points = 5;
        double offset = Math.PI / 2; // start pointing up
        for (int i = 0; i < points * 2; i++) {
            double r = (i % 2 == 0) ? outer : inner;
            double a = offset + i * Math.PI / points;
            float x = (float) (cx + r * Math.cos(a));
            float y = (float) (cy + r * Math.sin(a));
            if (i == 0) {
                cb.moveTo(x, y);
            } else {
                cb.lineTo(x, y);
            }
        }
        cb.closePath();
        cb.fill();
    }

    private void drawSignature(PdfContentByte cb, float x, float y) {
        Color inkBlue = new Color(20, 40, 120);
        cb.saveState();
        cb.setColorStroke(inkBlue);
        cb.setLineWidth(1.6f);
        // a flowing hand-written-like stroke using bezier curves
        cb.moveTo(x - 30, y);
        cb.curveTo(x - 18, y + 26, x - 6, y - 22, x + 6, y + 8);
        cb.curveTo(x + 14, y + 26, x + 22, y - 18, x + 38, y + 6);
        cb.stroke();
        cb.moveTo(x - 24, y - 6);
        cb.curveTo(x - 4, y - 14, x + 20, y - 14, x + 42, y - 4);
        cb.stroke();

        // Write the name "Tuấn" as part of the signature
        cb.beginText();
        cb.setFontAndSize(italic, 11);
        cb.setColorFill(inkBlue);
        cb.setTextMatrix(1.0f, 0.0f, 0.2f, 1.0f, x - 10, y + 4);
        cb.showText("Tuấn");
        cb.endText();

        cb.restoreState();
    }

    public static class StampAndSignatureEvent implements PdfPCellEvent {
        private final ReportExportService service;

        public StampAndSignatureEvent(ReportExportService service) {
            this.service = service;
        }

        @Override
        public void cellLayout(PdfPCell cell, Rectangle position, PdfContentByte[] canvases) {
            PdfContentByte cb = canvases[PdfPTable.TEXTCANVAS];
            float cx = position.getLeft() + (position.getWidth() / 2f) + 15f;
            float cy = position.getBottom() + (position.getHeight() / 2f) - 5f;

            service.drawSignature(cb, cx - 35f, cy + 15f);
            service.drawStamp(cb, cx, cy);
        }
    }
}
