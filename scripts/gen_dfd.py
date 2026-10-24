P = [('1.0', 'Authentication'), ('2.0', 'User &amp; Rider Management'), ('3.0', 'Menu Management'),
     ('4.0', 'Order Processing'), ('5.0', 'Payment Processing'),
     ('6.0', 'Delivery Assignment &amp; Tracking'), ('7.0', 'Dashboard &amp; Sales Summary')]
c = []
n = [2]


def nid():
    n[0] += 1
    return 'c%d' % n[0]


ST = 'endArrow=classic;html=1;rounded=0;edgeStyle=orthogonalEdgeStyle;fontSize=11;labelBackgroundColor=default;'


def cell(i, v, s, x, y, w, h):
    c.append('<mxCell id="%s" value="%s" style="%s" vertex="1" parent="1"><mxGeometry x="%d" y="%d" width="%d" height="%d" as="geometry"/></mxCell>' % (i, v, s, x, y, w, h))


def edge(a, b, l, both=False, dash=False):
    s = ST + ('startArrow=classic;' if both else '') + ('dashed=1;' if dash else '')
    c.append('<mxCell id="%s" value="%s" style="%s" edge="1" parent="1" source="%s" target="%s"><mxGeometry relative="1" as="geometry"/></mxCell>' % (nid(), l, s, a, b))


ENT = 'rounded=1;arcSize=3;fillColor=#f5f5f5;strokeColor=#333;fontStyle=1;verticalAlign=middle;html=1;'
cell('admin', 'Admin&lt;br&gt;(Web)', ENT, 20, 20, 110, 1060)
cell('cust', 'Customer&lt;br&gt;(Mobile / Web)', ENT, 980, 20, 120, 520)
cell('rider', 'Rider&lt;br&gt;(Mobile / Web)', ENT, 980, 560, 120, 520)
for i, (k, t) in enumerate(P):
    cell('p%d' % (i + 1), '&lt;b&gt;%s&lt;br&gt;%s&lt;/b&gt;' % (k, t), 'ellipse;whiteSpace=wrap;html=1;fillColor=#eeeeee;strokeColor=#333;', 310, 40 + 150 * i, 280, 80)
S = [('D1', 'User', 120), ('D2', 'MenuItem', 410), ('D3', 'Order / OrderItem', 560), ('D4', 'Payment', 710), ('D5', 'Delivery', 860)]
for k, t, y in S:
    cell(k, '&lt;b&gt;%s&lt;br&gt;%s&lt;/b&gt;' % (k, t), 'shape=cylinder3;boundedLbl=1;size=8;whiteSpace=wrap;html=1;fillColor=#eeeeee;strokeColor=#333;', 680, y, 160, 55)

edge('admin', 'p1', 'Login / Session', True)
edge('p1', 'cust', 'Login / Session', True)
edge('p1', 'rider', 'Login / Session', True)
edge('p1', 'D1', 'Account &amp; Role')
edge('admin', 'p2', 'User, Rider &amp; Account Details')
edge('p2', 'D1', 'User Records', True)
edge('admin', 'p3', 'Menu Item Details')
edge('p3', 'D2', 'Menu Records', True)
edge('p3', 'cust', 'Menu &amp; Availability')
edge('cust', 'p4', 'Order Request / Status', True)
edge('admin', 'p4', 'Order Status Update', True)
edge('p4', 'D3', 'Order Records', True)
edge('D2', 'p4', 'Item Price / Availability', False, True)
edge('cust', 'p5', 'Payment Details / Receipt', True)
edge('admin', 'p5', 'Payment Status', True)
edge('p5', 'D4', 'Payment Records', True)
edge('D3', 'p5', 'Order Total', False, True)
edge('admin', 'p6', 'Rider Assignment')
edge('rider', 'p6', 'Status / Location Updates', True)
edge('p6', 'cust', 'Delivery Tracking')
edge('p6', 'D5', 'Delivery Records', True)
edge('D3', 'p6', 'Order &amp; Address', False, True)
edge('admin', 'p7', 'View Request / Summary', True)
edge('D3', 'p7', 'Order Counts', False, True)
edge('D4', 'p7', 'Revenue', False, True)

cell('lg', '', 'rounded=1;fillColor=#fafafa;strokeColor=#999;', 20, 1120, 1080, 50)
cell('l1', 'External Entity', 'rounded=1;whiteSpace=wrap;html=1;', 40, 1130, 100, 30)
cell('l2', 'Process', 'ellipse;html=1;fillColor=#eeeeee;', 180, 1130, 90, 30)
cell('l3', 'Data Store', 'shape=cylinder3;size=6;html=1;fillColor=#eeeeee;', 310, 1130, 90, 30)
cell('l4', 'Database (MySQL via Prisma): D1-D5', 'shape=note;dashed=1;html=1;fontStyle=2;fontSize=10;', 700, 1128, 260, 34)

x = ('<mxfile host="app.diagrams.net"><diagram name="DFD Level 1"><mxGraphModel dx="1200" dy="900" grid="1" pageWidth="1169" pageHeight="1300"><root>'
     '<mxCell id="0"/><mxCell id="1" parent="0"/>' + ''.join(c) + '</root></mxGraphModel></diagram></mxfile>')
open('dfd-online-food.drawio', 'w', encoding='utf8').write(x)
