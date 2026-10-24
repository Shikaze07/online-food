import sys

c = []
BOX_SYS = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#333;fontSize=13;'
BOX_OPS = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2b3;strokeColor=#333;fontSize=13;'
START = 'rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#99e6dc;strokeColor=#333;fontSize=13;fontStyle=1;'
END = 'rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#99e6dc;strokeColor=#333;fontSize=13;fontStyle=1;'
DEC = 'rhombus;whiteSpace=wrap;html=1;fillColor=#5b86c4;strokeColor=#333;fontColor=#ffffff;fontSize=13;fontStyle=1;'


def node(i, v, s, cx, y, w=270, h=65):
    c.append('<mxCell id="%s" value="%s" style="%s" vertex="1" parent="1"><mxGeometry x="%d" y="%d" width="%d" height="%d" as="geometry"/></mxCell>' % (i, v, s, cx - w // 2, y, w, h))


n = [0]


def edge(a, b, label='', color='#000000', extra=''):
    n[0] += 1
    s = 'endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;fontSize=14;fontStyle=1;fontColor=%s;labelBackgroundColor=none;%s' % (color, extra)
    c.append('<mxCell id="ed%d" value="%s" style="%s" edge="1" parent="1" source="%s" target="%s"><mxGeometry relative="1" as="geometry"/></mxCell>' % (n[0], label, s, a, b))


# Title
c.append('<mxCell id="title" value="&lt;b&gt;FLOWCHART OF THE PROPOSED SYSTEM&lt;/b&gt;&lt;br&gt;&lt;font style=&quot;font-size: 13px; font-weight: normal; color: #555555;&quot;&gt;Online Pizza Ordering &amp;amp; Delivery Management System&lt;/font&gt;" style="text;html=1;align=center;verticalAlign=middle;fontSize=18;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="225" y="20" width="500" height="45" as="geometry"/></mxCell>')

# Main Process Flow (Center: cx = 475)
node('s', 'Start', START, 475, 85, 180, 50)
node('p1', 'Customer accesses Web / Mobile platform and logs in or registers', BOX_SYS, 475, 165)
node('p2', 'Customer browses pizza menu, selects items, and adds to cart', BOX_SYS, 475, 260)
node('p3', 'Customer proceeds to checkout &amp; selects order type (Delivery or Pick-up)', BOX_SYS, 475, 355)
node('p4', 'Customer selects payment method\n(Online Payment / E-Wallet or Cash on Delivery / Counter)', BOX_SYS, 475, 450)
node('p5', 'System verifies payment &amp; generates digital order ticket with order ID', BOX_SYS, 475, 545)
node('p6', 'Kitchen receives order notification on Kitchen Dashboard &amp; prepares pizza', BOX_OPS, 475, 640)
node('d', 'Delivery or pickup?', DEC, 475, 735, 240, 105)

# Delivery Branch (Left: cx = 190)
node('del1', 'Admin / System assigns available delivery rider to the order', BOX_OPS, 190, 880)
node('del2', 'Rider receives delivery notification, customer details, &amp; GPS route on Rider App', BOX_OPS, 190, 975, 270, 70)
node('del3', 'Rider picks up pizza and updates status to &quot;Out for Delivery&quot;', BOX_OPS, 190, 1075)
node('del4', 'Customer tracks delivery status in real-time on Web / Mobile App', BOX_SYS, 190, 1170)
node('del5', 'Rider delivers pizza, collects payment (if COD), and marks order as &quot;Delivered&quot;', BOX_OPS, 190, 1265, 270, 70)
node('del6', 'System logs completed delivery and updates customer order history', BOX_SYS, 190, 1365)
node('de', 'Completed', END, 190, 1460, 180, 50)

# Pickup Branch (Right: cx = 760)
node('pic1', 'Kitchen updates status to &quot;Ready for Pick-up&quot; in the system', BOX_OPS, 760, 880)
node('pic2', 'System automatically notifies customer that order is ready for collection', BOX_SYS, 760, 975)
node('pic3', 'Customer arrives at store counter and presents digital order ID / receipt', BOX_SYS, 760, 1070)
node('pic4', 'Customer collects pizza (pays at counter if Pay-on-Pickup)', BOX_SYS, 760, 1165)
node('pic5', 'Staff marks order as &quot;Picked Up / Completed&quot; on store dashboard', BOX_OPS, 760, 1260)
node('pic6', 'System logs completed order and records transaction in Sales Analytics', BOX_SYS, 760, 1355)
node('pe', 'Completed', END, 760, 1450, 180, 50)

# Connectors - Sequential Main Flow
for a, b in [('s', 'p1'), ('p1', 'p2'), ('p2', 'p3'), ('p3', 'p4'), ('p4', 'p5'), ('p5', 'p6'), ('p6', 'd')]:
    edge(a, b)

# Decision Branches
edge('d', 'del1', 'Delivery', '#1a6b1a', 'exitX=0;exitY=0.5;entryX=0.5;entryY=0;')
edge('d', 'pic1', 'Pickup', '#a31515', 'exitX=1;exitY=0.5;entryX=0.5;entryY=0;')

# Connectors - Delivery Flow
for a, b in [('del1', 'del2'), ('del2', 'del3'), ('del3', 'del4'), ('del4', 'del5'), ('del5', 'del6'), ('del6', 'de')]:
    edge(a, b)

# Connectors - Pickup Flow
for a, b in [('pic1', 'pic2'), ('pic2', 'pic3'), ('pic3', 'pic4'), ('pic4', 'pic5'), ('pic5', 'pic6'), ('pic6', 'pe')]:
    edge(a, b)

# Caption
c.append('<mxCell id="caption" value="&lt;b&gt;Figure: Flowchart of the Proposed Online Pizza Ordering &amp;amp; Delivery System&lt;/b&gt;" style="text;html=1;align=center;verticalAlign=middle;fontSize=15;fontStyle=1;" vertex="1" parent="1"><mxGeometry x="225" y="1540" width="500" height="30" as="geometry"/></mxCell>')

xml = ('<mxfile host="app.diagrams.net"><diagram name="Proposed System Flowchart">'
       '<mxGraphModel dx="1400" dy="1100" grid="1" gridSize="10" pageWidth="950" pageHeight="1650">'
       '<root><mxCell id="0"/><mxCell id="1" parent="0"/>' + ''.join(c) + '</root>'
       '</mxGraphModel></diagram></mxfile>')

with open('pizza-proposed-flowchart.drawio', 'w', encoding='utf-8') as f:
    f.write(xml)

print("Generated pizza-proposed-flowchart.drawio successfully!")
