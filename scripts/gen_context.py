c = []
FONT = 'fontSize=11;'


def box(i, v, s, x, y, w, h):
    c.append('<mxCell id="%s" value="%s" style="%s" vertex="1" parent="1"><mxGeometry x="%d" y="%d" width="%d" height="%d" as="geometry"/></mxCell>' % (i, v, s, x, y, w, h))


n = [0]


def flow(label, x1, y1, x2, y2):
    n[0] += 1
    s = 'endArrow=classic;html=1;rounded=0;labelBackgroundColor=#ffffff;' + FONT
    c.append('<mxCell id="f%d" value="%s" style="%s" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="%d" y="%d" as="sourcePoint"/><mxPoint x="%d" y="%d" as="targetPoint"/></mxGeometry></mxCell>' % (n[0], label, s, x1, y1, x2, y2))


box('cust', '&lt;b&gt;CUSTOMER&lt;/b&gt;&lt;br&gt;(Mobile / Web App)', 'rounded=0;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#333;fontSize=12;', 40, 60, 170, 380)
box('sys', '&lt;b&gt;ONLINE PIZZA ORDERING &amp;amp;&lt;br&gt;DELIVERY MANAGEMENT SYSTEM&lt;/b&gt;&lt;br&gt;(Web &amp;amp; Mobile)', 'rounded=1;arcSize=8;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#333;strokeWidth=2;fontSize=12;', 400, 60, 260, 380)
box('admin', '&lt;b&gt;ADMIN&lt;/b&gt;&lt;br&gt;(Web System)', 'rounded=0;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#333;fontSize=12;', 850, 60, 170, 380)
box('rider', '&lt;b&gt;RIDER&lt;/b&gt;&lt;br&gt;(Mobile / Web App)', 'rounded=0;whiteSpace=wrap;html=1;fillColor=#f8cecc;strokeColor=#333;fontSize=12;', 400, 540, 260, 80)

Y = [95 + 38 * i for i in range(9)]
# Customer -> system
flow('Login Credentials', 210, Y[0], 400, Y[0])
flow('Registration &amp; Profile Details', 210, Y[1], 400, Y[1])
flow('Pizza Order Request &amp; Address', 210, Y[2], 400, Y[2])
flow('Payment Details', 210, Y[3], 400, Y[3])
# system -> customer
flow('Login Result &amp; Pizza Menu', 400, Y[4], 210, Y[4])
flow('Order Status &amp; Delivery Tracking', 400, Y[5], 210, Y[5])
flow('Payment Receipt &amp; Order History', 400, Y[6], 210, Y[6])
# Admin -> system
flow('Login Credentials', 850, Y[0], 660, Y[0])
flow('User &amp; Rider Details', 850, Y[1], 660, Y[1])
flow('Menu Item Details &amp; Availability', 850, Y[2], 660, Y[2])
flow('Order &amp; Payment Status Updates', 850, Y[3], 660, Y[3])
flow('Rider Assignment', 850, Y[4], 660, Y[4])
# system -> Admin
flow('Session / Login Result', 660, Y[5], 850, Y[5])
flow('Users, Riders &amp; Menu Records', 660, Y[6], 850, Y[6])
flow('Orders, Payments &amp; Deliveries', 660, Y[7], 850, Y[7])
flow('Sales Dashboard Summary', 660, Y[8], 850, Y[8])
# Rider
flow('Login Credentials &amp; Delivery Status Updates (Picked Up, On the Way, Delivered)', 560, 540, 560, 440)
flow('Assigned Delivery &amp; Customer Address', 460, 440, 460, 540)

# legend
box('lg', '', 'rounded=1;fillColor=#fafafa;strokeColor=#aaa;', 200, 680, 640, 50)
box('l1', 'External Entity', 'rounded=0;whiteSpace=wrap;html=1;fillColor=#d5e8d4;strokeColor=#333;fontSize=11;', 220, 690, 110, 30)
box('l2', 'Process', 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#333;fontSize=11;', 400, 690, 90, 30)
c.append('<mxCell id="lgf" value="Data Flow" style="endArrow=classic;html=1;fontSize=11;" edge="1" parent="1"><mxGeometry relative="1" as="geometry"><mxPoint x="590" y="705" as="sourcePoint"/><mxPoint x="720" y="705" as="targetPoint"/></mxGeometry></mxCell>')

x = ('<mxfile host="app.diagrams.net"><diagram name="Context Diagram"><mxGraphModel dx="1200" dy="900" grid="1" gridSize="10" pageWidth="1100" pageHeight="800"><root>'
     '<mxCell id="0"/><mxCell id="1" parent="0"/>' + ''.join(c) + '</root></mxGraphModel></diagram></mxfile>')
open('pizza-context-diagram.drawio', 'w', encoding='utf8').write(x)
