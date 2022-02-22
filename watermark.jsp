<%@ page import="javax.imageio.ImageIO,
                 java.awt.image.BufferedImage,
                 java.awt.Graphics2D,
                 java.awt.AlphaComposite,
                 java.awt.Font,
                 java.awt.Color,
                 java.awt.font.GlyphVector,
                 java.awt.Shape,
                 java.awt.BasicStroke,
                 java.awt.geom.AffineTransform,
                 java.awt.RenderingHints,
                 java.util.*" %>

<%!
    private void draw(String text, int x, int y, Font font, Graphics2D g2, Color color) {
        BasicStroke outlineStroke = new BasicStroke(2.0f);

        AffineTransform originalTransform = g2.getTransform();
        RenderingHints originalHints = g2.getRenderingHints();

        // Move
        g2.translate(x, y);
        // create a glyph vector from your text
        GlyphVector gv = font.createGlyphVector(g2.getFontRenderContext(), text);
        // get the shape object
        Shape textShape = gv.getOutline();

        // activate anti aliasing for text rendering (if you want it to look nice)
        g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING,
                RenderingHints.VALUE_ANTIALIAS_ON);
        g2.setRenderingHint(RenderingHints.KEY_RENDERING,
                RenderingHints.VALUE_RENDER_QUALITY);

        g2.setColor(Color.WHITE);
        g2.setStroke(outlineStroke);
        g2.draw(textShape); // draw outline

        g2.setColor(color);
        g2.fill(textShape); // fill the shape

        // Restore
        g2.setTransform(originalTransform);
        g2.setRenderingHints(originalHints);
    }
%>

<%
    try {
        List<Map<String, Object>> contents = Arrays.asList(
                new HashMap<String, Object>() {{
                    put("text", "Aleen");
                    put("font", new Font(null, Font.PLAIN, 18));
                }},
                new HashMap<String, Object>() {{
                    put("text", "aleen42@vip.qq.com");
                }}
        );

        Map<String, Object> setting = new HashMap<String, Object>() {{
            put("color", "#000");
            put("degree", 12);
            put("alpha", 10);
            put("gapX", 120); // the distance between each watermark on the X pilot
            put("gapY", 90);
        }};

        float alpha = (int) setting.get("alpha") / 100f;
        double sita = Math.PI / (180f / (int) setting.get("degree"));
        double cos = Math.cos(sita);
        double sin = Math.sin(sita);
        double gapX = (int) setting.get("gapX");
        double gapY = (int) setting.get("gapY"); // the distance between each watermark on the Y pilot
        Font defaultFont = new Font(null, Font.PLAIN, 14);
        String color = setting.get("color").toString();

        BufferedImage watermarked;
        Graphics2D w;

        // Calculate the size of a rendered watermark
        watermarked = new BufferedImage(500, 500, BufferedImage.TYPE_INT_ARGB);
        w = (Graphics2D) watermarked.getGraphics();
        double fw = 0;
        double fh = 0;
        for (int i = 0; i < contents.size(); i++) {
            Map<String, Object> content = contents.get(i);
            Font f = content.get("font") != null ? (Font) content.get("font") : defaultFont;
            // 1.5x line height
            fh += (i == 0 ? 1 : 1.5) * f.getSize();
            w.setFont(f);
            fw = Math.max(fw, w.getFontMetrics().stringWidth(content.get("text").toString()));
        }
        w.dispose();

        // Calculate the size of the rendered image
        double vw = fh * sin + fw * cos + gapX;
        double vh = fh * cos + fw * sin + gapY;
        double[][] positions = {{vw / 2, 0}, {0, vh}}; // even distribution
        double maxViewX = 0;
        double maxViewY = 0;
        for (double[] position : positions) {
            maxViewX = Math.max(maxViewX, position[0]);
            maxViewY = Math.max(maxViewY, position[1]);
        }

        watermarked = new BufferedImage((int) (maxViewX + vw), (int) (maxViewY + vh), BufferedImage.TYPE_INT_ARGB);
        w = (Graphics2D) watermarked.getGraphics();
        w.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alpha));
        w.rotate(-sita);

        // Start to draw
        for (double[] position : positions) {
            double px = position[0];
            double py = position[1];
            double dx = vw * cos / 2 - vh * sin / 2 - fw / 2 + px * cos - py * sin;
            double dy = vh * cos / 2 + vw * sin / 2 - fh / 2 + py * cos + px * sin;
            for (int i = 0; i < contents.size(); i++) {
                Map<String, Object> content = contents.get(i);
                Font f = content.get("font") != null ? (Font) content.get("font") : defaultFont;
                dy += (i == 0 ? 1 : 1.5) * f.getSize();
                w.setFont(f);
                draw(content.get("text").toString(), (int) dx, (int) dy, f, w, Color.decode(color));
            }
        }

        response.reset();
        response.setContentType("image/png");
        ImageIO.write(watermarked, "png", response.getOutputStream());
        w.dispose();

        out.clear();
        pageContext.pushBody();
    } catch (Exception e) {
        e.printStackTrace();
    }
%>
