package fu.se.smms.service;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import fu.se.smms.dto.InvoiceDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Generates a printable PDF invoice (receipt) for a paid invoice, including a
 * red circular company stamp (with curved text + star) and a hand-style signature,
 * so the document looks like an officially issued receipt.
 */
@Service
public class InvoicePdfService {

    private static final Logger log = LoggerFactory.getLogger(InvoicePdfService.class);
    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private static final Color BRAND = new Color(45, 90, 39);     // resort green
    private static final Color BRAND_LIGHT = new Color(232, 245, 233);
    private static final Color STAMP_RED = new Color(196, 30, 30);
    private static final Color INK_BLUE = new Color(20, 40, 120);
    private static final Color GREY = new Color(120, 120, 120);

    private BaseFont regular;
    private BaseFont bold;
    private BaseFont italic;

    private BaseFont base(String resource, BaseFont fallback) {
        try (InputStream is = new ClassPathResource(resource).getInputStream()) {
            byte[] bytes = is.readAllBytes();
            return BaseFont.createFont(resource, BaseFont.IDENTITY_H, BaseFont.EMBEDDED,
                    BaseFont.CACHED, bytes, null);
        } catch (Exception e) {
            log.warn("[InvoicePDF] Cannot load font {}: {}", resource, e.getMessage());
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

    public byte[] generateInvoicePdf(InvoiceDTO invoice) {
        try {
            ensureFonts();
        } catch (Exception e) {
            log.error("[InvoicePDF] Font init failed: {}", e.getMessage());
            return null;
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 48, 48, 54, 54);
        try {
            PdfWriter writer = PdfWriter.getInstance(doc, out);
            doc.open();

            Font hTitle = new Font(bold, 20, Font.NORMAL, BRAND);
            Font hSub = new Font(regular, 11, Font.NORMAL, GREY);
            Font label = new Font(regular, 11, Font.NORMAL, new Color(55, 71, 79));
            Font labelB = new Font(bold, 11, Font.NORMAL, new Color(55, 71, 79));

            // Header
            Paragraph title = new Paragraph("NGU SON RESORT & SPA", hTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            Paragraph sub = new Paragraph("HOA DON THANH TOAN / PAYMENT INVOICE", hSub);
            sub.setAlignment(Element.ALIGN_CENTER);
            sub.setSpacingAfter(4f);
            doc.add(sub);

            Paragraph addr = new Paragraph(
                    "Khu du lich Ngu Son - Hotline: 1900 1234 - Email: info@nguson.com",
                    new Font(regular, 9, Font.NORMAL, GREY));
            addr.setAlignment(Element.ALIGN_CENTER);
            addr.setSpacingAfter(14f);
            doc.add(addr);

            // Meta info table (invoice code, customer, dates)
            String invoiceCode = "#NS-INV-" + safe(invoice.getInvoiceId());
            String guest = nonBlank(invoice.getCustomerName(), "Quy khach");
            String room = nonBlank(invoice.getRoomNumber(), "N/A");
            String checkIn = invoice.getCheckInDate() != null ? invoice.getCheckInDate().format(DTF) : "N/A";
            String checkOut = invoice.getCheckOutDate() != null ? invoice.getCheckOutDate().format(DTF) : "N/A";
            String payTime = invoice.getPaymentTime() != null
                    ? invoice.getPaymentTime().format(DTF) : LocalDateTime.now().format(DTF);
            String method = (invoice.getVnpayTranId() != null && !invoice.getVnpayTranId().isBlank())
                    ? "VNPay (Ma GD: " + invoice.getVnpayTranId() + ")" : "Tien mat tai quay";

            PdfPTable meta = new PdfPTable(2);
            meta.setWidthPercentage(100);
            meta.setSpacingAfter(12f);
            metaRow(meta, labelB, label, "Ma hoa don:", invoiceCode, "Khach hang:", guest);
            metaRow(meta, labelB, label, "Phong:", room, "Phuong thuc TT:", method);
            metaRow(meta, labelB, label, "Nhan phong:", checkIn, "Tra phong:", checkOut);
            metaRow(meta, labelB, label, "Thoi gian TT:", payTime, "Trang thai:", "DA THANH TOAN");
            doc.add(meta);

            // Line-items table
            PdfPTable t = new PdfPTable(new float[]{6, 2});
            t.setWidthPercentage(100);
            headerCell(t, "NOI DUNG");
            headerCell(t, "SO TIEN");

            itemRow(t, regular, "Tien phong", money(invoice.getRoomSubtotal()));
            if (positive(invoice.getSpaSubtotal())) {
                itemRow(t, regular, "Dich vu Spa", money(invoice.getSpaSubtotal()));
            }
            if (positive(invoice.getFoodSubtotal())) {
                itemRow(t, regular, "Am thuc (F&B)", money(invoice.getFoodSubtotal()));
            }
            if (positive(invoice.getServiceSubtotal())) {
                itemRow(t, regular, "Dich vu khac (Giat la, Tour, ...)", money(invoice.getServiceSubtotal()));
            }
            itemRow(t, regular, "Thue & phi dich vu (10%)", money(invoice.getTaxAndFees()));
            if (positive(invoice.getDepositAmount())) {
                itemRow(t, regular, "Da dat coc", "- " + money(invoice.getDepositAmount()));
            }
            totalRow(t, bold, "TONG THANH TOAN", money(invoice.getFinalAmount()));
            doc.add(t);

            // Signature + stamp area
            doc.add(new Paragraph(" "));
            PdfPTable sign = new PdfPTable(2);
            sign.setWidthPercentage(100);
            sign.setSpacingBefore(24f);

            PdfPCell left = new PdfPCell(new Phrase("Khach hang\n(Ky, ghi ro ho ten)",
                    new Font(regular, 10, Font.NORMAL, new Color(55, 71, 79))));
            left.setBorder(0);
            left.setHorizontalAlignment(Element.ALIGN_CENTER);
            left.setPaddingTop(6f);

            PdfPCell right = new PdfPCell(new Phrase("Dai dien Ngu Son Resort & Spa\n(Da ky va dong dau)",
                    new Font(regular, 10, Font.NORMAL, new Color(55, 71, 79))));
            right.setBorder(0);
            right.setHorizontalAlignment(Element.ALIGN_CENTER);
            right.setPaddingTop(6f);

            sign.addCell(left);
            sign.addCell(right);
            doc.add(sign);

            // Draw stamp + handwritten signature on the right signature block
            PdfContentByte cb = writer.getDirectContent();
            float stampX = doc.right() - 95;
            float stampY = doc.bottom() + 120;
            drawSignature(cb, stampX - 40, stampY + 30);
            drawStamp(cb, stampX, stampY);

            // Footer note
            Paragraph foot = new Paragraph(
                    "Cam on Quy khach da su dung dich vu tai Ngu Son Resort & Spa. "
                    + "Hoa don nay duoc phat hanh tu dong sau khi thanh toan hoan tat.",
                    new Font(italic, 9, Font.ITALIC, GREY));
            foot.setAlignment(Element.ALIGN_CENTER);
            foot.setSpacingBefore(60f);
            doc.add(foot);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("[InvoicePDF] Generation failed: {}", e.getMessage(), e);
            try { if (doc.isOpen()) doc.close(); } catch (Exception ignored) {}
            return null;
        }
    }

    // ---------- table helpers ----------

    private void metaRow(PdfPTable table, Font labelFont, Font valueFont,
                         String l1, String v1, String l2, String v2) {
        table.addCell(pair(labelFont, valueFont, l1, v1));
        table.addCell(pair(labelFont, valueFont, l2, v2));
    }

    private PdfPCell pair(Font labelFont, Font valueFont, String l, String v) {
        Phrase p = new Phrase();
        p.add(new com.lowagie.text.Chunk(l + " ", labelFont));
        p.add(new com.lowagie.text.Chunk(v, valueFont));
        PdfPCell c = new PdfPCell(p);
        c.setBorder(0);
        c.setPaddingBottom(4f);
        return c;
    }

    private void headerCell(PdfPTable t, String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, new Font(bold, 11, Font.NORMAL, Color.WHITE)));
        c.setBackgroundColor(BRAND);
        c.setPadding(7f);
        c.setHorizontalAlignment(text.startsWith("SO") ? Element.ALIGN_RIGHT : Element.ALIGN_LEFT);
        t.addCell(c);
    }

    private void itemRow(PdfPTable t, BaseFont f, String name, String amount) {
        PdfPCell c1 = new PdfPCell(new Phrase(name, new Font(f, 11, Font.NORMAL, new Color(55, 71, 79))));
        c1.setPadding(7f);
        c1.setBorderColor(BRAND_LIGHT);
        PdfPCell c2 = new PdfPCell(new Phrase(amount, new Font(f, 11, Font.NORMAL, new Color(55, 71, 79))));
        c2.setPadding(7f);
        c2.setBorderColor(BRAND_LIGHT);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        t.addCell(c1);
        t.addCell(c2);
    }

    private void totalRow(PdfPTable t, BaseFont f, String name, String amount) {
        PdfPCell c1 = new PdfPCell(new Phrase(name, new Font(f, 13, Font.NORMAL, BRAND)));
        c1.setPadding(9f);
        c1.setBackgroundColor(BRAND_LIGHT);
        PdfPCell c2 = new PdfPCell(new Phrase(amount, new Font(f, 14, Font.NORMAL, BRAND)));
        c2.setPadding(9f);
        c2.setBackgroundColor(BRAND_LIGHT);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        t.addCell(c1);
        t.addCell(c2);
    }

    // ---------- vector drawing: stamp & signature ----------

    private void drawStamp(PdfContentByte cb, float cx, float cy) {
        float outer = 52f;
        float inner = 44f;
        cb.saveState();
        cb.setColorStroke(STAMP_RED);
        cb.setColorFill(STAMP_RED);

        // double ring
        cb.setLineWidth(2.4f);
        cb.circle(cx, cy, outer);
        cb.stroke();
        cb.setLineWidth(1.0f);
        cb.circle(cx, cy, inner);
        cb.stroke();

        // curved text - top arc (company name) and bottom arc (status)
        drawCircularText(cb, "NGU SON RESORT & SPA", cx, cy, (outer + inner) / 2f, 150f, 120f, 8.5f, true);
        drawCircularText(cb, "DA THANH TOAN - PAID", cx, cy, (outer + inner) / 2f, 215f, 110f, 7.5f, false);

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
        cb.saveState();
        cb.setColorStroke(INK_BLUE);
        cb.setLineWidth(1.6f);
        // a flowing hand-written-like stroke using bezier curves
        cb.moveTo(x - 30, y);
        cb.curveTo(x - 18, y + 26, x - 6, y - 22, x + 6, y + 8);
        cb.curveTo(x + 14, y + 26, x + 22, y - 18, x + 38, y + 6);
        cb.stroke();
        cb.moveTo(x - 24, y - 6);
        cb.curveTo(x - 4, y - 14, x + 20, y - 14, x + 42, y - 4);
        cb.stroke();
        cb.restoreState();
    }

    // ---------- value helpers ----------

    private boolean positive(BigDecimal v) {
        return v != null && v.signum() > 0;
    }

    private String money(BigDecimal v) {
        return String.format("%,.0f VND", v == null ? BigDecimal.ZERO : v);
    }

    private String safe(Object v) {
        return v == null ? "" : v.toString();
    }

    private String nonBlank(String v, String def) {
        return (v == null || v.isBlank()) ? def : v;
    }
}
