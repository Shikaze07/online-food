c = []

ENT = 'whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;strokeWidth=2;fontStyle=1;fontSize=12;'
ATT = 'ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontSize=10;'
REL = 'rhombus;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontSize=11;'

def vtx(i, v, s, cx, cy, w, h):
    c.append('<mxCell id="%s" value="%s" style="%s" vertex="1" parent="1"><mxGeometry x="%d" y="%d" width="%d" height="%d" as="geometry"/></mxCell>' % (i, v, s, cx - w // 2, cy - h // 2, w, h))

k = [0]
def edge(a, b, extra='endArrow=none;'):
    k[0] += 1
    c.append('<mxCell id="e%d" style="html=1;rounded=0;strokeColor=#000000;%s" edge="1" parent="1" source="%s" target="%s"><mxGeometry relative="1" as="geometry"/></mxCell>' % (k[0], extra, a, b))

# 1. ENTITIES
# Spine 1 (Left): User (x=240, y=260), Delivery (x=240, y=560)
# Spine 2 (Right): Order (x=580, y=260), OrderItem (x=580, y=560), MenuItem (x=580, y=860), Payment (x=900, y=260)
ENTITIES = {
    'User': (240, 260),
    'Delivery': (240, 560),
    'Order': (580, 260),
    'Payment': (900, 260),
    'OrderItem': (580, 560),
    'MenuItem': (580, 860),
}

for name, (cx, cy) in ENTITIES.items():
    vtx(name, name, ENT, cx, cy, 110, 38)

# 2. ATTRIBUTES (Strictly organized in clean columns / non-colliding halos)
# User attributes: left side (x=60, 140) and top (y=160, 190)
user_attrs = [
    ('id', 160, 180, True),
    ('email', 70, 150, False),
    ('password', 60, 200, False),
    ('firstName', 60, 250, False),
    ('middleName', 60, 300, False),
    ('lastName', 60, 350, False),
    ('role', 140, 340, False),
    ('phone', 140, 390, False),
    ('createdAt', 60, 400, False),
]

# Delivery attributes: left side (x=60, 140) and bottom (y=640, 680)
delivery_attrs = [
    ('id', 150, 490, True),
    ('orderId', 60, 500, False),
    ('deliveryPersonId', 60, 550, False),
    ('status', 60, 600, False),
    ('currentLocation', 120, 650, False),
    ('updatedAt', 240, 650, False),
]

# Order attributes: top side (y=130, 180)
order_attrs = [
    ('id', 480, 180, True),
    ('customerId', 470, 130, False),
    ('status', 550, 140, False),
    ('totalAmount', 640, 140, False),
    ('address', 690, 180, False),
    ('lat', 510, 90, False),
    ('lng', 600, 90, False),
    ('createdAt', 680, 90, False),
]

# Payment attributes: right side (x=1000, 1080) and top/bottom
payment_attrs = [
    ('id', 880, 180, True),
    ('orderId', 970, 180, False),
    ('method', 1040, 230, False),
    ('status', 1040, 280, False),
    ('paidAt', 920, 340, False),
]

# OrderItem attributes: right side (x=710, 790)
orderitem_attrs = [
    ('id', 710, 510, True),
    ('orderId', 800, 520, False),
    ('menuItemId', 800, 570, False),
    ('quantity', 710, 600, False),
    ('price', 800, 620, False),
]

# MenuItem attributes: right side (x=710, 790) and bottom (y=940, 980)
menuitem_attrs = [
    ('id', 460, 860, True),
    ('name', 710, 810, False),
    ('description', 800, 820, False),
    ('price', 710, 860, False),
    ('category', 800, 880, False),
    ('isAvailable', 710, 910, False),
    ('createdAt', 530, 950, False),
    ('imageUrl', 630, 950, False),
]

all_entity_attrs = [
    ('User', user_attrs),
    ('Delivery', delivery_attrs),
    ('Order', order_attrs),
    ('Payment', payment_attrs),
    ('OrderItem', orderitem_attrs),
    ('MenuItem', menuitem_attrs),
]

for ent, attrs in all_entity_attrs:
    for at, x, y, is_pk in attrs:
        aid = '%s_%s' % (ent, at)
        style = ATT + ('fontStyle=4;' if is_pk else '')
        w = 86 if len(at) > 7 else 68
        vtx(aid, at, style, x, y, w, 28)
        edge(aid, ent)

# 3. RELATIONSHIPS (All aligned directly along grid lines, ZERO crossing lines)
R = [
    ('places', 410, 260, ('User', 'ERmandOne'), ('Order', 'ERzeroToMany')),
    ('paid by', 740, 260, ('Order', 'ERmandOne'), ('Payment', 'ERzeroToOne')),
    ('contains', 580, 410, ('Order', 'ERmandOne'), ('OrderItem', 'ERmany')),
    ('lists', 580, 710, ('OrderItem', 'ERmany'), ('MenuItem', 'ERzeroToOne')),
    ('delivers', 240, 410, ('User', 'ERmandOne'), ('Delivery', 'ERzeroToMany')),
    ('fulfills', 410, 410, ('Delivery', 'ERzeroToOne'), ('Order', 'ERmandOne')),
]

for i, (nm, x, y, e1, e2) in enumerate(R):
    rid = 'R%d' % i
    vtx(rid, nm, REL, x, y, 96, 48)
    edge(e1[0], rid, 'endArrow=none;startArrow=%s;startSize=12;' % e1[1])
    edge(e2[0], rid, 'endArrow=none;startArrow=%s;startSize=12;' % e2[1])

x = ('<mxfile host="app.diagrams.net"><diagram name="ERD"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" pageWidth="1200" pageHeight="1100"><root>'
     '<mxCell id="0"/><mxCell id="1" parent="0"/>' + ''.join(c) + '</root></mxGraphModel></diagram></mxfile>')
open('pizza-erd.drawio', 'w', encoding='utf8').write(x)
