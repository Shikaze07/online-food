import sys
c = []
BOX = 'rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2b3;strokeColor=#333;fontSize=13;'
END = 'rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#333;fontSize=13;fontStyle=1;'
START = 'rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#99e6dc;strokeColor=#333;fontSize=13;fontStyle=1;'
DEC = 'rhombus;whiteSpace=wrap;html=1;fillColor=#5b86c4;strokeColor=#333;fontColor=#ffffff;fontSize=13;'


def node(i, v, s, cx, y, w=240, h=60):
    c.append('<mxCell id="%s" value="%s" style="%s" vertex="1" parent="1"><mxGeometry x="%d" y="%d" width="%d" height="%d" as="geometry"/></mxCell>' % (i, v, s, cx - w // 2, y, w, h))


n = [0]


def edge(a, b, label='', color='#000000', extra=''):
    n[0] += 1
    s = 'endArrow=classic;html=1;edgeStyle=orthogonalEdgeStyle;rounded=0;strokeColor=#000000;fontSize=14;fontStyle=1;fontColor=%s;labelBackgroundColor=none;%s' % (color, extra)
    c.append('<mxCell id="ed%d" value="%s" style="%s" edge="1" parent="1" source="%s" target="%s"><mxGeometry relative="1" as="geometry"/></mxCell>' % (n[0], label, s, a, b))


node('s', 'Start', START, 400, 20, 180, 50)
node('a1', 'Customer calls or visits the pizza shop', BOX, 400, 110)
node('a2', 'Customer orders pizza verbally (by phone or at the counter)', BOX, 400, 200, 260, 70)
node('a3', 'Staff writes the order and customer details on paper', BOX, 400, 300, 260, 70)
node('a4', 'Staff hands the paper ticket to the kitchen', BOX, 400, 400)
node('a5', 'Kitchen prepares the pizza', BOX, 400, 490)
node('d', 'Delivery or pickup?', DEC, 400, 580, 240, 110)

# delivery branch (left)
node('b1', 'Staff manually assigns a rider and gives the address on paper', BOX, 130, 740, 250, 70)
node('b2', 'Rider delivers the pizza and calls the customer if lost', BOX, 130, 840, 250, 70)
node('b3', 'Customer pays cash to the rider', BOX, 130, 940, 250, 60)
node('be', 'Completed', END, 130, 1040, 180, 50)
# pickup branch (right)
node('c1', 'Customer waits and picks up the pizza at the counter', BOX, 670, 740, 250, 70)
node('c2', 'Customer pays at the counter', BOX, 670, 840, 250, 60)
node('ce', 'Completed', END, 670, 940, 180, 50)

for a, b in [('s', 'a1'), ('a1', 'a2'), ('a2', 'a3'), ('a3', 'a4'), ('a4', 'a5'), ('a5', 'd'),
             ('b1', 'b2'), ('b2', 'b3'), ('b3', 'be'), ('c1', 'c2'), ('c2', 'ce')]:
    edge(a, b)
edge('d', 'b1', 'Delivery', '#1a6b1a', 'exitX=0;exitY=0.5;entryX=0.5;entryY=0;')
edge('d', 'c1', 'Pickup', '#a31515', 'exitX=1;exitY=0.5;entryX=0.5;entryY=0;')

x = ('<mxfile host="app.diagrams.net"><diagram name="Current Manual Process"><mxGraphModel dx="1200" dy="900" grid="1" gridSize="10" pageWidth="900" pageHeight="1200"><root>'
     '<mxCell id="0"/><mxCell id="1" parent="0"/>' + ''.join(c) + '</root></mxGraphModel></diagram></mxfile>')
open('pizza-manual-flowchart.drawio', 'w', encoding='utf8').write(x)
