<c:set var="name" value="Aleen" />
<c:set var="email" value="aleen42@vip.qq.com" />

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
                 java.awt.RenderingHints" %>
<%!
    private void draw(String text, int x, int y, Font font, Graphics2D g2) {
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

        g2.setColor(Color.BLACK);
        g2.fill(textShape); // fill the shape

        // Restore
        g2.setTransform(originalTransform);
        g2.setRenderingHints(originalHints);
    }
%>

<%
    try {
        double width = 200;
        double height = 200;

        String name = (String) pageContext.getAttribute("name");
        String email = (String) pageContext.getAttribute("email");

        BufferedImage watermarked = new BufferedImage((int) width, (int) height, BufferedImage.TYPE_INT_ARGB);
        // initializes necessary graphic properties
        Graphics2D w = (Graphics2D) watermarked.getGraphics();

        float alpha = 0.2f;
        double sita = Math.PI / 4;
        int fontSize = 14;

        AlphaComposite alphaChannel = AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alpha);
        w.rotate(-sita);
        w.setComposite(alphaChannel);
        Font font = new Font("Arial", Font.PLAIN, fontSize);
        w.setFont(font);

        double lineHeight = 1.5 * fontSize;

        double sin = Math.sin(sita);
        double cos = Math.cos(sita);
        double fw = Math.max(w.getFontMetrics().stringWidth(name), w.getFontMetrics().stringWidth(email));
        double fh = fontSize + lineHeight;

        double dx = width / 2 * (1 - sin * cos) / cos - fw / 2 - height / 2 * sin;
        double dy = (height / 2 + width / 2) * sin - fh / 2 + fontSize * cos;

        // add text overlay to the image
        // draw name
        draw(name, (int) dx, (int) dy, font, w);
        // draw email
        draw(email, (int) dx, (int) (dy + lineHeight), font, w);

        response.reset(); //返回在流中被标记过的位置
        response.setContentType("image/png");
        ImageIO.write(watermarked, "png", response.getOutputStream());
        w.dispose();

        out.clear();
        out = pageContext.pushBody();
    } catch (Exception e) {
        e.printStackTrace();
    }
%>
